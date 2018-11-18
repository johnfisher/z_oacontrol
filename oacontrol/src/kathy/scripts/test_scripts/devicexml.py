
#!/usr/bin/env python

import difflib
import logging
import os
import re
import shutil
import sys
import time
import os.path
import Globals

from xml.dom.minidom import Document
from xml.dom.minidom import parse, parseString

from Products.ZenUtils.Utils import zenPath
from Products.ZenUtils.ZenScriptBase import ZenScriptBase
from transaction import commit
from shutil import copyfile

# Define maximum number of slots in a chassis & maximum number of ports in a slot.

maxSlots = 6
maxPorts = 30

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

# NOTE: Hard code the group name for first release.
groupName = "Demo_1900"

# NOTE: Change path to zxconfig.xml when incorporate this code into daemon.
zxconfigFileName = "/home/kathyr/switchCode/oacontrol/src/kathy/ZenPacks/ZenPacks.znyx.OAControl/ZenPacks/znyx/OAControl/conf/zxconfig.xml"

# NOTE: Look for device.xml until zxchassis daemon is changed.
zxdevicesFileName = "/usr/local/zenoss/zenoss/device.xml"
last_zxdevicesFileName = "/usr/local/zenoss/zenoss/last_device.xml"

tempdevicesFileName = "/usr/local/zenoss/zenoss/new_device.xml"

zxchassisFileName = "/usr/local/zenoss/zenoss/zxchassis.xml"

def add_device( doc, slotInfo):
    """Add device to XML document.
""" 
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
    linkEl.setAttribute("objid", "/zport/dmd/Groups/Demo_1900")
    
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

def add_dmd_device(ip, name, path, group, slot, serial):
     """Add device to Zenoss via dmd.
"""    
     dmd.DeviceLoader.loadDevice(name, path,
	  "", serial,               # tag, serialNumber,
	  "","", None,       	# zSnmpCommunity, zSnmpPort, zSnmpVer,
          slot, 1000, "",  	# rackSlot, productionState (1000=Production), comments,
          "", "",        	# hwManufacturer, hwProductName,
          "", "",        	# osManufacturer, osProductName.
          "", [group], [], 	# locationPath,groupPaths,systemPaths,
          "localhost","none")   # performanceMonitor, discoverProto
 
     d=dmd.Devices.findDevice(name)
     d.setManageIp(ip)
     commit()
     d.collectDevice()

class dict2xml(object):
    """Convert Python dictionary to XML format.
"""
    doc     = Document()
    
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
            tagName     = father.tagName
            grandFather.removeChild(father)
            for l in structure:
                tag = self.doc.createElement(tagName)
                self.build(tag, l)
                grandFather.appendChild(tag)

        else:
            data    = str(structure)
            tag     = self.doc.createTextNode(data)
            father.appendChild(tag)

    def cleanup(self):
	self.doc.unlink()
	
    def display(self):
        print self.doc.toprettyxml(indent="  ") 
        
    def dump(self):
        return self.doc.toprettyxml(indent="  ") 
        
def get_device_names( slots, incrementFlag):
    """Determine the device names. The algorithem is <class>_<deviceNumber>.
"""     
    # Use global variables in naming boards.
    global num1900Base
    global num1900Fabric
    global num7300
    global numZXSBC
    
    # Set up ShelfMgr in Slot 0
    
    slotInfo = slots[0]
    slotInfo['name'] = "SHMM"
    slotInfo['class'] = "ShelfMgr"
    
    # Set up the rest of the slots.
    for slotNum in range (1,len(slots)):
	slotInfo = slots[slotNum]
        ip = slotInfo['ip']
        
        # If this is an empty slot then continue.
        if slotInfo['serial'] == None:
	     continue

        # NOTE: Kludge for 1900. Delete code.
        if ip == "10.2.0.215":
	    slotInfo = slots[1]
            slotInfo['name'] = "ZX1900B-A1_%s" % (str(num1900Fabric))
            slotInfo['class'] = "ZX1900FabricDevice"
            if incrementFlag == True:
                num1900Fabric += 1
            continue
       
        # Try to get 1900Base Name 
        val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.14.21.0'))
        if val != "":
            slotInfo['name'] = "%s_%s" % (val,str(num1900Base))
            slotInfo['class'] = "ZX1900BaseDevice"
	    if incrementFlag == True:
		 num1900Base += 1
        else:	
            # Try to get 1900Fabric Name		
            val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.15.21.0'))
            if val != "":
                slotInfo['name'] = "%s_%s" % (val,str(num1900Fabric))
                slotInfo['class'] = "ZX1900FabricDevice"
                if incrementFlag == True:
		     num1900Fabric += 1		      
            else:
                # Try to get 7300 Name
                val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.17.21.0'))
                if val != "":
                    slotInfo['name'] = "%s_%s" % (val,str(num7300))
                    slotInfo['class'] = "ZX7300"
                    if incrementFlag == True:
			 num7300 += 1
                else:
		    # Assume this is a ZXSBC device.
                    slotInfo['name'] = "%s_%s" % ("ZXSBC",str(numZXSBC))
                    slotInfo['class'] = "ZXSBC"
                    if incrementFlag == True:
			 numZXSBC += 1
 
