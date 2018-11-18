
#!/usr/bin/env python

import sys
import os
import re
import Globals
from Products.ZenUtils.ZenScriptBase import ZenScriptBase

dmd = ZenScriptBase(connect=True).dmd

def dump_command_output( cmd, timeout=120 ):
    """Run a command and spit out the output onto the web page
       using the context and out descriptors.
"""

    import fcntl
    import popen2
    import signal
    import time
    import select

    child = None
    try:
        try:       
            child = popen2.Popen4(cmd)
            flags = fcntl.fcntl(child.fromchild, fcntl.F_GETFL)
            fcntl.fcntl(child.fromchild, fcntl.F_SETFL, flags | os.O_NDELAY)
            endtime = time.time() + timeout
            #context.write(out, '%s' % cmd)
            #context.write(out, '')
            #print ('%s' % cmd)
            #print ('')
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
                        #context.write(out, t)
                        #print t
                        t = t.strip('\n')
                        #print t
                        cmds = t.split(' ')
                        #print cmds
                        snmpVal = cmds[len(cmds)-1]
                        if snmpVal.count('"'):
			     print snmpVal.strip('"')
			else:
			     print snmpVal
                        
                        
            if child.poll() == -1:
                #context.write(out,
                          #'Command timed out for %s' % cmd +
                          #' (timeout is %s seconds)' %
                           #timeout )
                print ("'Command timed out for %s" % cmd + " (timeout is %s seconds)" % timeout)
                
        except:
            #context.write( out, 'Error running command' )
            #context.write( out, 'type: %s  value: %s' % tuple(sys.exc_info()[:2]))
            #context.write(out, '')
            print ("Error running command type: %s  value: %s " % tuple(sys.exc_info()[:2]))
            
    finally:
        if child and child.poll() == -1:
            os.kill(child.pid, signal.SIGKILL)

def snmpwalk(device="", oid="", community=""):
    """Use the snmpwalk command to walk the device's MIB
       starting from the given oid.  Currently just uses the
       SNMP v1 style authentication, so only community is supported.
"""
    #mib_context= self.dmd.Mibs

    #try:
        #cmd= "snmpwalk -v 1 -c %s %s %s" % ( community, device, oid )
        #dump_command_output(cmd )

    #except:
        #print("Error invoking snmpwalk.")

    #print("Done SNMP walking the OID %s" % oid )

    try:
	 cmd= "snmpget -v 1 -c %s %s %s" % (community, device, oid)
	 dump_command_output(cmd)
    except:
	 print("Error invoking snmpget.")

    #print("Done SNMP get OID %s" % oid)

#for d in dmd.Devices.getSubDevices():
#     if d.id == '10.2.0.215':
#	  snmpwalk('10.2.0.215', '.1.3.6.1.4.1.688.2.3.15.7.1', 'public')

#f = open('/tmp/snmpfile', 'w')

#myList = []

def setup_chassis(device):
     shelfManagerIP = device.getManageIp()
     #SLOT 1
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.1', 'public')
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.1', 'public')    
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.1', 'public')
     #SLOT 2
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.2', 'public')
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.2', 'public')    
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.2', 'public')
     #SLOT 3
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.3', 'public')
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.3', 'public')    
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.3', 'public')
     #SLOT 4
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.4', 'public')
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.4', 'public')    
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.4', 'public')
     #SLOT 5
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.5', 'public')
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.5', 'public')    
     snmpwalk(shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.5', 'public')     


def setup_fabric(device):
     fabricIP = device.getManageIp()
     
     # Get Led Status
     snmpwalk(fabricIP, '.1.3.6.1.4.1.688.2.3.15.3.0', 'public')     
     snmpwalk(fabricIP, '.1.3.6.1.4.1.688.2.3.15.5.0', 'public') 
     
     # Get Link Status
     for a in range(1,20):
	  snmpwalk(fabricIP, '.1.3.6.1.4.1.688.2.3.15.7.1.2.' + str(a), 'public')      

def setup_base(device):
     baseIP = device.getManageIp()
     
     # Get Led Status
     snmpwalk(baseIP, '.1.3.6.1.4.1.688.2.3.14.3.0', 'public')     
     snmpwalk(baseIP, '.1.3.6.1.4.1.688.2.3.14.5.0', 'public') 
     
     # Get Link Status
     for a in range(1,26):
	  snmpwalk(baseIP, '.1.3.6.1.4.1.688.2.3.14.7.1.2.' + str(a), 'public') 
	  
for d in dmd.Devices.getSubDevices():
     groups = d.getDeviceGroupNames()
     for g in groups:
	  if g == "/Demo_1900":
	       name = d.name()
	       if name.find('Shelf') != -1:
	           setup_chassis(d)
	       elif name.find('Fabric') != -1:
		   setup_fabric(d)
	       elif name.find('Base') != -1:
		   setup_base(d)
	       #else:
		    #SAVE SLOT 4 & SLOT 5 IPs
	           
#	       myList.append( g + " " + d.name() + " " + d.getManageIp())
#	       #print g, " ", d.name(), " ", d.getManageIp()
#	       f.write("/Demo_1900 " + d.name() + " " + d.id + " ")
#	       f.write(d.getManageIp())


#f.close()

#print('\t'.join(myList))

print "hallelujah"

  


