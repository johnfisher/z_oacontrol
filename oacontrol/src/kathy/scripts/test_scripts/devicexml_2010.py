
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

sys.path.append('/usr/share/pyshared')
import pexpect
import telnetlib
import xml.etree.cElementTree as ET
from StringIO import StringIO

# Define maximum number of slots in a chassis & maximum number of ports in a slot.

maxSlots = 9
maxPorts = 30

# Board status
boardRemoved = 0
boardAdded = 1
boardHotSwap = 2
boardUnchanged = 3  
boardUnhealthy = 4

# Globals used in numbering boards.

num7300 = 1
numZXSBC = 1
num2010 = 1

# Class definitions
    
shelfMgrClass = "ShelfMgr"
zxsbcClass = "ZXSBC"
znyxPrefix = "/Network/OASwitch/"
nonZnyxPrefix = "/Network/"

# MStates
    
noneMState = 0
actReqMState = 2
actMState = 3
fruActiveMState = 4
    
# NOTE: Hard code the group name for first release.
groupName = "Demo_2000"

# NOTE: Change path to zxconfig.xml when incorporate this code into daemon.
zxconfigFileName = "/home/kathyr/switchCode/oacontrol/src/kathy/ZenPacks/ZenPacks.znyx.OAControl/ZenPacks/znyx/OAControl/conf/zxconfig.xml"

# NOTE: Look for device.xml until zxchassis daemon is changed.
zxdevicesFileName = "/usr/local/zenoss/zenoss/device.xml"
last_zxdevicesFileName = "/usr/local/zenoss/zenoss/last_device.xml"

tempdevicesFileName = "/usr/local/zenoss/zenoss/new_device.xml"

#zxchassisFileName = "/usr/local/zenoss/zenoss/test_zxchassis.xml"
zxchassisFileName = "/var/www/oac/oac.xml"

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
    linkEl.setAttribute("objid", "/zport/dmd/Groups/Demo_2000")
    
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

def clearSlot(slotNum):
	 
    # Clear up slot entry for removed or hot swapped board.
    print("clearSlot")
    
    global slots
	
    slotInfo = slots[slotNum]
    keylist = slotInfo.keys()
    for key in keylist:
	if key == 'ip':
            print("Clearing slot for ip = %s" % slotInfo['ip'])
	elif key == 'status':
            slotInfo['status'] = "empty"
	elif key == 'serial':
	    slotInfo['serial'] = None
	else:
	    del slotInfo[key]

def get_device_classes(slots):
	 
    #Determine the device classes.
    print("get_device_classes")
    
    # Set up ShelfMgr in Slot 0   
    slotInfo = slots[0]
    slotInfo['class'] = "ShelfMgr"
    
    # Set up the rest of the slots.
    for slotNum in range (1,len(slots)):
	slotInfo = slots[slotNum]
        ip = slotInfo['ip']
        
        # If this is an empty or unreachable slot then continue.
        if slotInfo['serial'] == None or slotInfo['status'] == "unreachable":
	    slotInfo['class'] = None
	    continue
	   
        # Try to get name from 2010
        val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.18.21.0'))
        if val != "":
            slotInfo['class'] = "ZX2010Device"
        else:	
            # Try to get name from 7300
            val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.17.21.0'))
            if val != "":
                slotInfo['class'] = "ZX7300"
            else:
		# Assume this is a ZXSBC device.
                slotInfo['class'] = "ZXSBC"