def get_device_properties(slots):
    """Retrieve device attributes from Zenoss and store in local data structure (slots).
"""     
    dmd = ZenScriptBase(connect=True).dmd
    for device in dmd.Devices.getSubDevices():
        groups = device.getDeviceGroupNames()
        for a in range (0,len(groups)):
            if groups[a].find(groupName) != -1:
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
                
                # NOTE: Temporary hack to accommodate 1900
                if slotNum == 1: 
		     if name.find("ZX1900BaseDevice") != -1:
		         slotNum = 2
		     
                # Store info in slots
                slotInfo = slots[slotNum]
                slotInfo['ip'] = ip
                slotInfo['name'] = name 
                slotInfo['serial'] = serialNum
                slotInfo['class'] = className                  
    
def get_snmp_value( cmd, timeout=2.5 ):
    """Run SNMP get and spit out the output.
"""
    import fcntl
    import popen2
    import signal
    import time
    import select

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
                print ("'Command timed out for %s" % cmd + " (timeout is %s seconds)" % timeout)
                
        except:
            print ("Error running command type: %s  value: %s " % tuple(sys.exc_info()[:2]))
            
    finally:
        if child and child.poll() == -1:
            os.kill(child.pid, signal.SIGKILL)
            
    return rtnVal

def process_config_changes(slots):
    """Determine if chassis or Zenoss configuration has changed and process any changes.
""" 

    # CHASSIS CHANGES
    newSlots=[None]*maxSlots
    slotStatus=[None]*maxSlots 
     
    # Initialize IP addresses in new table.
    for slotNum in range (0,len(slots)):
        newSlots[slotNum] = {'ip': slots[slotNum]['ip']}
           
    # Derive the device class from the device itself. Then get the latest serial number and 
    # mState from the shelf manager.
    # NOTE: Order is important. Call setup_chassis before get_device_names.

    setup_chassis(newSlots)
    get_device_names(newSlots, False)
    
    for slotNum in range (1,len(newSlots)): 

        newSlotInfo = newSlots[slotNum]
        slotInfo = slots[slotNum]
        
        # Error condition. Neither of these will be empty.      
	if newSlotInfo == None or slotInfo == None:
	    # NOTE: Generate event
	    continue	

	# Retrieve serial number and mState.
        newSerial = newSlotInfo['serial']
        newMState = int(newSlotInfo['mState'])
        newClass = newSlotInfo['class']

        oldSerial = slotInfo['serial']
        oldMState = int(slotInfo['mState'])
        oldClass = slotInfo['class']
 
        if newMState == 0:
            if oldMState == 0 or oldClass == None or oldSerial == None:               
		# No Change -- slot still empty.
		slotStatus[slotNum] = boardUnchanged 		  
	    else:	
		# Board Removed.
		slotStatus[slotNum] = boardRemoved 
	else:
	    if ((oldMState == 0) or (oldClass == None) or (oldSerial == None)):
		# Board Added
		slotStatus[slotNum] = boardAdded 
	    elif (newSerial != oldSerial) or (newClass != oldClass):		
		# Hot Swap
		slotStatus[slotNum] = boardHotSwap 
            else:		
		# No Change
		slotStatus[slotNum] = boardUnchanged 
 		       
    # ZENOSS CHANGES

    # Setup dmd object
    dmd = ZenScriptBase(connect=True).dmd
    
    for device in dmd.Devices.getSubDevices():
        groups = device.getDeviceGroupNames()
        for a in range (0,len(groups)):
            if groups[a].find(groupName) != -1:
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
                                
                # User could have changed slot, serial, ip, name or class.
                # Zenoss modeling will reset slot & serial, so don't worry about these.
                
                # User not allowed to change IP address in first release. Log error.
                # NOTE: Log error here & generate event. Test changing IP later.
 
                # User not allowed to change class.
                # NOTE: Log error here & generate event.  
                 
                # User can change name...This is OK. Just update internal tables.
                newSlots[slotNum]['name'] = name
                slots[slotNum]['name'] = name
   
    for slotNum in range (1,len(newSlots)): 
    
        status = slotStatus[slotNum]
                 
        if status == None or status == boardUnchanged:
            continue
       
        if status == boardRemoved:           
            device = dmd.Devices.findDevice(slots[slotNum]['name']) # Delete device.
            device.deleteDevice()
            commit()
        else:	     
	    newSlotInfo = newSlots[slotNum]	    
	    newIp = newSlotInfo['ip']
	    newName = newSlotInfo['name']
	    newClass = newSlotInfo['class']
	    newSerial = newSlotInfo['serial']

    	    if (newClass == "ShelfMgr") or (newClass == "ZXSBC"):
                prefix = "/Network/"
	    else:
		prefix = "/Network/OASwitch/"
		 
	    newPath = prefix + newClass

	    if (status == boardAdded):
		# Add new device via Zenoss.
                add_dmd_device(newIp, newName, newPath, groupName, slotNum, newSerial)
	    else:
		# Hot Swap
                # If different class, then delete old device and add new one.
                # Otherwise, generate event.
 
                if (newClass != slots[slotNum]['class']): 
		    device = dmd.Devices.findDevice(slots[slotNum]['name'])
		    device.deleteDevice()
		    commit()
		    add_dmd_device(newIp, newName, newPath, groupName, slotNum, newSerial)
                else:
		    # NOTE: Add event here.
		    print 'swapped boards of type %s' % newClass 

    dmd.Devices.reIndex()
    commit()
                
