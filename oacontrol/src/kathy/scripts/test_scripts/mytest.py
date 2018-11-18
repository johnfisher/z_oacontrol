
#!/usr/bin/env python

import Globals
import os.path

from xml.dom.minidom import parse, parseString
from StringIO import StringIO

from Products.ZenUtils.ZenScriptBase import ZenScriptBase
from transaction import commit


def write_serial_nums():

     f = open('/tmp/workfile', 'w')
     for d in dmd.Devices.getSubDevices():
	  #if d.id == "10.2.0.155":
	  print d.id, d.getHWSerialNumber()
	  f.write(d.id + " ")
	  f.write(d.getHWSerialNumber()) 

from shutil import copy
from Products.ZenUtils.Utils import zenPath

print "start"

#dmd = ZenScriptBase(connect=True).dmd
#print "before write_serial_nums"
#write_serial_nums()
#print "after write_serial_nums"

#srcDir = "/usr/local/zenoss/zenoss/ZenPacks/ZenPacks.znyx.OAControl-1.0-py2.6.egg/ZenPacks/znyx/OAControl/libexec"
#dstDir = "/usr/local/zenoss/zenoss"
#files = os.listdir(srcDir)
#for f in files:
     #if not f.endswith('pyc'):
	  #copy(f, dstDir) 


#configFileName = "/home/kathyr/switchCode/oacontrol/src/kathy/ZenPacks/ZenPacks.znyx.OAControl/ZenPacks/znyx/OAControl/conf/zxconfig.xml"

#configFile = open(configFileName)

#doc = parse(configFile)

#print doc.toxml()

slots=[None]*6

#print "empty slots"

slot0_IP = "10.2.6.10"
slot1_IP = "10.2.6.215"
slot2_IP = "10.2.0.155"
slot3_IP = "10.2.0.249"
slot4_IP = "10.2.0.84"
slot5_IP = "10.2.0.85"

for slotNum in range (0,len(slots)):
    slotIP = "slot%s_IP" % slotNum
    slots[slotNum]= {'ip': slotIP}

print slots

#shelfMgrSlot = 0

#for node in doc.getElementsByTagName('slotmap'):
#     slot = node.getAttributeNode("slotid")
#     #print slot.nodeValue
#     ipAddr = node.getAttributeNode("ipaddr")
     #print ipAddr.nodeValue
#     slots[int(slot.nodeValue)]={'ip': str(ipAddr.nodeValue)}

#for a in range(0,len(slots)):
     #print slots[a]
#     d = slots[a]
     #print d['ip']

#print slots[shelfMgrSlot]['ip']

#ports = [x[:] for x in [["down"]*30]*6]
#print ports

#basePorts= ports[1]
#for a in range(1,26):
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', baseIP, '.1.3.6.1.4.1.688.2.3.14.7.1.2.' + str(a)))
#     basePorts[a-1] = "up"
#     slots[1]['ports'] = basePorts
#slots[1]['name']="ZX1900BaseDevice_1"
#print slots[1]

# Go get SNMP Stuff

#slots[0]['name']="SHMM"
#slots[0]['serial']= ""
#try:
#     print slots[0]['serial']
#except:
#     print "does not exist"
     
#slots[0]['ip']="10.2.6.10"
#slots[2]['name']="ZX1900FabricDevice_1"
#slots[3]['name']="ZX7300_1"
#slots[4]['name']="ZXSBC_1"
#slots[5]['name']="ZXSBC_2"
#slots[5]['mState']= "0"

#print slots

#import shutil

#zxdevicesFileName = "/usr/local/zenoss/zenoss/device.xml"
#last_zxdevicesFileName = "/usr/local/zenoss/zenoss/last_device.xml"

# Copy zxdevices.xml to old_zxdevices.xml
#shutil.copyfile(zxdevicesFileName, last_zxdevicesFileName)

#import filecmp

#dc = filecmp.cmp(zxdevicesFileName, last_zxdevicesFileName)
#print dc
#diffStr = "diff %s %s" % (zxdevicesFileName, last_zxdevicesFileName)
#diffs = os.system(diffStr)
#str(diffs).strip()
#diffs.split()

#import difflib

#filesDiffer = False
#diff=difflib.unified_diff(open(zxdevicesFileName).readlines(), open(last_zxdevicesFileName).readlines())

#try:
    #while 1:
        #line = diff.next()
        #if line.startswith("+ ") or line.startswith("- "):
	   #  if (line.find("export") == -1):
	#	 filesDiffer = True
	   #      break        
#except:
    #pass

#print filesDiffer

#chassisName = "1900"

# Retrieve device info from Zenoss
#dmd = ZenScriptBase(connect=True).dmd
#for device in dmd.Devices.getSubDevices():
    #groups = device.getDeviceGroupNames()
    #for a in range (0,len(groups)):
        #if groups[a].find(chassisName):
            #slot = device.rackSlot
            #slotWords = (str(slot)).split()
            #slotNum = int(slotWords[len(slotWords)-1])
            #serialNum = device.getHWSerialNumber()
            #name = device.getDeviceName()
            #ip = device.getManageIp()
            #classPath = device.getDeviceClassPath()
            #classPath.strip()
            #classes = classPath.split('/')
            #className = classes[len(classes)-1]
            
            # Store info in slots
            #slotInfo = slots[slotNum]
            #slotInfo['ip'] = ip
            #slotInfo['name'] = name 
            #slotInfo['serial'] = serialNum
            #slotInfo['class'] = className

#print slots
            
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

#deviceFileName = "/usr/local/zenoss/zenoss/test_currentConfiguration.xml"

#deviceDoc = parse(deviceFileName)

#for node in deviceDoc.getElementsByTagName('object'):
     #id = node.getAttributeNode("id")  
     #if id == "OAswitch"
     #print id.nodeValue
     
#zxchassisFileName = "/usr/local/zenoss/zenoss/zxchassis.xml"

#zxchassisDoc = parse(zxchassisDocFileName)

#print zxchassisDoc.toxml()

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

#import os
#print "events..."
#os.system("/usr/local/zenoss/zenoss/bin/zendump -R /zport/dmd/Events -o /usr/local/zenoss/zenoss/events.xml")

print "hallelujah"

  