def get_device_name( slotInfo):
    """Determine the device names. The algorithem is <class>_<deviceNumber>.
"""     
    # Use global variables in naming boards.
    global num7300
    global numZXSBC
    global num2010
    
    # Return name for specified device. The algorithem is <class>_<deviceNumber>.
    print("get_device_name")

    # If this is an empty or unreachable slot then continue.
    if slotInfo['serial'] == None or slotInfo['status'] == "unreachable":
	slotInfo['zname'] = None
	return

    # Initialize data   
    slotInfo['zname'] = ""
    ip = slotInfo['ip']
 	
    # Return if class hasn't been set. Can't determine name.
    if slotInfo['class'] == None:
	print("class not set for ip =%s" % ip)
	return	     
	
    if slotInfo['class'] == "ShelfMgr":
        slotInfo['zname'] = "SHMM"
    elif slotInfo['class'] == "ZX2010Device":
	val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.18.21.0'))
        if val != "":
            slotInfo['zname'] = "%s_%s" % (val,str(num2010))
	num2010 += 1
    elif slotInfo['class'] == "ZX7300":
        val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', ip, '.1.3.6.1.4.1.688.2.3.17.21.0'))
        if val != "":
            slotInfo['zname'] = "%s_%s" % (val,str(num7300))
	    num7300 += 1
    elif slotInfo['class'] == "ZXSBC":
        slotInfo['zname'] = "%s_%s" % ("ZXSBC",str(numZXSBC))
	numZXSBC += 1
    else:
	print("unknown class %s" % slotInfo['class'])
	     
def get_device_properties():
    """Retrieve device attributes from Zenoss and store in local data structure (slots).
"""     
    dmd = ZenScriptBase(connect=True).dmd
    
    #Retrieve device attributes from Zenoss and store in local data structure (slots).
    print("get_device_properties")     

    global slots
    global groupName
     
    for device in dmd.Devices.getSubDevices():
        groups = device.getDeviceGroupNames()
        
        for a in range (0,len(groups)):
            if groups[a].find(groupName) != -1:
		# NOTE: ZNYX BOARDS DON'T HAVE CORRECT SLOT NUMBER
                #slot = device.rackSlot
                #slotWords = (str(slot)).split()
                #slotNum = int(slotWords[len(slotWords)-1]) 
                serialNum = device.getHWSerialNumber()
                if serialNum == None:
		    serialNum = ""		
		ip = device.getManageIp()
                name = device.getDeviceName()                
                classPath = device.getDeviceClassPath()
                classPath.strip()
                classes = classPath.split('/')
                className = classes[len(classes)-1]
                
                # Find the right slot.
                for slotNum in range (0,len(slots)):
		     if slots[slotNum]['ip'] == ip:
                        # Store info in slots
                        slotInfo = slots[slotNum]
                        slotInfo['zname'] = name 
                        slotInfo['class'] = className
                        slotInfo['serial'] = serialNum
                        break
    
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