def set_device_properties(slots):
    """Use local data structure (slots) to set device attributes in Zenoss.
""" 
    # Set serial number, slot & name.
    # Zenoss will overwrite serial number & slot for Znyx devices.
    # So, only set these values for ZXSBC devices.
    # NOTE: Add error handling & logging.
    
    dmd = ZenScriptBase(connect=True).dmd

    for device in dmd.Devices.getSubDevices():
        for slotNum in range (0,len(slots)):
            slotInfo = slots[slotNum]
            
            # Skip empty slots
            if slotInfo['serial'] == None:
		 continue
	    
            if slotInfo['ip'] == device.getManageIp():
        	#if device.id != device.getDeviceName():
                device.renameDevice(slotInfo['name'])
                manf = device.getOSManufacturerName()
                if not manf.find("Znyx") != -1:
                    device.setHWSerialNumber(slotInfo['serial'])
                    device.rackSlot = slotNum
                   
    dmd.Devices.reIndex()
    commit()  
    
def setup_chassis(slots):
    """Initialize chassis info in local data structure (slots).
"""
    # Set up Shelf Manager. It's always in Slot 0.
    
    slotInfo = slots[0]
    slotInfo['serial'] = "0"
    shelfManagerIP = slotInfo['ip']
     
    # Get info from the ShelfManager about each of the slots.
     
    for slotNum in range (1,len(slots)):
	  
	slotInfo = slots[slotNum]
	deviceIdOid = '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.%s' % slotNum
	mstateOid = '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.%s' % slotNum
	serialOid = '.1.3.6.1.4.1.16394.2.1.1.32.1.17.%s' % slotNum
	
	# Get M state and store as an integer
	val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, mstateOid))    
	slotInfo['mState'] = val
	if val == "" or int(val) == 0:
	    # Board not present, so reset class and name and set serial number to None.
	    slotInfo['name'] = None
	    slotInfo['class'] = None
	    slotInfo['serial'] = None
	    slotInfo['mState'] = "0"
	else:     
	    # Get serial number
	    val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, serialOid))
	    slotInfo['serial'] = val

def setup_znyxSlot(slots,ports):
    """Initialize port info in local data structure (slots).
"""     
    # NOTE: After one timeout/error on an SNMP, everything is set to default values.
    # Is there a better way to handle this? 
    for slotNum in range (1,len(slots)):
	  
	slotInfo = slots[slotNum]
        slotIp = slotInfo['ip']	 
	timeout = False
	
	devClass = slotInfo['class']
	if devClass == "ZX1900BaseDevice":
	    devOID = 14
	    numPorts = 26
	elif devClass == "ZX1900FabricDevice":
	    devOID = 15
	    numPorts = 20
	elif devClass == "ZX7300":
	    devOID = 17
	    numPorts = 28
	else:
	    # Not a ZNYX board or empty slot.
	    continue
	     
	# Get Led Status
	intOID = '.1.3.6.1.4.1.688.2.3.%s.3.0' % devOID
	val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, intOID))
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
	    val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, extOID))
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
     
	for a in range(1,numPorts):
	    if timeout == False:
	        linkOID = '.1.3.6.1.4.1.688.2.3.%s.7.1.2.' % devOID
	        val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, linkOID + str(a)))
	    else:
		val = ""
	    if val == "":
		linkVal = "down"
		timeout = True
	    elif val == 1:
	        linkVal = "up"
	    else:
	        linkVal = "down"
	    slotInfo['port'+str(a)] = linkVal	      
    
