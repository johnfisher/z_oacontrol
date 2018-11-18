
#!/usr/bin/env python 

import logging
import fcntl
import os
import popen2
import select
import signal
import sys
import time
import os.path
from Globals import *
from shutil import copyfile
from transaction import commit
from twisted.internet import reactor, defer
from xml.dom.minidom import Document
from xml.dom.minidom import parse, parseString
from Products.ZenUtils.CyclingDaemon import CyclingDaemon
from Products.ZenCollector.scheduler import Scheduler
from Products.ZenEvents.ZenEventClasses import *

log = logging.getLogger("zen.zxchassisdaemon")  

# DICT2XML
class dict2xml(object):
     
    # Converts dictionary to XML format..
    log.info("dict2xml")
        
    doc = Document()
    
    def __init__(self, structure):
        if len(structure) == 1:
            rootName    = str(structure.keys()[0])
            self.root   = self.doc.createElement(rootName)
            self.doc.appendChild(self.root)
            self.build(self.root, structure[rootName])
 
    def build(self, father, structure):
        if type(structure) == dict:
            for k in structure:
                tag = self.doc.createElement(k)
                father.appendChild(tag)
                self.build(tag, structure[k])
        elif type(structure) == list:
            grandFather = father.parentNode
            tagName = father.tagName
            grandFather.removeChild(father)
            for l in structure:
                tag = self.doc.createElement(tagName)
                self.build(tag, l)
                grandFather.appendChild(tag)
        else:
            data = str(structure)
            tag = self.doc.createTextNode(data)
            father.appendChild(tag)

    def cleanup(self):
	self.doc.unlink()
	
    def display(self):
        print self.doc.toprettyxml(indent="  ") 
        
    def dump(self):
        return self.doc.toprettyxml(indent="  ") 