def process_config_changes():
    """Determine if chassis or Zenoss configuration has changed and process any changes.
""" 
    #Determine if chassis or Zenoss configuration has changed and process any changes.
    print("process_config_changes")  
    
    global slots
    global groupName
    
    global boardRemoved
    global boardAdded
    global boardHotSwap
    global boardUnchanged  
    global boardUnhealthy
    
    global noneMState
    global actReqMState
    global actMState
    global fruActiveMState
    
    global shelfMgrClass
    global zxsbcClass
    global znyxPrefix
    global nonZnyxPrefix

    # Get dmd
    dmd = ZenScriptBase(connect=True).dmd
    
    # CHASSIS CHANGES
    newSlots=[None]*maxSlots
    slotStatus=[None]*maxSlots 
     
    # Initialize IP addresses in new table.
    for slotNum in range (0,len(slots)):
        newSlots[slotNum] = {'ip': slots[slotNum]['ip']}
        
    # Derive the device class from the device itself. Then get the latest serial number and 
    # mstate from the shelf manager.
    # NOTE: Order is important. Call setup_chassis before get_device_name.

    setup_chassis(newSlots)

    # If unable to contact shelf manager then return.
    if newSlots[0]['status'] == "unreachable":
	print ("process_config_changes: can't contact shelf manager")
        return
   
    get_device_classes(newSlots)
    
    for slotNum in range (1,len(newSlots)): 
        newSlotInfo = newSlots[slotNum]
        slotInfo = slots[slotNum]
        
        # Error condition. Neither of these will be empty.      
        if newSlotInfo == None or slotInfo == None:
	    # Generate event
	    print "zxchassisdaemon: Empty slot info (internal data)"
	    continue	

	# If can't get new slot info then continue.
	if newSlotInfo['status'] == "unreachable":
	    continue
	    
        # Retrieve serial number and mstate.
        newSerial = newSlotInfo['serial']
        newMState = int(newSlotInfo['mstate'])
        newClass = newSlotInfo['class']

        oldSerial = slotInfo['serial']
        oldMState = int(slotInfo['mstate'])
        oldClass = slotInfo['class']
 
        if newMState == noneMState:
            if oldMState == noneMState or oldClass == None or oldSerial == None:               
		# No Change -- slot still empty.
		slotStatus[slotNum] = boardUnchanged 		  
	    else:	
		# Board Removed.
		slotStatus[slotNum] = boardRemoved 
        elif newMState == fruActiveMState or newMState == actReqMState or newMState == actMState:
	    if ((oldMState == noneMState) or (oldClass == None) or (oldSerial == None)):
		# Board Added
		slotStatus[slotNum] = boardAdded             
		print("BOARD ADDED: newSerial = %s, newMState= %s, newClass= %s" % (newSerial, newMState, newClass))
		print("oldSerial = %s, oldMState= %s, oldClass= %s" % (oldSerial, oldMState, oldClass))
	    elif (newSerial != oldSerial) or (newClass != oldClass):		
		# Hot Swap
		slotStatus[slotNum] = boardHotSwap 
		print("BOARD HOTSWAP: newSerial = %s, newMState= %s, newClass= %s" % (newSerial, newMState, newClass))
		print("oldSerial = %s, oldMState= %s, oldClass= %s" % (oldSerial, oldMState, oldClass))
            else:		
		# No Change
		slotStatus[slotNum] = boardUnchanged
	else:
	    # Board is inactive, deactivating, or not communicating.
	    # Delete device if it exists.
	    slotStatus[slotNum] = boardUnhealthy
 		       
    # ZENOSS CHANGES

    foundDevices=[False]*maxSlots  
        
    for device in dmd.Devices.getSubDevices():  
        groups = device.getDeviceGroupNames()
        for a in range (0,len(groups)):
            if groups[a].find(groupName) != -1:
                slot = device.rackSlot
                slotWords = (str(slot)).split()
                zenossSlotNum = int(slotWords[len(slotWords)-1])                  
                
                serialNum = device.getHWSerialNumber()
                name = device.getDeviceName()
                ip = device.getManageIp()
                classPath = device.getDeviceClassPath()
                classPath.strip()
                classes = classPath.split('/')
                className = classes[len(classes)-1]
                 
                    
                # User could have changed slot, serial, ip, name or class.
                # Zenoss modeling will reset slot & serial, so don't worry about these.
                # NOTE: Znyx will reset slot & serial in private MIB. This slot number
                # is not guaranteed to correspond to chassis slot.

		# Try to find slot by finding a match for the IP address.
		# If there's no match, then delete the device.
		# Changing the IP address is not allowed.
		for slotNum in range (0,len(slots)): 
		    if ip == slots[slotNum]['ip']:
			 break
			     
		if slotNum >= len(slots):
		    print("process_config_changes: invalid managed IP = %s" % ip)
	            continue
			
		foundDevices[slotNum] = True
		    
                # User not allowed to change IP address in first release. 
                # Change it back & generate event.
                # NOTE: Test changing IP later.

                # User not allowed to change class.
                # Change it back & generate event.
                if className != slots[slotNum]['class'] and className != newSlots[slotNum]['class']:
                    print("process_config_changes: user changed device class to %s" % className)
                    if (newSlots[slotNum]['class'] == shelfMgrClass) or (newSlots[slotNum]['class'] == zxsbcClass):
                        prefix = nonZnyxPrefix
	            else:
		        prefix = znyxPrefix		 
	            newClassPath = prefix + newSlots[slotNum]['class']
	            print("slotNum = %s" % slotNum)
	            print("newClassPath = %s" % newClassPath)
                    device.moveDevices(newClassPath,device.id)
               
                # User can change name...This is OK. Just update internal tables.
                newSlots[slotNum]['zname'] = name
                     
    for slotNum in range (1,len(newSlots)): 
    
        status = slotStatus[slotNum]
                 
        if status == None:
            continue
	   
	if newSlots[slotNum]['status'] == "unreachable":
	    continue
	   
	# Check for case where user might have deleted a valid device in Zenoss.
	# This would be a user error that should be corrected.
	    
	if (status == boardUnchanged):
	    if (newSlots[slotNum]['class'] != None) and (foundDevices[slotNum] == False):
		status = boardAdded
	    else:
		continue
		
        if (status == boardUnhealthy): 
            continue
	   
        if status == boardRemoved: 
            if foundDevices[slotNum] == True:
                device = dmd.Devices.findDevice(slots[slotNum]['ip']) 
                # Delete device.
                if not device:
		    print("cannot find device in slot %s to delete" % slotNum)
		else:     
		    device.deleteDevice()
                    commit()
            learSlot(slotNum)
        else:	     
	    newSlotInfo = newSlots[slotNum]	    
	    newIp = newSlotInfo['ip']
	    #newName = newSlotInfo['zname']
	    newClass = newSlotInfo['class']
	    newSerial = newSlotInfo['serial']

    	    if (newClass == shelfMgrClass) or (newClass == zxsbcClass):
                prefix = nonZnyxPrefix
	    else:
	        prefix = znyxPrefix
		
	    newClassPath = prefix + newClass

	    if (status == boardAdded):
		# Get new name.
		get_device_name(newSlotInfo)
		newName = newSlotInfo['zname']
		    
		# Add new device via Zenoss.
		print("add for boardAdded")
                add_dmd_device(newIp, newName, newClassPath, groupName, slotNum, newSerial)
	    else:
		# Hot Swap
                # If different class, then delete old device and add new one.
                # Otherwise, generate event.
 
                if (newClass != slots[slotNum]['class']):
		    if foundDevices[slotNum] == True:
		        device = dmd.Devices.findDevice(slots[slotNum]['ip'])
		        if not device:
			    print("cannot find device in slot %s to delete" % slotNum)
			else:
		            device.deleteDevice()
		            commit()
		    clearSlot(slotNum)
		        
		    # Get new name.
		    get_device_name(newSlotInfo)
		    newName = newSlotInfo['zname']
		    print("add for hotswap: slotNum=%s, newIP=%s, newClass = %s, slots['class']= %s" % (slotNum, newIp, newClass, slots[slotNum]['class']))
                    # Add new device via Zenoss
		    add_dmd_device(newIp, newName, newClassPath, groupName, slotNum, newSerial)
                else:
		    print ("zxchassisdaemon: Hot swap in slot = %s." % str(slotNum))
                          
            slots[slotNum]['ip'] = newIp 
	    slots[slotNum]['zname'] = newSlotInfo['zname']
	    slots[slotNum]['class'] = newClass
	    slots[slotNum]['serial'] = newSerial

    dmd.Devices.reIndex()
    commit()
                