print "*****START*****"
    
# Setup dmd object
# NOTE: Do I need this in daemon?

dmd = ZenScriptBase(connect=True).dmd

# Initialize lists

slots=[None]*maxSlots
ports = [x[:] for x in [["down"]*maxPorts]*maxSlots]

# Do initialization unless zxdevices.xml or zxchassis.xml exist.
# NOTE: Move this to a separate function


# Use zxconfig.xml to set up slot/IP Addr map.     
try:
     configFile = open(zxconfigFileName)
except IOError:
     # NOTE: Send event & log error & QUIT
     print "Unable to find zxconfig.xml"
     # Quit. zxconfig.xml must be present for initialization.
     sys.exit()
	 
configDoc = parse(configFile)
configFile.close()     

for node in configDoc.getElementsByTagName('slotmap'):
     slot = node.getAttributeNode("slotid")
     ipAddr = node.getAttributeNode("ipaddr")
     slots[int(slot.nodeValue)]= {'ip': str(ipAddr.nodeValue)}

# Find out Shelf Manager's View of the chassis.
setup_chassis(slots)

if os.path.isfile(zxdevicesFileName) or os.path.isfile(zxchassisFileName):
     doInit = False
else:
     doInit = True     

if (doInit == True):
     print "doingInit"
     
     # Determine the name of the device in each slot.
     # NOTE: Must call setup_chassis first.
     
     get_device_names(slots, True)

     # If zxdevice.xml doesn't exist, have Zenoss generate it.
     
     if (os.path.isfile(zxdevicesFileName) == False):
	  os.system("/usr/local/zenoss/zenoss/bin/zendevicedump -o %s" % zxdevicesFileName)
	  
     # Read and parse zxdevice.xml.

     deviceFile = open(zxdevicesFileName)
     deviceDoc = parse(deviceFile)
     deviceFile.close()
   
     # Generate device for each IP address.

     for slotNum in range (0,len(slots)):
	  add_device(deviceDoc, slots[slotNum])	  

     # Output document.

     tempFile = open(tempdevicesFileName, 'w')
     deviceDoc.writexml(tempFile)
     tempFile.close() 
     
     # Upload zxdevice.xml to Zenoss
     if (os.path.isfile(tempdevicesFileName) == True):
	  os.system("/usr/local/zenoss/zenoss/bin/zendeviceload -i %s" % tempdevicesFileName)

     # Delete the temporary file.
     os.remove(tempdevicesFileName)
    
     # Set device properties via Zenoss: SLOT, NAME, SERIAL NUMBER.
     set_device_properties(slots)
     
     # Generate zxdevices.xml to reflect new configuration.
     os.system("/usr/local/zenoss/zenoss/bin/zendevicedump -o %s" % zxdevicesFileName)  
    
else:
     print "Not doing init"
     # Use Zenoss device info to set up slots.
     get_device_properties(slots)    

# Loop, monitoring changes and outputting current state to XML file.
count = 1
while (True):
    if (doInit != True):
     
        # Handle any changes, including Hot Swap, to the chassis configuration.
        process_config_changes(slots)
    
        # Dump Zenoss device configuration to zxdevices.xml
        #os.system("/usr/local/zenoss/zenoss/bin/zendevicedump -o %s" % zxdevicesFileName)  

        # Generate internal tables from SNMP gets.
        setup_chassis(slots)
        setup_znyxSlot(slots,ports)

    # Output lists to zxchassis.xml
    # NOTE: John doesn't want Shelf Manager info output as Slot 0.

    dictionary = {'zx1900':{'slot0':slots[0],'slot1':slots[1],'slot2':slots[2],'slot3':slots[3],'slot4':slots[4],'slot5':slots[5]}}
    xml = dict2xml(dictionary)

    chassisFile = open(zxchassisFileName,'w')
    chassisFile.write(xml.dump())
    chassisFile.close()
    
    xml.cleanup()
    del xml
    
    print "loop ",count
    count += 1

print "hallelujah"

  


