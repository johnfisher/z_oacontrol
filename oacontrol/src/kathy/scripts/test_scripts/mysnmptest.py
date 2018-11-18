
#!/usr/bin/env python

import os
import re
import sys
import time
import Globals
from Products.ZenUtils.ZenScriptBase import ZenScriptBase

dmd = ZenScriptBase(connect=True).dmd

def get_snmp_value( cmd, timeout=120 ):
    """Run a command and spit out the output onto the web page
       using the context and out descriptors.
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
                        #print t
                        cmds = t.split(' ')
                        #print cmds
                        snmpVal = cmds[len(cmds)-1]
                        if snmpVal.count('"'):
			     rtnVal = snmpVal.strip('"')
			else:
			     rtnVal = snmpVal
                        
                        
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
            
    return rtnVal

#for d in dmd.Devices.getSubDevices():
#     if d.id == '10.2.0.215':
#	  snmpwalk('10.2.0.215', '.1.3.6.1.4.1.688.2.3.15.7.1', 'public')

#f = open('/tmp/snmpfile', 'w')

#myList = []

def setup_chassis(device,logger):
     shelfManagerIP = device.getManageIp()
     
     #SLOT 1
     
     # Get name
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.1'))
     logger.info(val)
     
     # Get M state
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.1'))    
     logger.info(val)
     
     # Get serial number
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.1'))
     logger.info(val)
     
     #SLOT 2
     
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.2'))
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.2'))    
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.2'))

     #SLOT 3
     
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.3'))
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.3'))    
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.3'))

     #SLOT 4
     
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.4'))
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.4'))    
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.4'))

     #SLOT 5
     
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.5'))
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.5'))    
     #val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, '.1.3.6.1.4.1.16394.2.1.1.32.1.17.5'))     


def setup_fabric(device):
     fabricIP = device.getManageIp()
     
     # Get Led Status
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', fabricIP, '.1.3.6.1.4.1.688.2.3.15.3.0'))     
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', fabricIP, '.1.3.6.1.4.1.688.2.3.15.5.0')) 
     
     # Get Link Status
     for a in range(1,20):
	  val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', fabricIP, '.1.3.6.1.4.1.688.2.3.15.7.1.2.' + str(a)))     

def setup_base(device):
     baseIP = device.getManageIp()
     
     # Get Led Status
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', baseIP, '.1.3.6.1.4.1.688.2.3.14.3.0'))     
     val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', baseIP, '.1.3.6.1.4.1.688.2.3.14.5.0')) 
     
     # Get Link Status
     for a in range(1,26):
	  val = get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', baseIP, '.1.3.6.1.4.1.688.2.3.14.7.1.2.' + str(a))) 

def do_main_program(logger):

	logger.info("do_main_program")
	
	f = open('/tmp/snmpfile', 'w')
	for a in range(1,6): 
	  f.write("a = " + str(a) + "\n")
 	f.write("hallelujah")
	f.close()
 
	for d in dmd.Devices.getSubDevices():
	  groups = d.getDeviceGroupNames()
	  for g in groups:
	       if g == "/Demo_1900":
		    name = d.name()
		    if name.find('Shelf') != -1:
			 setup_chassis(d,logger)
		    #elif name.find('Fabric') != -1:
			 #setup_fabric(d)
		    #elif name.find('Base') != -1:
			 #setup_base(d)
		    #else:
			 #SAVE SLOT 4 & SLOT 5 IPs
			 
	logger.info("hallelujah\n")
         
#	       myList.append( g + " " + d.name() + " " + d.getManageIp())
#	       #print g, " ", d.name(), " ", d.getManageIp()
#	       f.write("/Demo_1900 " + d.name() + " " + d.id + " ")
#	       f.write(d.getManageIp())


#f.close()

#print('\t'.join(myList))

#for d in dmd.Devices.getSubDevices():
#    groups = d.getDeviceGroupNames()
#    for g in groups:
#        if g == "/Demo_1900":
#            name = d.name()
#            if name.find('Shelf') != -1:
#		 setup_chassis(d)
#print "hallelujah"

  