def set_device_properties():
    """Use local data structure (slots) to set device attributes in Zenoss.
""" 
    global slots
    
    dmd = ZenScriptBase(connect=True).dmd

    print("set_device_properties")

    # Set serial number, slot & name.
    # Zenoss will overwrite serial number & slot for Znyx devices.
    # So, only set these values for ZXSBC devices.
    # NOTE: Add error handling & logging.
        
    modificationFlag = False
        
    for device in dmd.Devices.getSubDevices():
	    
        for slotNum in range (0,len(slots)):
                
            slotInfo = slots[slotNum]
                         
            # Skip empty slots
            if slotInfo['serial'] == None:
		continue
	    
            if slotInfo['ip'] == device.getManageIp():
        	if device.id != slotInfo['zname']:
                    device.renameDevice(slotInfo['zname'])
                manf = device.getOSManufacturerName()
                if not manf.find("Znyx") != -1:
                   device.setHWSerialNumber(slotInfo['serial'])
                   device.rackSlot = slotNum
                modificationFlag = True

    if (modificationFlag == True):
	dmd.Devices.reIndex()
        commit()  

def setup_chassis(slots):
	 
    # Initialize chassis info.
    print("setup_chassis")
 
    # Verify the IP addresses
    for slotNum in range (0, len(slots)):
        slotIp = slots[slotNum]['ip']
        results = os.system("ping -c 2 " + slotIp)

        if results == 256:
	    slots[slotNum]['status'] = "unreachable"
	    #print("setup_chassis: Slot%s (%s) Unreachable"% (slotNum,slotIp)) 
        else:
            slots[slotNum]['status'] = "ok"
             
    # Set up Shelf Manager. It's always in Slot 0.
    
    slotInfo = slots[0]
    slotInfo['serial'] = "0"
    shelfManagerIP = slotInfo['ip']
 
    # If the Shelf Manager is unreachable then set all slots to empty and return.
        
    if slotInfo['status'] == "unreachable":
        for slotNum in range (1,len(slots)):
	    slots[slotNum]['zname'] = None
	    slots[slotNum]['class'] = None
	    slots[slotNum]['serial'] = None
	    slots[slotNum]['mstate'] = "0"	
	return

    # Get info from the ShelfManager about each of the slots.
        
    for slotNum in range (1,len(slots)):
	    
	slotInfo = slots[slotNum]
	deviceIdOid = '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.%s' % slotNum
	mstateOid = '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.%s' % slotNum
	serialOid = '.1.3.6.1.4.1.16394.2.1.1.32.1.17.%s' % slotNum
	
	# Get M state and store as an integer
	val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, mstateOid))    
	    
	if val == "" or int(val) == 0:
	    # Board not present, so reset class and name and set serial number to None.
	    slotInfo['status'] = ""
	    slotInfo['zname'] = None
	    slotInfo['class'] = None
	    slotInfo['serial'] = None
	    slotInfo['mstate'] = "0"
	else: 
	    slotInfo['mstate'] = val
	    # Get serial number
	    val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, serialOid))
	    slotInfo['serial'] = val
	    # Get device ID string
	    val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, deviceIdOid))
	    slotInfo['name'] = val	        

