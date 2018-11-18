
#!/usr/bin/env python

import logging
import os
import re
import sys
import time
import os.path
import Globals
from xml.dom.minidom import Document
from xml.dom.minidom import parse, parseString

from Products.ZenUtils.Utils import zenPath

#Define literals

shelfMgrSlot = 0
zx1900BaseSlot = 1
zx1900FabSlot = 2
zx7300Slot = 3
sbc1Slot = 4
sbc2Slot = 5

maxSlots = 6
maxPorts = 30

def get_snmp_value( cmd, timeout=120 ):
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
                        if cmds[0].find('Timeout'):			 
			    snmpVal = cmds[len(cmds)-1]
                            if snmpVal.count('"'):
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

def setup_chassis(slots):
  
     #SLOT 0 -- Shelf Manager
     
     shelfManagerIP = slots[shelfMgrSlot]['ip']
     slots[shelfMgrSlot]['name'] = "SHMM"
     slots[shelfMgrSlot]['serial'] = "0"
     
     #SLOT 1 -- 1900 Base
 
     d = slots[zx1900BaseSlot]
     
     # Get name
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.1'))
     d['name'] = val     
     # Get M state
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.1'))    
     d['mState'] = val     
     # Get serial number
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.1'))
     d['serial'] = val
     
     #SLOT 2 -- 1900Fabric
     
     d = slots[zx1900FabSlot]  
     
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.2'))
     d['name'] = val      
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.2'))
     d['mState'] = val    
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.2'))
     d['serial'] = val
     
     #SLOT 3 -- 7300
     
     d = slots[zx7300Slot] 

     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.3'))
     d['name'] = val  
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.3'))    
     d['mState'] = val
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.3'))
     d['serial'] = val
     
     #SLOT 4 -- SBC
  
     d = slots[sbc1Slot] 
  
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.4'))
     d['name'] = val
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.4'))    
     d['mState'] = val
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.4'))
     d['serial'] = val
     
     #SLOT 5 -- SBC
     
     d = slots[sbc2Slot] 
       
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.5'))
     d['name'] = val
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.5'))    
     d['mState'] = val
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.5'))     
     d['serial'] = val
     
def setup_base(slots,ports):
     
     d = slots[zx1900BaseSlot]
     baseIP = d['ip']
     
     # Get Led Status
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', baseIP, '.1.3.6.1.4.1.688.2.3.14.3.0'))
     if val == 1:
	  ledVal = "off"
     else:
	  ledVal = "on"
     d['intLED'] = ledVal
     
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', baseIP, '.1.3.6.1.4.1.688.2.3.14.5.0')) 
     if val == 1:
	  ledVal = "off"
     else:
	  ledVal = "on"
     d['extLED'] = ledVal 
     
     # Get Link Status
     
     basePorts = ports[zx1900BaseSlot]
     for a in range(1,26):
	  val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', baseIP, '.1.3.6.1.4.1.688.2.3.14.7.1.2.' + str(a)))
	  if val == 1:
	      linkVal = "up"
	  else:
	      linkVal = "down"
	  d['port'+str(a)] = linkVal	      
          #basePorts[a-1] = linkVal         
     #d['ports'] = basePorts


def setup_fabric(slots,ports):
     
     d = slots[zx1900FabSlot]
     fabricIP = d['ip']
     
     # Get Led Status
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', fabricIP, '.1.3.6.1.4.1.688.2.3.15.3.0'))     
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', fabricIP, '.1.3.6.1.4.1.688.2.3.15.5.0')) 
     
     # Get Link Status
     fabricPorts = ports[zx1900FabSlot]
     for a in range(1,20):
	  val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', fabricIP, '.1.3.6.1.4.1.688.2.3.15.7.1.2.' + str(a)))     
	  if val == 1:
	      linkVal = "up"
	  else:
	      linkVal = "down"
	  d['port'+str(a)] = linkVal
          #fabricPorts[a-1] = linkVal
     #d['ports'] = fabricPorts
    
class dict2xml(object):
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

    def display(self):
        print self.doc.toprettyxml(indent="  ") 
        
    def dump(self):
        return self.doc.toprettyxml(indent="  ") 
        
print "start"

# Initialize lists

slots=[None]*maxSlots
ports = [x[:] for x in [["down"]*maxPorts]*maxSlots]

# Use zxconfig.xml to set up slot/IP Addr map.

configFileName = "/home/kathyr/switchCode/oacontrol/src/kathy/ZenPacks/ZenPacks.znyx.OAControl/ZenPacks/znyx/OAControl/conf/zxconfig.xml"
configFile = open(configFileName)
doc = parse(configFile)
configFile.close()

for node in doc.getElementsByTagName('slotmap'):
     slot = node.getAttributeNode("slotid")
     ipAddr = node.getAttributeNode("ipaddr")
     slots[int(slot.nodeValue)]= {'ip': str(ipAddr.nodeValue)}     

# Generate internal tables from SNMP gets.

#setup_chassis(slots)
#setup_base(slots,ports)
#setup_fabric(slots,ports)

# Output lists to zxchassis.xml

#dictionary = {'zx1900':{'slot0':slots[0],'slot1':slots[1],'slot2':slots[2],'slot3':slots[3],'slot4':slots[4],'slot5':slots[5]}}
#xml = dict2xml(dictionary)

#chassisFileName = "/usr/local/zenoss/zenoss/zxchassis.xml"
#chassisFile = open(chassisFileName,'w')
#chassisFile.write(xml.dump())
#chassisFile.close()

# Get Product Name & Print it out

val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', '10.2.0.155', '.1.3.6.1.4.1.688.2.3.14.21.0'))
vname =  "1900_%s" % val
print vname

val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', '10.2.0.215', '.1.3.6.1.4.1.688.2.3.15.21.0'))
vname =  "1900_%s" % val
print vname

val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', '10.2.0.249', '.1.3.6.1.4.1.688.2.3.17.21.0'))
vname =  "1900_%s" % val
print vname

val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', '10.2.0.149', '.1.3.6.1.4.1.688.2.3.17.21.0'))
if val == "":
     print "empty string"
index = 0

numZXSBC = 1
devName = "%s_%s" % ("ZXSBC", str(numZXSBC))
print devName

print "hallelujah"

  