# ZXCHASSISDAEMON
class zxchassisdaemon(CyclingDaemon):

    """
    Znyx Daemon to maintain chassis view.
    """
    name = 'zxchassisdaemon'
    
    # Filename paths
    # This is how to find daemon's directory & then files relative to it: 
    #fileDir = os.path.dirname(__file__)       
    #fileName = fileDir + "/conf/zxchassisdaemon.conf"    
    zxdevicesFileName = os.environ['ZENHOME'] + "/zxdevice.xml"
    tempdevicesFileName = os.environ['ZENHOME'] + "/new_zxdevice.xml"
    zxchassisFileName = os.environ['ZENHOME'] + "/zxchassis.xml" 
    cmdPrefix = os.environ['ZENHOME']
    
    # Chassis modeling arrays
    ports = []
    slots = []
  
    # Board status
    boardRemoved = 0
    boardAdded = 1
    boardHotSwap = 2
    boardUnchanged = 3  
    
    # Globals used in numbering boards.
    num1900Base = 1
    num1900Fabric = 1
    num7300 = 1
    numZXSBC = 1
    
    # Class definitions
    
    shelfMgrClass = "ShelfMgr"
    zxsbcClass = "ZXSBC"
    znyxPrefix = "/Network/OASwitch/"
    nonZnyxPrefix = "/Network/"
    
    # MStates
    
    none_MState = 0
    
    def __init__(self, *args, **kwargs):

        CyclingDaemon.__init__(self, *args, **kwargs) 

        log.info("zxchassisdaemon __init__")
             
        # Set up slots dictionary
        self.slots=[None]*self.options.numSlots  
        for slotNum in range (0, len(self.slots)):
            self.slots[slotNum] = {'ip' : eval("self.options.slot%s_IP" % slotNum)}
        
        # Set up ports dictionary
	# self.ports = [x[:] for x in [["down"]*self.options.maxPorts]*self.options.numSlots]
	
        # Set up current model of the chassis using data from Shelf Manager        
	self.setup_chassis(self.slots)
	
	# Either do first-time initialization or get device properties.

        doInit = True
	devices = self.dmd.Devices.getSubDevices()
	if devices:		
            for device in self.dmd.Devices.getSubDevices():
                groups = device.getDeviceGroupNames()
                for a in range (0,len(groups)):
                    if groups[a].find(self.options.chassisName) != -1:
                        doInit = False
                        break
                if doInit == False:
	            break
	
	#if os.path.isfile(self.zxdevicesFileName) or os.path.isfile(self.zxchassisFileName):
            #self.doInit = False

        if (doInit == True):
            log.info("__init__ first-time initialization")
     
            # Determine the class of the device in each slot.
            # NOTE: Must call setup_chassis first. See above.
     
            self.get_device_classes(self.slots)
            
            # Generate a name for each device
            # NOTE: Class needed to generate name.
            for slotNum in range (0,len(self.slots)):
		 self.get_device_name(self.slots[slotNum])
 
            # If zxdevice.xml doesn't exist, have Zenoss generate it.
     
            if (os.path.isfile(self.zxdevicesFileName) == False):
	        os.system( self.cmdPrefix + "/bin/zendevicedump -o %s" % self.zxdevicesFileName)
	  
            # Read and parse zxdevice.xml.
            
            deviceFile = open(self.zxdevicesFileName)
            deviceDoc = parse(deviceFile)
            deviceFile.close()
               
            # Generate device for each IP address.

            for slotNum in range (0,len(self.slots)):
	        self.add_device(deviceDoc, self.slots[slotNum])	  

            # Output document.

            tempFile = open(self.tempdevicesFileName, 'w')
            deviceDoc.writexml(tempFile)
            tempFile.close() 
     
            # Upload zxdevice.xml to Zenoss
            if (os.path.isfile(self.tempdevicesFileName) == True):
	        os.system( self.cmdPrefix + "/bin/zendeviceload -i %s" % self.tempdevicesFileName)

            # Delete the temporary file.
            os.remove(self.tempdevicesFileName)

            # Need to commit changes prior to setting properties.
            commit()
   
            # Set device properties via Zenoss: SLOT, NAME, SERIAL NUMBER.
            self.set_device_properties()
            
            # Generate zxdevices.xml to reflect new configuration.
            os.system( self.cmdPrefix + "/bin/zendevicedump -o %s" % self.zxdevicesFileName) 
        else:
            log.info("__init__ not first-time initialization")
            
            # Use Zenoss device info to set up slots.
            self.get_device_properties()
            
	# Initialize the ports dictionary
	log.info("before setup_znyxSlot")
        self.setup_znyxSlot(self.slots)	
	
        self.schedule = Scheduler(self.options)

        self.schedule.sendEvent = self.dmd.ZenEventManager.sendEvent

        self.schedule.monitor = self.options.monitor

        self.sendEvent(dict(
            device=self.options.monitor, component="zxchassisdaemon",
            eventClass='/App/Znyx', severity=0, summary="zxchassisdaemon started"))

    def add_device(self, doc, slotInfo):
     
        #Add device to XML document.
        log.info("add_device")
    
        # Retrieve slot class & IP address.
        devClass = slotInfo['class']
        devIP = slotInfo['ip']
    
        # If this is an empty slot then return.
        if devClass == None:
	    return
	 
        # Check to see if a device of this class has already been created.
    
        tomanycontEl = None
    
        for element in doc.getElementsByTagName('object'):
            id = element.getAttribute("id")
            if (id == devClass):
	        for child in element.getElementsByTagName('tomanycont'):
	            tomanycontEl = child	

        # Create elements and set their attributes.

        if (tomanycontEl == None):
            tomanycontEl = doc.createElement("tomanycont")
            tomanycontEl.setAttribute("id", "devices")
    
        objectEl = doc.createElement("object")
        objectEl.setAttribute("class","Device")
        objectEl.setAttribute("id", devIP)
        objectEl.setAttribute("module","Products.ZenModel.Device")
 
        tooneEl = doc.createElement("toone")
        tooneEl.setAttribute("id", "perfServer")
        tooneEl.setAttribute("objid", "/zport/dmd/Monitors/Performance/localhost")

        tomanyEl = doc.createElement("tomany")
        tomanyEl.setAttribute("id", "groups")
  
        linkEl = doc.createElement("link")
        linkEl.setAttribute("objid", "/zport/dmd/Groups/" + self.options.chassisName)
    
        # Create element parent/child relationships.
  
        tomanyEl.appendChild(linkEl)
        objectEl.appendChild(tooneEl)
        objectEl.appendChild(tomanyEl)
        tomanycontEl.appendChild(objectEl)
    
        # Insert the new structure into the document.
    
        for element in doc.getElementsByTagName('object'):
            id = element.getAttribute("id")
            if (id == devClass):
                element.appendChild(tomanycontEl)

    def add_dmd_device(self, ip, name, path, group, slot, serial):
	 
        #Add device to Zenoss via dmd.
        log.info("add_dmd_device")
        
        self.dmd.DeviceLoader.loadDevice(name, path,
            "", serial,               # tag, serialNumber,
            "","", None,       	# zSnmpCommunity, zSnmpPort, zSnmpVer,
            slot, 1000, "",  	# rackSlot, productionState (1000=Production), comments,
            "", "",        	# hwManufacturer, hwProductName,
            "", "",        	# osManufacturer, osProductName.
            "", [group], [], 	# locationPath,groupPaths,systemPaths,
            "localhost","none")   # performanceMonitor, discoverProto
 
        d=self.dmd.Devices.findDevice(name)
        d.setManageIp(ip)
        commit()
        d.collectDevice()

    def buildOptions(self):
        CyclingDaemon.buildOptions(self)
         
        self.parser.add_option('--numSlots',
                               dest='numSlots',
                               type='int',
                               help='Number of slots in chassis',
                               default=0)
        self.parser.add_option('--maxPorts',
                               dest='maxPorts',
                               type='int',
                               help='Number of ports in chassis',
                               default=0)
        self.parser.add_option('--chassisName',
                               dest='chassisName',
                               type='string',
                               help='Number of slots in chassis',
                               default="1900")                              
        self.parser.add_option('--slot0_IP',
                               dest='slot0_IP',
                               type='string',
                               help='IP Address of Slot0')
        self.parser.add_option('--slot1_IP',
                               dest='slot1_IP',
                               type='string',
                               help='IP Address of Slot1')
        self.parser.add_option('--slot2_IP',
                               dest='slot2_IP',
                               type='string',
                               help='IP Address of Slot2')
        self.parser.add_option('--slot3_IP',
                               dest='slot3_IP',
                               type='string',
                               help='IP Address of Slot3')
        self.parser.add_option('--slot4_IP',
                               dest='slot4_IP',
                               type='string',
                               help='IP Address of Slot4')
        self.parser.add_option('--slot5_IP',
                               dest='slot5_IP',
                               type='string',
                               help='IP Address of Slot5')

    def clearSlot(slotNum):
	 
	# Clear up slot entry for removed or hot swapped board.
	log.info("clearSlot")
	
	slotInfo = self.slots[slotNum]
	slotInfo['name'] = None
	slotInfo['class'] = None
	slotInfo['serial'] = None
	slotInfo['mState'] = "0"
	
	# NOTE: Switch to zero-based numbering in dictionary?
	for a in range(1,slotInfo['numPorts']):
	     if slotInfo['port'+str(a-1)]:
		  del slotInfo['port'+str(a-1)]

    def get_device_classes(self, slots):
	 
        #Determine the device classes.
        log.info("get_device_classes")
    
        # Set up ShelfMgr in Slot 0   
        slotInfo = slots[0]
        slotInfo['class'] = "ShelfMgr"
    
        # Set up the rest of the slots.
        for slotNum in range (1,len(slots)):
	    slotInfo = slots[slotNum]
            ip = slotInfo['ip']
        
            # If this is an empty slot then continue.
            if slotInfo['serial'] == None:
		slotInfo['class'] = None
	        continue

            # NOTE: Kludge for 1900. Delete code.
            if ip == "10.2.0.215":	        
                slotInfo['class'] = "ZX1900FabricDevice"
                continue
 
            # NOTE: Kludge for 1900. Delete code.
            if ip == "10.2.0.155":
                slotInfo['class'] = "ZX1900BaseDevice"
                continue
	   
            # Try to get name from 1900Base
            #val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.14.21.0'))
            #if val != "":
                #slotInfo['class'] = "ZX1900BaseDevice"
            #else:	
                # Try to get name from 1900Fabric		
                #val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.15.21.0'))
                #if val != "":
                    #slotInfo['class'] = "ZX1900FabricDevice"		      
                #else:
            #NOTE: Indent following block after uncommenting code above.
            # Try to get name from 7300
            val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.17.21.0'))
            if val != "":
                slotInfo['class'] = "ZX7300"
            else:
		# Assume this is a ZXSBC device.
                slotInfo['class'] = "ZXSBC"
		    
    def get_device_name (self, slotInfo):
	 
        # Return name for specified device. The algorithem is <class>_<deviceNumber>.
        log.info("get_device_name")

        # If this is an empty slot then continue.
        if slotInfo['serial'] == None:
	    slotInfo['name'] = None
	    return

        # Initialize data   
        slotInfo['name'] = ""
 	ip = slotInfo['ip']
 	
        # Return if class hasn't been set. Can't determine name.
        if slotInfo['class'] == None:
	    log.info("class not set for ip =%s" % ip)
	    return	     
	
        if slotInfo['class'] == "ShelfMgr":
            slotInfo['name'] = "SHMM"
        elif slotInfo['class'] == "ZX1900FabricDevice":
	    # NOTE: Kludge for 1900...remove comments
	    #val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.15.21.0'))
            #if val != "":
                #slotInfo['name'] = "%s_%s" % (val,str(self.num1900Fabric))
	    slotInfo['name'] = "ZX1900B-A1_%s" % (str(self.num1900Fabric))
	    self.num1900Fabric += 1
	elif slotInfo['class'] == "ZX1900BaseDevice":
	    # NOTE: Kludge for 1900...remove comments
	    #val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.14.21.0'))
            #if val != "":
                #slotInfo['name'] = "%s_%s" % (val,str(self.num1900Base)) 
	    slotInfo['name'] = "ZX1900A-A1_%s" % (str(self.num1900Base))
	    self.num1900Base += 1
	elif slotInfo['class'] == "ZX7300":
            val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.17.21.0'))
            if val != "":
                slotInfo['name'] = "%s_%s" % (val,str(self.num7300))
		self.num7300 += 1
	elif slotInfo['class'] == "ZXSBC":
	    slotInfo['name'] = "%s_%s" % ("ZXSBC",str(self.numZXSBC))
	    self.numZXSBC += 1
	else:
	     log.info("unknown class %s" % slotInfo['class'])

    def get_device_properties(self):
	 
        #Retrieve device attributes from Zenoss and store in local data structure (slots).
        log.info("get_device_properties")     

        for device in self.dmd.Devices.getSubDevices():
            groups = device.getDeviceGroupNames()
            for a in range (0,len(groups)):
                if groups[a].find(self.options.chassisName) != -1:
                    slot = device.rackSlot
                    slotWords = (str(slot)).split()
                    slotNum = int(slotWords[len(slotWords)-1]) 
                    serialNum = device.getHWSerialNumber()
                    if serialNum == None:
		        serialNum = ""
                    name = device.getDeviceName()
                    ip = device.getManageIp()
                    classPath = device.getDeviceClassPath()
                    classPath.strip()
                    classes = classPath.split('/')
                    className = classes[len(classes)-1]
                             
                    # NOTE: Kludge for 1900. Delete code.
                    if slotNum == 1: 
		        if (name.find("ZX1900BaseDevice") != -1) or (ip == self.options.slot2_IP):
			    log.info("resetting slot to 2")
		            slotNum = 2
		     
                    # Store info in slots
                    slotInfo = self.slots[slotNum]
                    slotInfo['ip'] = ip
                    slotInfo['name'] = name 
                    slotInfo['class'] = className
                    slotInfo['serial'] = serialNum
                    
    def get_snmp_value(self, cmd, timeout=2.5):

	# Run SNMP get and spit out the output.
	
        child = None
        rtnVal = ""
    
        try:
            try:       
                child = popen2.Popen4(cmd)
                flags = fcntl.fcntl(child.fromchild, fcntl.F_GETFL)
                fcntl.fcntl(child.fromchild, fcntl.F_SETFL, flags | os.O_NDELAY)
                endtime = time.time() + timeout
                pollPeriod = 1
                firstPass = True
                while time.time() < endtime and (firstPass or child.poll()==-1):
                    firstPass = False
                    r, w, e = select.select([child.fromchild],[],[], pollPeriod)
                    if r:
                        t = child.fromchild.read()
                        #We are sometimes getting to this point without any data
                        # from child.fromchild. I don't think that should happen
                        # but the conditional below seems to be necessary.
                        if t:
                            t = t.strip('\n')
                            cmds = t.split(' ')
                            if cmds[0].find('Timeout') != -1:
        			rtnVal = ""
        		    else:
			        snmpVal = cmds[len(cmds)-1]
			        if snmpVal.find("SNMP") != -1:
				    rtnVal = ""
                                elif snmpVal.count('"'):
			            rtnVal = snmpVal.strip('"')
			        else:
			            rtnVal = snmpVal
                        
                if child.poll() == -1:
                    log.info("Command timed out for %s" % cmd + " (timeout is %s seconds)" % timeout)
                
            except:
                log.info("Error running command type: %s  value: %s " % tuple(sys.exc_info()[:2]))
            
        finally:
            if child and child.poll() == -1:
                os.kill(child.pid, signal.SIGKILL)
            
        return rtnVal

    def process_config_changes(self):
	 
        #Determine if chassis or Zenoss configuration has changed and process any changes.
        log.info("process_config_changes") 

        # CHASSIS CHANGES
        newSlots=[None]*self.options.numSlots
        slotStatus=[None]*self.options.numSlots 
     
        # Initialize IP addresses in new table.
        for slotNum in range (0,len(self.slots)):
                newSlots[slotNum] = {'ip': self.slots[slotNum]['ip']}
        
        # Derive the device class from the device itself. Then get the latest serial number and 
        # mState from the shelf manager.
        # NOTE: Order is important. Call setup_chassis before get_device_names.

        self.setup_chassis(newSlots)
        self.get_device_classes(newSlots)
    
        for slotNum in range (1,len(newSlots)): 

            newSlotInfo = newSlots[slotNum]
            slotInfo = self.slots[slotNum]
        
            # Error condition. Neither of these will be empty.      
            if newSlotInfo == None or slotInfo == None:
		# Generate event
	        self.sendEvent(dict(
                    device=self.options.monitor, component="zxchassisdaemon",
                    eventClass='/App/Znyx', severity=4, summary="zxchassisdaemon: Empty slot info (internal data)"))
	        continue	

            # Retrieve serial number and mState.
            newSerial = newSlotInfo['serial']
            newMState = int(newSlotInfo['mState'])
            newClass = newSlotInfo['class']

            oldSerial = slotInfo['serial']
            oldMState = int(slotInfo['mState'])
            oldClass = slotInfo['class']
 
            if newMState == self.none_MState:
                if oldMState == self.none_MState or oldClass == None or oldSerial == None:               
		    # No Change -- slot still empty.
		    slotStatus[slotNum] = self.boardUnchanged 		  
	        else:	
		    # Board Removed.
		    slotStatus[slotNum] = self.boardRemoved 
            else:
	        if ((oldMState == self.none_MState) or (oldClass == None) or (oldSerial == None)):
		    # Board Added
		    slotStatus[slotNum] = self.boardAdded             
		    log.info("BOARD ADDED: newSerial = %s, newMState= %s, newClass= %s" % (newSerial, newMState, newClass))
		    log.info("oldSerial = %s, oldMState= %s, oldClass= %s" % (oldSerial, oldMState, oldClass))
	        elif (newSerial != oldSerial) or (newClass != oldClass):		
		    # Hot Swap
		    slotStatus[slotNum] = self.boardHotSwap 
		    log.info("BOARD HOTSWAP: newSerial = %s, newMState= %s, newClass= %s" % (newSerial, newMState, newClass))
		    log.info("oldSerial = %s, oldMState= %s, oldClass= %s" % (oldSerial, oldMState, oldClass))
                else:		
		    # No Change
		    slotStatus[slotNum] = self.boardUnchanged 
 		       
        # ZENOSS CHANGES

        foundDevices=[False]*self.options.numSlots  
        
        for device in self.dmd.Devices.getSubDevices():  
            groups = device.getDeviceGroupNames()
            for a in range (0,len(groups)):
                if groups[a].find(self.options.chassisName) != -1:
                    slot = device.rackSlot
                    slotWords = (str(slot)).split()
                    slotNum = int(slotWords[len(slotWords)-1])                  
                
                    serialNum = device.getHWSerialNumber()
                    name = device.getDeviceName()
                    ip = device.getManageIp()
                    classPath = device.getDeviceClassPath()
                    classPath.strip()
                    classes = classPath.split('/')
                    className = classes[len(classes)-1]
                    
                    # NOTE: Kludge for 1900. Delete code.
                    if slotNum == 1: 
		        if (className.find("ZX1900BaseDevice") != -1) or (ip == self.options.slot2_IP):
			    log.info("resetting slot to 2")
		            slotNum = 2
                    foundDevices[slotNum] = True
                    
                    # User could have changed slot, serial, ip, name or class.
                    # Zenoss modeling will reset slot & serial, so don't worry about these.
                
                    # User not allowed to change IP address in first release. 
                    # Change it back & generate event.
                    # NOTE: Test changing IP later.
                    if (ip != self.slots[slotNum]['ip']) and (ip != newSlots[slotNum]['ip']):
                        log.info("process_config_changes: user changed manage IP to %s" % ip)
                        log.info("slotNum = %s" % slotNum)
                        log.info("self ip = %s" % self.slots[slotNum]['ip'])
                        log.info("new ip = %s" % newSlots[slotNum]['ip'])
                        device.setManageIp(newSlots[slotNum]['ip'])
                        self.sendEvent(dict(
                            device=self.options.monitor, component="zxchassisdaemon",
                            eventClass='/App/Znyx', severity=4, 
                            summary=("zxchassisdaemon: User changed device %s mgt IP address." % name)))

                    # User not allowed to change class.
                    # Change it back & generate event.
                    if className != self.slots[slotNum]['class'] and className != newSlots[slotNum]['class']:
                        log.info("process_config_changes: user changed device class to %s" % className)
                        if (newSlots[slotNum]['class'] == self.shelfMgrClass) or (newSlots[slotNum]['class'] == self.zxsbcClass):
                            prefix = self.nonZnyxPrefix
	                else:
		            prefix = self.znyxPrefix		 
	                newClassPath = prefix + newSlots[slotNum]['class']
	                log.info("slotNum = %s" % slotNum)
	                log.info("newClassPath = %s" % newClassPath)
                        device.moveDevices(newClassPath,device.id)
                        self.sendEvent(dict(
                            device=self.options.monitor, component="zxchassisdaemon",
                            eventClass='/App/Znyx', severity=4, 
                            summary=("zxchassisdaemon: User changed device class to %s." % className)))
                 
                    # User can change name...This is OK. Just update internal tables.
                    newSlots[slotNum]['name'] = name
                     
        for slotNum in range (1,len(newSlots)): 
    
            status = slotStatus[slotNum]
                 
            if status == None:
                continue
	   
	    # Check for case where user might have deleted a valid device in Zenoss.
	    # This would be a user error that should be corrected.
	    
	    if (status == self.boardUnchanged):
		if (newSlots[slotNum]['class'] != None) and (foundDevices[slotNum] == False):
		    status = self.boardAdded
		else:
		     continue
       
            if status == self.boardRemoved: 
                if devicesFound[slotNum] == True:
                    device = self.dmd.Devices.findDevice(self.slots[slotNum]['ip']) 
                    # Delete device.
                    if not device:
		        log.info("cannot find device in slot %s to delete" % slotNum)
		    else:     
		        device.deleteDevice()
                        commit()
                self.clearSlot(slotNum)
            else:	     
	        newSlotInfo = newSlots[slotNum]	    
	        newIp = newSlotInfo['ip']
	        #newName = newSlotInfo['name']
	        newClass = newSlotInfo['class']
	        newSerial = newSlotInfo['serial']

    	        if (newClass == self.shelfMgrClass) or (newClass == self.zxsbcClass):
                    prefix = self.nonZnyxPrefix
	        else:
	            prefix = self.znyxPrefix
		
	        newClassPath = prefix + newClass

	        if (status == self.boardAdded):
		    # Get new name.
		    self.get_device_name(newSlotInfo)
		    newName = newSlotInfo['name']
		    
		    # Add new device via Zenoss.
		    log.info("add for boardAdded")
                    self.add_dmd_device(newIp, newName, newClassPath, self.options.chassisName, slotNum, newSerial)
	        else:
		    # Hot Swap
                    # If different class, then delete old device and add new one.
                    # Otherwise, generate event.
 
                    if (newClass != self.slots[slotNum]['class']):
			if foundDevices[slotNum] == True:
		            device = self.dmd.Devices.findDevice(self.slots[slotNum]['ip'])
		            if not device:
			        log.info("cannot find device in slot %s to delete" % slotNum)
			    else:
		                device.deleteDevice()
		                commit()
		        self.clearSlot(slotNum)
		        
		        # Get new name.
		        self.get_device_name(newSlotInfo)
		        newName = newSlotInfo['name']
		        log.info("add for hotswap: slotNum=%s, newIP=%s, newClass = %s, slots['class']= %s" % (slotNum, newIp, newClass,self.slots[slotNum]['class']))
                        # Add new device via Zenoss
		        self.add_dmd_device(newIp, newName, newClassPath, self.options.chassisName, slotNum, newSerial)
                    else:
		        # Generate event.
                        self.sendEvent(dict(
                            device=self.options.monitor, component="zxchassisdaemon",
                            eventClass='/App/Znyx', severity=2, 
                            summary=("zxchassisdaemon: Hot swap in slot = %s." % str(slotNum))))
                            
                self.slots[slotNum]['ip'] = newIp 
	        self.slots[slotNum]['name'] = newSlotInfo['name']
	        self.slots[slotNum]['class'] = newClass
	        self.slots[slotNum]['serial'] = newSerial

        self.dmd.Devices.reIndex()
        commit()

    def set_device_properties(self):
	 
        #Use local data structure (slots) to set device attributes in Zenoss.
        log.info("set_device_properties")
    
        modificationFlag = False
        
        # Set serial number, slot & name.
        # Zenoss will overwrite serial number & slot for Znyx devices.
        # So, only set these values for ZXSBC devices.
        # NOTE: Add error handling & logging.

        for device in self.dmd.Devices.getSubDevices():
	    
            for slotNum in range (0,len(self.slots)):
                
                slotInfo = self.slots[slotNum]
                         
                # Skip empty slots
                if slotInfo['serial'] == None:
		    continue
	    
                if slotInfo['ip'] == device.getManageIp():
        	    if device.id != slotInfo['name']:
                        device.renameDevice(slotInfo['name'])
                    manf = device.getOSManufacturerName()
                    if not manf.find("Znyx") != -1:
                        device.setHWSerialNumber(slotInfo['serial'])
                        device.rackSlot = slotNum
                    modificationFlag = True

        if (modificationFlag == True):
	    self.dmd.Devices.reIndex()
            commit()  

    def setup_chassis(self, slots):
	 
	# Initialize chassis info.
        log.info("setup_chassis")
        
        # Set up Shelf Manager. It's always in Slot 0.
    
        slotInfo = slots[0]
        slotInfo['serial'] = "0"
        shelfManagerIP = slotInfo['ip']
     
        # Get info from the ShelfManager about each of the slots.
     
        for slotNum in range (1,len(slots)):
	    
	    # NOTE: 1900 Kludge. Delete code.
	    if slotNum == 2:
		 slots[2]['serial'] = slots[1]['serial']
		 slots[2]['mState'] = slots[1]['mState']
		 if slots[1]['mState'] == "0":
		      slots[2]['name'] = None
		      slots[2]['class'] = None
		 continue
	    
	    slotInfo = slots[slotNum]
	    #deviceIdOid = '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.%s' % slotNum
	    mstateOid = '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.%s' % slotNum
	    serialOid = '.1.3.6.1.4.1.16394.2.1.1.32.1.17.%s' % slotNum
	
	    # Get M state and store as an integer
	    val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, mstateOid))    
	    slotInfo['mState'] = val
	    if val == "" or int(val) == 0:
	        # Board not present, so reset class and name and set serial number to None.
	        slotInfo['name'] = None
	        slotInfo['class'] = None
	        slotInfo['serial'] = None
	        slotInfo['mState'] = "0"
	    else:     
	        # Get serial number
	        val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, serialOid))
	        slotInfo['serial'] = val  

    def setup_znyxSlot(self, slots):
	 
        #Initialize port info.
        log.info("setup_znyxSlot")
        
        # NOTE: After one timeout/error on an SNMP, everything is set to default values.
        # Is there a better way to handle this? 
        for slotNum in range (1,len(slots)):
	  
	    slotInfo = slots[slotNum]
            slotIp = slotInfo['ip']	 
	    timeout = False
	
	    devClass = slotInfo['class']
	    if devClass == "ZX1900BaseDevice":
	        devOID = 14
	        slotInfo['numPorts'] = 26
	    elif devClass == "ZX1900FabricDevice":
	        devOID = 15
	        slotInfo['numPorts'] = 20
	    elif devClass == "ZX7300":
	        devOID = 17
	        slotInfo['numPorts'] = 28
	    else:
	        # Not a ZNYX board or empty slot.
	        slotInfo['numPorts'] = 0
	        continue
	     
	    # Get Led Status
	    intOID = '.1.3.6.1.4.1.688.2.3.%s.3.0' % devOID
	    val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, intOID))
	    if val == "":
	        ledVal = "off"
	        timeout = True
	    elif val == 1:
	        ledVal = "off"
	    else:
	        ledVal = "on"
	    slotInfo['intLED'] = ledVal

            if timeout == False:
	        extOID = '.1.3.6.1.4.1.688.2.3.%s.5.0' % devOID
	        val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, extOID))
	    else:
	        val = ""
	     
	    if val == "":
	        ledVal = "off"
	        timeout = True	     
	    elif val ==1:
	        ledVal = "off"
	    else:
	        ledVal = "on"
	    slotInfo['extLED'] = ledVal 
     
	    # Get Link Status
     
	    # NOTE: Switch to zero-based numbering in dictionary?
	    for a in range(1,slotInfo['numPorts']):
	        if timeout == False:
	            linkOID = '.1.3.6.1.4.1.688.2.3.%s.7.1.2.' % devOID
	            val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, linkOID + str(a)))
	        else:
		    val = ""
	        if val == "":
		    linkVal = "down"
		    timeout = True
	        elif val == 1:
	            linkVal = "up"
	        else:
	            linkVal = "down"
	        slotInfo['port'+str(a-1)] = linkVal	  


    def finish_loop(self):
	if self.options.cycle:
	    self.sendHeartbeat()
            reactor.callLater(self.options.cycletime, self.runCycle)     
            
    def main_loop(self):
        
        log.info("zxchassisdaemon: main_loop")
      
        log.info("self.slots = %s" % self.slots)      	     
     
        # Handle any changes, including Hot Swap, to the chassis configuration.
        self.process_config_changes()
    
        # Dump Zenoss device configuration to zxdevices.xml
        os.system("/usr/local/zenoss/zenoss/bin/zendevicedump -o %s" % self.zxdevicesFileName)  

        # Generate internal tables from SNMP gets.
        self.setup_znyxSlot(self.slots)
	     
        # Output data to zxchassis.xml
        
        startStr = "{\'zx2000\':{"
        endStr = "}}"
        dictionaryStr = startStr + "\'chassis\':chassis,"
        chassis = self.slots[0]
        for slotNum in range (1,len(self.slots)):
	    slotStr = "\'slot%s\':self.slots[%s]" % (slotNum,slotNum)
	    dictionaryStr += slotStr
	    if slotNum == (len(self.slots) - 1):
	        dictionaryStr += endStr
	    else:
		dictionaryStr += ","
        dictionary = eval(dictionaryStr)
        xml = dict2xml(dictionary)
        
        chassisFile = open(self.zxchassisFileName,'w')
        chassisFile.write(xml.dump())
        chassisFile.close()   
        xml.cleanup()
        del xml 
        
        self.finish_loop()

    def runCycle(self):
        try:
            start = time.time()
            self.syncdb()
            self.main_loop()
        except:
            log.exception("zxchassisdaemon: unexpected exception")
            reactor.callLater(self.options.cycletime, self.runCycle)
      
if __name__=='__main__':

# Zope magic ensues!

  cd = zxchassisdaemon(None, None)
  log.info("zxchassisdaemon start")
  cd.run()
  