def setup_ports(slots):
	 
    #Initialize port info.
    print("setup_ports")
        
    # NOTE: After one timeout/error on an SNMP, everything is set to default values.
    # Is there a better way to handle this? 
    for slotNum in range (0,len(slots)):
	  
	slotInfo = slots[slotNum]
        slotIp = slotInfo['ip']	 
	timeout = False
	firstZreIfIndex = 0
	    
	if slotInfo['status'] == "unreachable" or slotInfo['status'] == "empty":
	    continue
        
	devClass = slotInfo['class']
	if devClass == "ZX2010Device":
	    devOID = 18
	    numEthPorts = 3
	    slotInfo['numPorts'] = 20
	    slotInfo['console'] = None
	elif devClass == "ZX7300":
	    devOID = 17
	    numEthPorts = 3
	    slotInfo['numPorts'] = 28
	    slotInfo['console'] = None
	elif devClass == "ShelfMgr":
	    numEthPorts = 2
	    slotInfo['numPorts'] = 0
	    slotInfo['console'] = None
	else:
	    # Not a ZNYX board.
	    numEthPorts = 6
	    slotInfo['numPorts'] = 0
	        
	# Find out the number of interfaces (1-based).
	ifNumOID = '.1.3.6.1.2.1.2.1.0'
	ifNumVal = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifNumOID))
	if ifNumVal == "":
	    print("Unable to read %s in IF-MIB" % ifNumOID)
	    ifNumVal = "0"
	    timeout = True    
	    
	# Get ifAdmin/ifOper for eth ports and find ifIndex of first zre interface (if there is one).
	for a in range (1, int(ifNumVal)):

	    if timeout == False:
		ifDescrOID = '.1.3.6.1.2.1.2.2.1.2.' + str(a)
		descrVal = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifDescrOID))
		if descrVal == "":
		    print("Unable to read %s in IF-MIB" % ifDescrOID)
		    timeout = True
		elif ((descrVal.find("zre") != -1) and firstZreIfIndex == 0):
	            firstZreIfIndex = a
		else:		
		    if descrVal.find("eth") != -1:
			ifAdminOID = '.1.3.6.1.2.1.2.2.1.7.'+ str(a)
			adminVal = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifAdminOID))
			if adminVal == "":
			    print("Unable to read %s in IF-MIB" % ifAdminOID)
			    timeout = True
			else:
		            if adminVal.find("1") != -1:
				aVal = "up"
				#slotInfo[descrVal+'-cnf'] = "up"
			    else:
				aVal = "down"
				#slotInfo[descrVal+'-cnf'] = "down"
			    ifOperOID = '.1.3.6.1.2.1.2.2.1.8.'+ str(a)
			    operVal = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifOperOID))
			    if operVal == "":
			        print("Unable to read %s in IF-MIB" % ifOperOID)
			        timeout = True
			    else:
			        if operVal.find("1") != -1:
				    oVal = "up"
			            #slotInfo[descrVal+'-link'] = "up"
				else:
				    oVal = "down"
				    #slotInfo[descrVal+'-link'] = "down"
				slotInfo[descrVal] = {'cnf': aVal, 'link':oVal}
            
	if timeout == True:
	    print("Timeout is true. Set eth ports to down.")
	    for a in range (1, numEthPorts):
		slotInfo['eth'+str(a-1)] = {'cnf': None, 'link': None}
	     
	# Continue if this isn't a Znyx board.
	if (devClass != "ZX2010Device") and (devClass != "ZX7300"):		 
	    continue
	   	    
	# Get Led Status 
	if devClass == "ZX7300":
            #NOTE: Figure out how to get LEDs from Shelf Manager.
            slotInfo['healthy'] = None
            slotInfo['svc'] = None
            #slotInfo['sys'] = None  Removed per problem 8823   
	else:
	    #NOTE: Figure out how to get LEDs from Shelf Manager.
            slotInfo['hot'] = None
            slotInfo['oos'] = None
            slotInfo['shmm'] = None
                
        # Open a telnet session to a remote server, and wait for a username prompt.
        child = pexpect.spawn('telnet ' + slotIp)
        child.expect ('login:')
     
        # Send the username, and then wait for a prompt.
        child.sendline ('root')
        child.expect ('#')
                
	# Screen scrape ZLC results for LEDs
	child.sendline ('zlc state')
        child.expect ('#')
        led_results = child.before
                
        if led_results.find("ACTIVE"):
	    slotInfo['oaa'] = "on"
	else:
	    slotInfo['oaa'] = "off"
		
        if led_results.find("CLK"):
	    slotInfo['clk'] = "on"
	else:
	    slotInfo['clk'] = "off"

        if led_results.find("FAULT"):
	    slotInfo['oafault'] = "on"
	else:
	    slotInfo['oafault'] = "off"

        if led_results.find("INT"):
	    slotInfo['int'] = "on"
	else:
	    slotInfo['int'] = "off"
	
	# EXT can still be returned for 2010, but has no meaning for the user.
	# It's for internal use only.
	if devClass == "ZX7300":    
            if led_results.find("EXT"):
	        slotInfo['ext'] = "on"
	    else:
	        slotInfo['ext'] = "off"
	    
        # Exit the telnet session, and wait for a special end-of-file character.
        child.sendline ('exit')
        child.expect (pexpect.EOF)	    
                

	# Get Link Status
	# NOTE: Switch to zero-based numbering in dictionary.
	for a in range(0,slotInfo['numPorts']):

	    if timeout == False:
	        linkOID = '.1.3.6.1.4.1.688.2.3.%s.7.1.2.' % devOID
	        val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, linkOID + str(a+1)))
	    else:
		val = ""
		
	    if val == "":
		linkVal = None
		timeout = True
	    else:
		if val.find("1") != -1:
	            linkVal = "up"
	        else:
		    linkVal = "down"
	        
	    # Get ifAdminStatus for 'cnf' entries.
	    
	    if timeout == False and firstZreIfIndex > 0:
		index = str(firstZreIfIndex+a) 
	        ifAdminOID =  '.1.3.6.1.2.1.2.2.1.7.'+ index
	        val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifAdminOID))
	    else:
		val = ""
	
	    if val == "":
		adminVal = None
		timeout = True
	    else:
	        if val.find("1") != -1:
		    adminVal = "up"
		else:
		    adminVal = "down"
	    slotInfo['port'+str(a)] = {'cnf':adminVal, 'link':linkVal} 		    

