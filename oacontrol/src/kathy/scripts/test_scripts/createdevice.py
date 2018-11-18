
#!/usr/bin/env python

import Globals
import os.path

from xml.dom.minidom import parse, parseString
from StringIO import StringIO

from Products.ZenUtils.ZenScriptBase import ZenScriptBase
from transaction import commit

from shutil import copy
from Products.ZenUtils.Utils import zenPath

chassisName = "1900"
maxSlots = 6
nullStr = ""
print "start"

slots=[None]*maxSlots
            
dmd = ZenScriptBase(connect=True).dmd

deviceName = "Test_ZXSBC_1"
devicePath = "/Network/ZXSBC"
serialNumber = "0123456789"
groupPathsList = ["Demo_1900"]
systemPaths = []

dmd.DeviceLoader.loadDevice(deviceName, devicePath,
          nullStr, serialNumber,                # tag="", serialNumber="",
          nullStr,"", None,       		# zSnmpCommunity="", zSnmpPort=161, zSnmpVer=None,
          5, 1000, nullStr,  			# rackSlot=0, productionState=1000, comments="",
          nullStr, nullStr,        		# hwManufacturer="", hwProductName="" (neither or both),
          nullStr, nullStr,        		# osManufacturer="", osProductName="" (neither or both).
          nullStr, groupPathsList, [], 		#locationPath="",groupPaths=[],systemPaths=[],
          "localhost",                          # performanceMonitor="localhost',
          "none")                               # discoverProto="snmp" - only valid option appears to be "none"

d=dmd.Devices.findDevice(deviceName)
#d = dmd.Devices.Server.createInstance(deviceName)
d.setManageIp("10.2.6.5")


#d.setDeviceClassPath("/Network/ZXSBC")
#d.setHWSerialNumber("0123456789")
#d.rackSlot = 5
#d.setPerformanceMonitor('localhost')
commit()

print "Device is",d
d.collectDevice()

for device in dmd.Devices.getSubDevices():
    groups = device.getDeviceGroupNames()
    for a in range (0,len(groups)):
        if groups[a].find(chassisName):
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
            
            # Store info in slots
            
            slots[slotNum]= {'ip': ip}
            slotInfo = slots[slotNum]
            #slotInfo['ip'] = ip
            slotInfo['name'] = name 
            slotInfo['serial'] = serialNum
            slotInfo['class'] = className

print slots
            
#for device in dmd.Devices.getSubDevices():
    #for slotNum in range (0,len(slots)):
        #slotInfo = slots[slotNum]
        #if slotInfo['ip'] == device.getManageIp():
	    #if device.id != device.getDeviceName():
                #device.renameDevice(slotInfo['name'])
            #manf = device.getOSManufacturerName()
            #if not manf.find("Znyx"):
                #device.setHWSerialNumber(slotInfo['serial'])
                #device.rackSlot = slotNum
                
    #print device.getDeviceName()
    #print device.getHWSerialNumber()
    #print device.rackSlot
    
#dmd.Devices.reIndex()
#commit()


#import re
#for d in dmd.Devices.getSubDevices():
#	for iface in d.os.interfaces():
#	  ip = iface.getIpAddress()
#	  if ip == None:
#	       continue
#	  else:
#	       if re.compile('127\.0\.0\.1').search(ip):
#		    print d.id, iface.id, ip
		    
#dmd.Devices.reIndex()
#commit()


print "hallelujah"

  