# Methods for translating Python dictionary to XML file.

def indent(elem, level=0):
    """XML prettyprint: Prints a tree with each node indented according to its depth."""
    i = "\n" + level * "     "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + "     "
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
        for child in elem:
            indent(child, level + 1)
        if child:
            if not child.tail or not child.tail.strip():
                child.tail = i
            if not elem.tail or not elem.tail.strip():
                elem.tail = i
    else:
        if level and (not elem.tail or not elem.tail.strip()):
            elem.tail = i
            
def to_string(root, encoding='utf-8', pretty=True):
    """Converts an ElementTree to a string"""

    if pretty:
        indent(root)

    tree = ET.ElementTree(root)
    fileobj = StringIO()
    fileobj.write('<?xml version="1.0" encoding="%s"?>' % encoding)
    if pretty:
        fileobj.write('\n')
    tree.write(fileobj, 'utf-8')
    return fileobj.getvalue()

def _convert_dict_to_xml_recurse(parent, dictitem, listnames):
    """Helper Function for XML conversion."""
    # we can't convert bare lists
    #assert not isinstance(dictitem, list)

    if isinstance(dictitem, dict):
        for (tag, child) in sorted(dictitem.iteritems()):
            if isinstance(child, list):
                # iterate through the array and convert
                listelem = ET.Element(tag)
                parent.append(listelem)
                for listchild in child:
		    _convert_dict_to_xml_recurse(listelem,listchild,listnames)
                    #elem = ET.Element(listnames.get(tag, 'item'))
                    #listelem.append(elem)
                    #_convert_dict_to_xml_recurse(elem, listchild, listnames)			 
            else:
                elem = ET.Element(tag)
                parent.append(elem)
                _convert_dict_to_xml_recurse(elem, child, listnames)
    elif not dictitem is None:
        parent.text = unicode(dictitem)

def dict2et(xmldict, roottag='data', listnames=None):
    """Converts  a dictionary to an XML ElementTree Element.
"""

    if not listnames:
        listnames = {}
    root = ET.Element(roottag)
    _convert_dict_to_xml_recurse(root, xmldict, listnames)
    return root
    
def dict2xml(datadict, roottag='data', listnames=None, pretty=False):
    """Converts a dictionary to an UTF-8 encoded XML string.
"""
    root = dict2et(datadict, roottag, listnames)
    return to_string(root, pretty=True)

print "*****START*****"
    
# Setup dmd object
# NOTE: Do I need this in daemon?

dmd = ZenScriptBase(connect=True).dmd

# Initialize lists

slots=[None]*maxSlots

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

# If unable to contact shelf manager then return.
if slots[0]['status'] == "unreachable":
    print ("Exiting: Cannot contact shelf manager at %s" % slots[0]['ip'])
    sys.exit("Exiting: Cannot contact shelf manager at %s" % slots[0]['ip'])    

# Either do first-time initialization or get device properties.
doInit = True
devices = dmd.Devices.getSubDevices()
if devices:		
    for device in dmd.Devices.getSubDevices():
        groups = device.getDeviceGroupNames()
        for a in range (0,len(groups)):
            if groups[a].find(groupName) != -1:
                doInit = False
                break
            if doInit == False:
	        break
     
if (doInit == True):
    print "doingInit"
     
    # Set zCommandPort and zCommandPath. Including these in the OAControl ZenPack
    # causes zxchassisdaemon crash.
    # NOTE: This is workaround for Bug 
        
    org = dmd.Devices.getOrganizer('/Network/OASwitch')
    org.setZenProperty('zCommandPort', '23')
    org.setZenProperty('zCommandPath', 'telnet')
    commit()
     
    # Determine the class of the device in each slot.
    # NOTE: Must call setup_chassis first. See above.
     
    get_device_classes(slots)
            
    # Generate a name for each device
    # NOTE: Class needed to generate name.
    for slotNum in range (0,len(slots)):
        get_device_name(slots[slotNum])
 
    # Dump the current device configuration.
    os.system(cmdPrefix + "/bin/zendevicedump -o %s" % zxdevicesFileName)
	  
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
        os.system(cmdPrefix + "/bin/zendeviceload -i %s" % tempdevicesFileName)

    # Delete the temporary file.
    os.remove(tempdevicesFileName)

    # Need to commit changes prior to setting properties.
    commit()
   
    # Set device properties via Zenoss: SLOT, NAME, SERIAL NUMBER. Also, configuration properties.
    set_device_properties()
            
    # Generate zxdevices.xml to reflect new configuration.
    os.system( cmdPrefix + "/bin/zendevicedump -o %s" %zxdevicesFileName) 
    
else:
     print "Not doing init"
     # Use Zenoss device info to set up slots.
     get_device_properties()    

# Loop, monitoring changes and outputting current state to XML file.

count = 1
while (count):
        
    #process_config_changes()
   
    # Generate internal tables from SNMP gets.
    setup_ports(slots)

    # NOTE: Call method to get fan & PEM info. For now, dummy up info here.
    slots[0]['lfan'] = {'hot':None,'warn':None,'ok':None,'mstate':None,'serial':None}
    slots[0]['rfan'] = {'hot':None,'warn':None,'ok':None,'mstate':None,'serial':None}
    slots[0]['lpem'] = {'hot':None,'warn':None,'ok':None,'mstate':None,'serial':None}
    slots[0]['rpem'] = {'hot':None,'warn':None,'ok':None,'mstate':None,'serial':None}

    #for slotNum in range (0,len(slots)):
	#print "slots[%s] = " % slotNum + str(slots[slotNum])
    #print slots[0] 
    
    # Output data to zxchassis.xml
   
    outputSlots = slots
    for slotNum in range (0,len(outputSlots)):
	slotInfo = outputSlots[slotNum]
        keys = slotInfo.keys()
        for a in range(len(keys)):
            if keys[a] == 'serial':
		if (slotInfo['serial'] == "N/A") or (slotInfo['serial'] == None):
		    slotInfo['serial'] = ""
			 		  
    dictionaryStr = "{\'chassis\':chassis,"
    chassis = outputSlots[0]
    for slotNum in range (1,len(outputSlots)):
	slotStr = "\'slot%s\':outputSlots[%s]" % (slotNum,slotNum)
	dictionaryStr += slotStr
	if slotNum == (len(outputSlots) - 1):
	    dictionaryStr += "}"
	else:
	    dictionaryStr += ","
    dictionaryStr	    
    dictionary = eval(dictionaryStr)

    xml = dict2xml(dictionary, roottag='zx2000')
    print xml

    chassisFile = open(zxchassisFileName,'w')
    chassisFile.write(xml)
    chassisFile.close()   
    
    os.system("chmod 644 " + zxchassisFileName)
    
print "hallelujah"

  


