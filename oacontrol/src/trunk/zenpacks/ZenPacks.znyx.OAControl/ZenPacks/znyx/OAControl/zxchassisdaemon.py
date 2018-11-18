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

sys.path.append('/usr/share/pyshared')
import pexpect
import telnetlib
import xml.etree.cElementTree as ET
from StringIO import StringIO

log = logging.getLogger("zen.zxchassisdaemon")  

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
    
# ZXCHASSISDAEMON
class zxchassisdaemon(CyclingDaemon):

    """
    Znyx Daemon to maintain chassis view.
    """
    name = 'zxchassisdaemon'
    
    # Filename paths  
    zxdevicesFileName = os.environ['ZENHOME'] + "/zxdevice.xml"
    tempdevicesFileName = os.environ['ZENHOME'] + "/new_zxdevice.xml"
    zxchassisFileName =  "/var/www/oac/oac.xml"
    
    cmdPrefix = os.environ['ZENHOME']
    
    # Chassis modeling arrays
    ports = []
    slots = []
  
    # Board status
    boardRemoved = 0
    boardAdded = 1
    boardHotSwap = 2
    boardUnchanged = 3  
    boardUnhealthy = 4
    
    # Zenoss organizer definitions
    
    znyxSwitchPrefix = "/Network/OASwitch/"
    znyxSBCPrefix = "/Network/ZXSBC/"
    nonZnyxPrefix = "/Network/"

    # Name definitions
    
    shelfMgrName = "ShelfMgr"
    zxsbcName = "MPCBL0030"
    zx7300Name = "ZX7300"
    zx2010Name = "ZX2010"
    zx9210Name = "ZX9210"
    
    # MStates
    
    noneMState = 0
    actReqMState = 2
    actMState = 3
    fruActiveMState = 4
    fruCommunicationLost = 7    

    # Other literals.
    onStr = "on"
    offStr = "off"
    upStr = "up"
    downStr = "down"
    emptyStr = ""
    fastStr = "fast"
    slowStr = "slow"
    
    empty = "empty"
    unreachable = "unreachable"
    ok = "ok"
 
    # Static date for RRD methods.
    # NOTE: This info could be obtained from the conf file.
    
    # Index into ipmbAddr array with slotNum. These are decimal values.
    ipmbAddr = ["32","134","136","138","140","142","144","130","132"]
    
    # LED Dictionary names
    ledNames = ['hot','oos','healthy','sys']
    
    # Types of RRD templates   
    rrdTypes = ["Power","Temp"]
    
    # NOTE: power_dpoint_names and dsource_name must agree with values
    #	in $ZENHOME/libexec/getSBCPowerValues.sh, getZX2010PowerValues.sh or getZX7300PowerValues.sh
    #   temp_dpoint_names and dsource_name must agree with values
    #	in $ZENHOME/libexec/getSBCTempValues.sh, getZX2010TempValues.sh or getZX7300TempValues.sh
    
    power_sbc_dpoint_names = ["ZXSBC_1_2V","ZXSBC_1_5V","ZXSBC_1_8V","ZXSBC_12V","ZXSBC_2_5V","ZXSBC_3_3V",\
        "ZXSBC_3_3V_SB","ZXSBC_5V","ZXSBC_5V_SB","ZXSBC_CPU0V","ZXSBC_CPU1V","ZXSBC_VBAT","ZXSBC_VTTDDR"]
    power_sbc_dpoint_oids = [20,29,22,26,23,24,16,25,17,27,28,19,21]    

    temp_sbc_dpoint_names = ["ZXSBC_Baseboard_Temp","ZXSBC_CPU0_Temp","ZXSBC_CPU1_Temp","ZXSBC_Drive_Temp",\
         "ZXSBC_DRAM_Temp","ZXSBC_Inlet_Temp"]        
    temp_sbc_dpoint_oids = [48,55,56,93,94,95]
 
    power_zx2010_dpoint_names = ["ZX2010_1_0VA","ZX2010_1_0VB","ZX2010_1_5V","ZX2010_2_5V","ZX2010_3_3V",\
        "ZX2010_3_3V_SB","ZX2010_3_6V"]        
    power_zx2010_dpoint_oids = [3,4,2,5,6,8,7]

    temp_zx2010_dpoint_names = ["ZX2010_Center_Temp"]        
    temp_zx2010_dpoint_oids = [9]

    power_zx7300_dpoint_names = ["ZX7300_1_0V","ZX7300_1_2V","ZX7300_1_25VVDD","ZX7300_1_5V","ZX7300_2_5V",\
        "ZX7300_3_3V","ZX7300_3_3V_SB","ZX7300_12V"]
    power_zx7300_dpoint_oids = [3,9,7,6,5,4,8,2]    

    temp_zx7300_dpoint_names = ["ZX7300_Bottom_Temp","ZX7300_Center_Temp","ZX7300_Top_Temp"]        
    temp_zx7300_dpoint_oids = [12,10,11]

    temp_zx9210_dpoint_names = ["ZX9210_CPU0_Temp","ZX9210_CPU1_Temp","ZX9210_DIMM_A_Max_Temp", \
        "ZX9210_DIMM_B_Max_Temp","ZX9210_DIMM_C_Max_Temp","ZX9210_DIMM_D_Max_Temp","ZX9210_DIMM_E_Max_Temp",\
        "ZX9210_DIMM_F_Max_Temp","ZX9210_DIMM_G_Max_Temp","ZX9210_DIMM_H_Max_Temp",\
        "ZX9210_CPU0_Thermal_Temp","ZX9210_CPU1_Thermal_Temp"]        
    temp_zx9210_dpoint_oids = [8,9,10,11,12,13,14,15,16,17,20,21]

    def __init__(self, *args, **kwargs):

        CyclingDaemon.__init__(self, *args, **kwargs) 

        log.info("zxchassisdaemon __init__")
             
        # Set up slots dictionary
        self.slots=[None]*self.options.numSlots  
        for slotNum in range (0, len(self.slots)):
            self.slots[slotNum] = {'ip' : eval("self.options.slot%s_IP" % slotNum)}
            self.slots[slotNum]['name'] = None
            
            
        # Set up ports dictionary
	# self.ports = [x[:] for x in [["down"]*self.options.maxPorts]*self.options.numSlots]
	
        # Set up current model of the chassis using data from Shelf Manager        
	self.setup_chassis(self.slots)
	
	# If unable to contact shelf manager then return.
        if self.slots[0]['status'] == self.unreachable:
	    log.info("Can't contact shelf manager")
            self.sendEvent(dict(
                device=self.options.monitor, component="zxchassisdaemon",
                eventClass='/App/Znyx', severity=0, 
                summary=("Exiting: Cannot contact shelf manager at %s" % self.slots[0]['ip'])))
            sys.exit("Exiting: Cannot contact shelf manager at %s" % self.slots[0]['ip'])    

	
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
        
            # Set zCommandPort and zCommandPath. Including these in the OAControl ZenPack
            # causes zxchassisdaemon crash.
            # NOTE: This is workaround for Problem 8810. 
        
            org = self.dmd.Devices.getOrganizer('/Network/OASwitch')
            org.setZenProperty('zCommandPort', '23')
            #org.setZenProperty('zCommandPath', '$ZENHOME/libexec')
            org.setZenProperty('zCommandProtocol','telnet')

	    # Set persnmpCycleInterval to 5 seconds and modelerCycleInterval to 5 minutes.
	    # NOTE: This is a fix for Problem 8811.
	    
	    self.dmd.Monitors.Performance.localhost.perfsnmpCycleInterval = 5
	    self.dmd.Monitors.Performance.localhost.modelerCycleInterval = 5
	    
	    # Set the Network Map Start Object to the 10.250.X.X network for ALL users.
	    # NOTE: This is a fix for Problem 8812. 
	    
	    for settings in self.dmd.ZenUsers.getAllUserSettings():
		settings.netMapStartObject = "10.250.0.0"
		
            # Generate event transform to save serial numbers with '/App/Znyx' events.
            # NOTE: This is a fix for Problem 8814.
            
            try:
		eo = self.dmd.Events.getOrganizer('/App/Znyx')
	    except:
		self.dmd.Events.createOrganizer('/App/Znyx')
		commit()
		eo = self.dmd.Events.getOrganizer('/App/Znyx')

		
            tStr = "import Globals\nevt.eventGroup = \"\"\nfor d in dmd.Devices.getSubDevices():\n\
                if d.id == evt.device:\n\
                    evt.eventGroup = str(d.getHWSerialNumber())"
                        
            eo.manage_editEventClassTransform(tStr)

            fields = list(self.dmd.ZenEventManager.defaultResultFields)
            if not 'eventGroup' in fields:
                insertIndex = fields.index('summary')
                fields.insert( insertIndex, 'eventGroup')
                self.dmd.ZenEventManager.defaultResultFields = fields

            fields = list(self.dmd.ZenEventHistory.DeviceResultFields)
            if not 'eventGroup' in fields:
                insertIndex = fields.index('summary')
                fields.insert( insertIndex, 'eventGroup')
                self.dmd.ZenEventHistory.defaultResultFields = fields
                
            # Delete the localhost device if it exists.
            # NOTE: This is a fix for Problem 8820.
            
            for d in self.dmd.Devices.getSubDevices():
		 if d.id == "localhost":
		      d.deleteDevice()
		      break

	    # Save initialization changes to the database.
	    commit()
            
            # Generate a zname for each device
            # NOTE: Must call setup_chassis first.
            for slotNum in range (0,len(self.slots)):
		 self.get_device_zname(self.slots[slotNum], slotNum)
 
            # If zxdevice.xml doesn't exist, have Zenoss generate it.
     
            #if (os.path.isfile(self.zxdevicesFileName) == False):
            # Dump the current device configuration.
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
   
            # Set device properties via Zenoss: SLOT, NAME, SERIAL NUMBER. Also, configuration properties.
            self.set_device_properties()
            
            log.info("after set_device_properties")
            # Generate RRD templates.
            
            log.info("__init__: before RRD templates")
            
            for slotNum in range (1,len(self.slots)):
	        slotInfo = self.slots[slotNum]

                # If this is an empty slot or the SHMM can't communicate with it then continue. 
                if slotInfo['status'] == self.empty or int(slotInfo['mstate']) == self.fruCommunicationLost:
	            continue
	        
                slotName = slotInfo['name']
                    
                log.info("__init__: before add templates for slot %s" % slotNum)
                self.add_rrd( slotNum, slotName)
                log.info("__init__: added templates for slot %s" % slotNum)
                
                commit()
            
            # Generate zxdevices.xml to reflect new configuration.
            os.system( self.cmdPrefix + "/bin/zendevicedump -o %s" % self.zxdevicesFileName) 
         	       
        else:
            log.info("__init__ not first-time initialization")
            
            # Use Zenoss device info to set up slots.
            self.get_device_properties()
 
        self.schedule = Scheduler(self.options)

        self.schedule.sendEvent = self.dmd.ZenEventManager.sendEvent

        self.schedule.monitor = self.options.monitor

        self.sendEvent(dict(
            device=self.options.monitor, component="zxchassisdaemon",
            eventClass='/App/Znyx', severity=0, summary="zxchassisdaemon started"))

    # RRD Template Methods
    
    def add_rrd(self, slotNum, slotName):
	 
        log.info("add_rrd: slotNum = %s, slotName = %s" % (slotNum,slotName))
 	     
        shmmIp = self.slots[0]['ip']
        try:
            shmm = self.dmd.Devices.findDevice(shmmIp)
        except:
	    log.info("add_rrd: unable to retrieve SHMM device")
	    return	 
	    
        for a in range (0,len(self.rrdTypes)): 
    
            templateType = self.rrdTypes[a]

            #There is no power RRD for 9210.
	    if templateType == "Power" and slotName == self.zx9210Name:
		continue

            dsource_name = slotName + "_" + templateType + "_" + str(slotNum)
            dpoint_names = []
            dpoint_oids = []	
            threshold_dpoints = []
            graph_dpoints = []
            cmdString = ""
	
            # Add power data sources and data points.
            if slotName == self.zxsbcName:
	        log.info( "add_rrd: fill in ZXSBC datasource/datapoints for %s" % templateType)
	
	        if templateType == "Power":
		    for a in range (0,len(self.power_sbc_dpoint_names)):
	                dpoint_names.append(self.power_sbc_dpoint_names[a] + "_" + str(slotNum))
                    dpoint_oids = self.power_sbc_dpoint_oids
                else:
		    for a in range (0,len(self.temp_sbc_dpoint_names)):
	                dpoint_names.append(self.temp_sbc_dpoint_names[a] + "_" + str(slotNum))	            
                    dpoint_oids = self.temp_sbc_dpoint_oids
		 
                cmdString = "getZXSBC" + templateType + "Values.sh ${here/manageIp} ${here/zSnmpCommunity} ${here/zSnmpVer} " \
                + self.ipmbAddr[slotNum] + " " + str(slotNum)

            elif slotName == self.zx9210Name:
		log.info( "add_rrd: fill in ZX9210 datasource/datapoints for %s" % templateType)
	        if templateType == "Power":
		    continue 
                else:
		    for a in range (0,len(self.temp_zx9210_dpoint_names)):		  
	                dpoint_names.append(self.temp_zx9210_dpoint_names[a] + "_" + str(slotNum))	            
                    dpoint_oids = self.temp_zx9210_dpoint_oids 
                    
                cmdString = "getZX9210"  + templateType + "Values.sh ${here/manageIp} ${here/zSnmpCommunity} ${here/zSnmpVer} " \
                + self.ipmbAddr[slotNum] + " " + str(slotNum)

	    elif slotName == self.zx2010Name:
	        log.info( "add_rrd: fill in ZX2010 datasource/datapoints for %s" % templateType)

	        if templateType == "Power":
		    for a in range (0,len(self.power_zx2010_dpoint_names)):		 
	                dpoint_names.append(self.power_zx2010_dpoint_names[a] + "_" + str(slotNum))	            
                    dpoint_oids = self.power_zx2010_dpoint_oids 
                else:
		    for a in range (0,len(self.temp_zx2010_dpoint_names)):		  
	                dpoint_names.append(self.temp_zx2010_dpoint_names[a] + "_" + str(slotNum))	            
                    dpoint_oids = self.temp_zx2010_dpoint_oids 
		 
                cmdString = "getZX2010"  + templateType + "Values.sh ${here/manageIp} ${here/zSnmpCommunity} ${here/zSnmpVer} " \
                + self.ipmbAddr[slotNum] + " " + str(slotNum)
	
	    elif slotName == self.zx7300Name:
	     
	        log.info( "add_rrd: fill in ZX7300 datasource/datapoints for %s" % templateType)

	        if templateType == "Power":
		    for a in range (0,len(self.power_zx7300_dpoint_names)):		 
	                dpoint_names.append(self.power_zx7300_dpoint_names[a] + "_" + str(slotNum))	            
                    dpoint_oids = self.power_zx7300_dpoint_oids 
                else:		 
		    for a in range (0,len(self.temp_zx7300_dpoint_names)):
	                dpoint_names.append(self.temp_zx7300_dpoint_names[a] + "_" + str(slotNum))	            
                    dpoint_oids = self.temp_zx7300_dpoint_oids 
		 
                cmdString = "getZX7300"  + templateType + "Values.sh ${here/manageIp} ${here/zSnmpCommunity} ${here/zSnmpVer} " \
                + self.ipmbAddr[slotNum] + " " + str(slotNum)
		     
            else:
	        log.info( "add_rrd: unsupported name = " + slotName)
	        continue
	
            # Form new power template name.
            templateName = "SHMM_" + templateType + "_Slot" + str(slotNum)
            log.info( "add_rrd: template name = " + templateName)
        
            # If current template exists then delete it, before adding.
            self.delete_rrd(templateName)
            shmm.addLocalTemplate(templateName)
            template = shmm.getRRDTemplateByName(templateName)
    
            # Bind the template.
            boundTemplates = shmm.zDeviceTemplates
            boundTemplates.append(templateName)
            shmm.bindTemplates(boundTemplates)
            log.info( "add_rrd: bind " + templateName)
    
            # Create datasource and datapoints.
            dpoints =  [None]*len(dpoint_names)  
            dsource = template.manage_addRRDDataSource(dsource_name, 'BasicDataSource.COMMAND')
	
            dsource.commandTemplate = cmdString
            dsource.cycletime = 60
            dsource.enabled = True
            dsource.severity = 2
			
            for a in range (0,len(dpoint_names)):
	        dpoints[a] = dsource.manage_addRRDDataPoint(dpoint_names[a])
                dpoints[a].rrdtype = "GAUGE"
        
            log.info("add_rrd: after add data points")
            #print dpoints
    
            # Create min/max thresholds.
 
            for a in range (0,len(dpoint_names)):
                threshold_dpoints.append(dsource_name + "_" + dpoint_names[a])

            for a in range (0,len(dpoint_oids)):
	 
                # Get M and R values for conversion of sensor thresholds.
	        mOid = (".1.3.6.1.4.1.16394.2.1.1.3.1.20.%s.%s" % (self.ipmbAddr[slotNum], dpoint_oids[a]))
	        mVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shmmIp, mOid)) 	 
	        rOid = (".1.3.6.1.4.1.16394.2.1.1.3.1.25.%s.%s" % (self.ipmbAddr[slotNum], dpoint_oids[a]))
	        rVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shmmIp, rOid)) 
	    
	        # Get upper critical threshold
	        # TODO: There is a a bug for VBAT. Upper critical is zero which is incorrect. Set it to 255.
	        if dpoint_names[a] == "SBC_VBAT":
	            ucVal = 255
	        else:
	            ucOid = (".1.3.6.1.4.1.16394.2.1.1.3.1.36.%s.%s" % (self.ipmbAddr[slotNum], dpoint_oids[a])) 
	            ucVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shmmIp, ucOid)) 
                upperCritical = (int(mVal) * int(ucVal)) * (10 ** int(rVal))
 
  	        # TODO: There is a bug for getting lower critical temperatures. Incorrect values returned from SHMM.	    
	        if templateType == "Temp":
		    # TODO: Remove this when these sensors are moved to discrete report.
		    if (dpoint_names[a].find("ZX9210_CPU0_Thermal_Temp") != -1) or (dpoint_names[a].find("ZX9210_CPU1_Thermal_Temp") != -1):
		        lowerCritical = 0
		    else:
                        lowerCritical = 2
                    #log.info("dpoint_names = %s, lowerCritical = %s" % (dpoint_names[a],lowerCritical))
                else:
	            # Get lower critical threhold
	            lcOid = (".1.3.6.1.4.1.16394.2.1.1.3.1.39.%s.%s" % (self.ipmbAddr[slotNum], dpoint_oids[a]))
	            lcVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shmmIp, lcOid)) 
                    lowerCritical = (int(mVal) * int(lcVal)) * (10 ** int(rVal))
            
	        # Create threshold
	        threshold = template.manage_addRRDThreshold(dpoint_names[a] + "_Threshold", "MinMaxThreshold")
	    	 
	        threshold.maxval = upperCritical
	        threshold.minval = lowerCritical
	        threshold.severity = 3
	        threshold.enabled = True
	 
	        threshold.dsnames = []
	        threshold.dsnames.append(threshold_dpoints[a])	 
	    
	        #print threshold.dsnames
	 
	        log.info( "%s threshold created at %s, max=%s, min=%s, dpoint=%s" % (threshold.id, threshold.getPrimaryUrlPath(), upperCritical, lowerCritical, threshold.dsnames))
	     
            # Create graph.

            graphName = "Slot" + str(slotNum) + "_" + templateType + "_" + slotName
    
            foundGraph = False
            currentGraphs = template.getGraphDefs()
            if len(currentGraphs) > 0:
                for g in currentGraphs:
	            if graphName == g.id:
		        graph = g
		        foundGraph = True
		 
            if foundGraph == False:
	        graph = template.manage_addGraphDefinition(graphName)
            if templateType == "Power":
                graph.units = "Volts"
                graph.height = 200
                graph.width = 500
                graph.miny = 0
                graph.maxy = 15
            else:
                graph.units = "Degrees Centigrade"
                graph.height = 100
                graph.width = 500
                graph.miny = 0
                graph.maxy = 70
    
            graph.manage_deleteGraphPoints(graph.getGraphPointsNames())        
     
            graph.manage_addDataPointGraphPoints(threshold_dpoints)
  
	    # Change the graph point names to something more user-friendly.
            gps = graph.getGraphPoints()
            for g in gps:
	        g.legend =g.id[g.id.find("ZX"):]

            log.info( "%s graph was created with %s DataPoints attached at %s" % (graph.id, graph_dpoints, graph.getPrimaryUrlPath()))

    def check_rrds(self, slots):
	 
	log.info("check_rrd")

        shmmIp = slots[0]['ip']
        try:
            shmm = self.dmd.Devices.findDevice(shmmIp)
            templates = shmm.getRRDTemplates()
        except:
	    log.info("unable to retrieve SHMM device")
	    return

        for slotNum in range (1,len(self.slots)): 
        
            slotInfo = self.slots[slotNum]
            
            if slotInfo['status'] == self.empty or int(slotInfo['mstate']) == self.fruCommunicationLost:
	        continue
	   
            foundTemplate = False           
	    for t in templates:
	        words = t.id.split('_')
	        if words[len(words)-1].find(str(slotNum)) != -1:
	            log.info("check_rrd: found %s" % t.id)
                    foundTemplate = True
                    break
                   
            if foundTemplate == False:
	        self.add_rrd(slotNum, slotInfo['name'])

    def delete_rrd(self, templateName):
	 
        log.info("delete_rrd")

        shmmIp = self.slots[0]['ip']
        try:
            shmm = self.dmd.Devices.findDevice(shmmIp)
        except:
	    log.info("unable to retrieve SHMM device")
	    return

        if templateName != None:
	    templates = shmm.getRRDTemplates()
	    for t in templates:
                if t.id == templateName:
                    log.info( "delete_rrd: delete " + templateName)
	            shmm.removeLocalRRDTemplate(t.id)

    def delete_slot_rrd(self, shmm, slotNum):
        slot = str(slotNum)
        log.info("delete_slot_rrd: slot= " + slot)
        templates = shmm.getRRDTemplates()
        for t in templates:
	    if t.id.endswith(slot):
                log.info( "delete_slot_rrd: delete " + t.id)
	        shmm.removeLocalRRDTemplate(t.id)
	      
    def add_device(self, doc, slotInfo):
     
        #Add device to XML document.
        log.info("add_device")
    
        # Retrieve board name & IP address for the slot.
        devName = slotInfo['name']
        devIP = slotInfo['ip']
    
        # If this is an empty slot then return.
	if devName == None:    
	    return
	 
        # Check to see if a device of this board type has already been created.
    
        tomanycontEl = None
    
        for element in doc.getElementsByTagName('object'):
            id = element.getAttribute("id")
            if (id == devName):
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
            if (id == devName):
                element.appendChild(tomanycontEl)

    def add_dmd_device(self, ip, name, path, group, slot, serial):
	 
        log.info("add_dmd_device")
      
        # Return if device already exists.
        for device in self.dmd.Devices.getSubDevices():
	     devIp = device.getManageIp()
	     if devIp == ip:
		  # Generate an event and return.
		  log.info("Device at mgt IP address %s already exists." % ip)
		  self.sendEvent(dict(
		      device=self.options.monitor, component="zxchassisdaemon",
                      eventClass='/App/Znyx', severity=4, 
                      summary=("zxchassisdaemon: Device at mgt IP address %s already exists." % ip)))
                  return False
                  
        try:          
            #Add device to Zenoss via dmd.                  
            self.dmd.DeviceLoader.loadDevice(name, path,
                self.emptyStr, serial,               # tag, serialNumber,
                self.emptyStr,self.emptyStr, None,   # zSnmpCommunity, zSnmpPort, zSnmpVer,
                slot, 1000, self.emptyStr,           # rackSlot, productionState (1000=Production), comments,
                self.emptyStr, self.emptyStr,        # hwManufacturer, hwProductName,
                self.emptyStr, self.emptyStr,        # osManufacturer, osProductName.
                self.emptyStr, [group], [], 	 # locationPath,groupPaths,systemPaths,
                "localhost","none")                  # performanceMonitor, discoverProto
 
            d=self.dmd.Devices.findDevice(name)
            d.setManageIp(ip)
            commit()
            d.collectDevice()
            return True
	    
        except:
            # Generate an event and return.
	    log.info("Cannot add device at mgt IP address %s." % ip)
	    self.sendEvent(dict(
	        device=self.options.monitor, component="zxchassisdaemon",
                eventClass='/App/Znyx', severity=4, 
                summary=("zxchassisdaemon: Cannot add device at mgt IP address %s." % ip)))
            return False          


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
                               default="2000")                              
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
        self.parser.add_option('--slot6_IP',
                               dest='slot6_IP',
                               type='string',
                               help='IP Address of Slot6')
        self.parser.add_option('--slot7_IP',
                               dest='slot7_IP',
                               type='string',
                               help='IP Address of Slot7')
        self.parser.add_option('--slot8_IP',
                               dest='slot8_IP',
                               type='string',
                               help='IP Address of Slot8')                               
    def clearSlot(self, slotInfo, slotNum):
	 
	# Clear up slot entry for removed or hot swapped board.
	log.info("clearSlot")

	#slotInfo = self.slots[slotNum]

	keylist = slotInfo.keys()
	for key in keylist:
	    if key == 'ip':
                log.info("Clearing slot for ip = %s" % slotInfo['ip'])
	    elif key == 'status':
		slotInfo['status'] = self.empty
	    elif key == 'serial':
		slotInfo['serial'] = None
	    else:
		if key != 'name' and key != 'mstate':
		    del slotInfo[key]
		    
    def get_device_zname (self, slotInfo, slotNum):
	 
        # Return unique name for specified device type. The algorithem is <name>_<slotNum>.
        log.info("get_device_zname")

        # If this is an unreachable or empty slot then continue.
        #if slotInfo['status'] == self.unreachable or slotInfo['status'] == self.empty:
        if slotInfo['status'] == self.empty:
	    slotInfo['zname'] = None
	    return

        # Initialize data   
        slotInfo['zname'] = self.emptyStr
 	ip = slotInfo['ip']
 	
        # Return if name hasn't been set. Can't determine zname.
	if slotInfo['name'] == None:
	    log.info("name not set for ip =%s" % ip)  
	    return	     
	
        if slotInfo['name'] == "ShelfMgr":
            slotInfo['zname'] = "SHMM"
        elif slotInfo['name'] == self.zx2010Name:
            slotInfo['zname'] = "%s_%s" % (self.zx2010Name,str(slotNum))
	elif slotInfo['name'] == self.zx7300Name:
            slotInfo['zname'] = "%s_%s" % (self.zx7300Name,str(slotNum))
	elif slotInfo['name'] == self.zx9210Name:
            slotInfo['zname'] = "%s_%s" % (self.zx9210Name,str(slotNum))
	elif slotInfo['name'] == self.zxsbcName:
            slotInfo['zname'] = "%s_%s" % (self.zxsbcName,str(slotNum))
	else:
	     log.info("unknown name %s" % slotInfo['name'])

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
		        serialNum = self.emptyStr
                    name = device.getDeviceName()
                    ip = device.getManageIp()
                    organizerPath = device.getDeviceClassPath()
                    organizerPath.strip()
                    organizers = organizerPath.split('/')
                    organizerName = organizers[len(organizers)-1]
 	     
 	            # NOTE: Code no longer needed because Zenoss
 	            #    has the correct slot number.
                    # Find the right slot.
                    #for slotNum in range (0,len(self.slots)):
		        #if self.slots[slotNum]['ip'] == ip:
		        
                    # Store info in slots if the slot isn't empty.
                    # In that case, the device will be deleted in process_config_changes.
                    slotInfo = self.slots[slotNum]
                    if slotInfo['status'] != self.empty:
                        slotInfo['zname'] = name 
                        slotInfo['name'] = organizerName
                        slotInfo['serial'] = serialNum
                    break
                    
    def get_snmp_value(self, cmd, timeout=2.5):

	# Run SNMP get and spit out the output.
	
        child = None
        rtnVal = self.emptyStr
    
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
                            if t.count('"'):
				t = t.strip('\r\n')                           
                                t = t.replace('"',' ')
                                t = t.rstrip()
                            else:
                                t = t.strip('\n')
                            #log.info ("t = %s" % t)
                            cmds = t.split(' ')
                            
                            if cmds[0].find('Timeout') != -1:
        			rtnVal = self.emptyStr
        		    else:
			        snmpVal = cmds[len(cmds)-1]
			        if snmpVal.find("SNMP") != -1:
				    rtnVal = self.emptyStr
				elif snmpVal.count('='):
				    rtnVal = self.emptyStr
                                #elif snmpVal.count('"'):
			            #rtnVal = snmpVal.strip('"')
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

    def parse_zreg_results (self,r):
	 
        lines = r.splitlines()

        for index in range(1,len(lines)):
	    line = lines[index]
	    values = line.split('[')
	    hexValue = int(values[0],16)
	    
        return hexValue
        
    def process_config_changes(self):
	 
        #Determine if chassis or Zenoss configuration has changed and process any changes.
        log.info("process_config_changes")  
         
        # CHASSIS CHANGES
        newSlots=[None]*self.options.numSlots
        slotStatus=[None]*self.options.numSlots 
     
        # Initialize IP addresses in new table.
        for slotNum in range (0,len(self.slots)):
                newSlots[slotNum] = {'ip': self.slots[slotNum]['ip']}
                newSlots[slotNum]['name'] = None
        
        # Get the latest board name, serial number and mstate from the shelf manager.
        
        self.setup_chassis(newSlots)

        # If unable to contact shelf manager then return.
        if newSlots[0]['status'] == self.unreachable:
	    log.info("process_config_changes: can't contact shelf manager")
	    # Generate event
	    self.sendEvent(dict(
                device=self.options.monitor, component="zxchassisdaemon",
                eventClass='/App/Znyx', severity=4, summary="zxchassisdaemon: Shutting down. No SHMM communication."))
            return
   
        # Was SHMM deleted in Zenoss? If so, add it back first.
        # NOTE: add_dmd_device will check to see whether device exists before adding it.       
        
        newShmm = False
        if self.slots[0]['zname'].find("SHMM") == -1:
	    shmmClassPath = self.nonZnyxPrefix + self.shelfMgrClass
            newShmm = self.add_dmd_device(self.slots[0]['ip'], self.slots[0]['zname'],shmmClassPath, self.options.chassisName, 0, self.slots[0]['serial'])

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
	    
            if newSlotInfo['status'] == self.empty:
		newSerial = None
		newClass = None
		newMState = self.noneMState
	    #elif newSlotInfo['status'] == self.unreachable:
		#log.info("slotInfo for slot %s = %s" % (slotNum, slotInfo))
		#log.info("newSlotInfo for slot %s = %s" % (slotNum, newSlotInfo))
		# Fix for 9363: If can't get new slot info then save mState before continuing.
		#slotInfo['mstate'] = int(newSlotInfo['mstate'])
		#continue
            else:
                newSerial = newSlotInfo['serial']
                newMState = int(newSlotInfo['mstate'])
                newName = newSlotInfo['name']
 
            if slotInfo['status'] == self.empty:
		oldSerial = None
		oldName = None
		oldMState = self.noneMState
            else:
                oldSerial = slotInfo['serial']
                oldMState = int(slotInfo['mstate'])
                oldName = slotInfo['name']
 
            if newMState == self.noneMState:
                if oldMState == self.noneMState or oldName == None or oldSerial == None:
		    # No Change -- slot still empty.
		    slotStatus[slotNum] = self.boardUnchanged 		  
	        else:	
		    # Board Removed.
		    slotStatus[slotNum] = self.boardRemoved 
            elif newMState == self.fruActiveMState or newMState == self.actReqMState or newMState == self.actMState:
	        if ((oldMState == self.noneMState) or (oldName == None) or (oldSerial == None)):
		    # Board Added
		    slotStatus[slotNum] = self.boardAdded             
		    log.info("BOARD ADDED: newSerial = %s, newMState= %s, newName= %s" % (newSerial, newMState, newName))
	            log.info("oldSerial = %s, oldMState= %s, oldName= %s" % (oldSerial, oldMState, oldName))
                elif (newSerial != oldSerial) or (newName != oldName):
		    # Hot Swap
		    slotStatus[slotNum] = self.boardHotSwap 
		    log.info("BOARD HOTSWAP: newSerial = %s, newMState= %s, newName= %s" % (newSerial, newMState, newName))
		    log.info("oldSerial = %s, oldMState= %s, oldName= %s" % (oldSerial, oldMState, oldName))
                else:		
		    # No Change
		    slotStatus[slotNum] = self.boardUnchanged
	    else:
		# Board is inactive, deactivating, or not communicating.
		slotStatus[slotNum] = self.boardUnhealthy
 		       
        # ZENOSS CHANGES

        foundDevices=[False]*self.options.numSlots  
        
        for device in self.dmd.Devices.getSubDevices():  
            groups = device.getDeviceGroupNames()
            for a in range (0,len(groups)):
                if groups[a].find(self.options.chassisName) != -1:
                    slot = device.rackSlot
                    slotWords = (str(slot)).split()
                    zenossSlotNum = int(slotWords[len(slotWords)-1])                  
                
                    serialNum = device.getHWSerialNumber()
                    name = device.getDeviceName()
                    ip = device.getManageIp()
                    organizerPath = device.getDeviceClassPath()
                    organizerPath.strip()
                    organizers = organizerPath.split('/')
                    organizerName = organizers[len(organizers)-1]
                                 
                    # User could have changed slot, serial, ip, name or organizer.
                    
		    # Try to find slot by finding a match for the IP address.
		    # If there's no match, then delete the device.
		    # Changing the IP address is not allowed.
		    for slotNum in range (0,len(self.slots)): 
		        if ip == self.slots[slotNum]['ip']:
			     break
			     
		    if slotNum >= len(self.slots):
			 log.info("process_config_changes: invalid managed IP = %s" % ip)
			 self.sendEvent(dict(
                            device=self.options.monitor, component="zxchassisdaemon",
                            eventClass='/App/Znyx', severity=4, 
                            summary=("zxchassisdaemon: Device has invalid mgt IP address %s." % ip)))
			 continue
			
		    foundDevices[slotNum] = True
		    
                    # User not allowed to change IP address in first release. 
                    # Change it back & generate event.
                    # NOTE: Test changing IP later.
                    #if (ip != self.slots[slotNum]['ip']) and (ip != newSlots[slotNum]['ip']):
                        #log.info("process_config_changes: user changed manage IP to %s" % ip)
                        #log.info("slotNum = %s" % slotNum)
                        #log.info("self ip = %s" % self.slots[slotNum]['ip'])
                        #log.info("new ip = %s" % newSlots[slotNum]['ip'])
                        #device.setManageIp(newSlots[slotNum]['ip'])
                        #self.sendEvent(dict(
                            #device=self.options.monitor, component="zxchassisdaemon",
                            #eventClass='/App/Znyx', severity=4, 
                            #summary=("zxchassisdaemon: User changed device %s mgt IP address." % name)))

		    if self.slots[slotNum]['status'] != self.empty:
                        # User not allowed to change organizer.
                        # Change it back & generate event.
                        if organizerName != self.slots[slotNum]['name'] and organizerName != newSlots[slotNum]['name']:
                            log.info("process_config_changes: user changed device name to %s" % organizerName)
			    if (newSlots[slotNum]['name'] == self.shelfMgrName):	 
                                prefix = self.nonZnyxPrefix
                            elif (newSlots[slotNum]['name'] == self.zxsbcName) or (newSlots[slotNum]['name'] == self.zx9210Name):
				prefix = self.znyxSBCPrefix
		            else:
		                prefix = self.znyxSwitchPrefix		 
	                    newOrganizerPath = prefix + newSlots[slotNum]['name']
	                    log.info("slotNum = %s" % slotNum)
	                    log.info("newClassPath = %s" % newOrganizerPath)
                            device.moveDevices(newOrganizerPath,device.id)
                            self.sendEvent(dict(
                                device=self.options.monitor, component="zxchassisdaemon",
                                eventClass='/App/Znyx', severity=4, 
                                summary=("zxchassisdaemon: User changed device organizer to %s." % organizerName)))
                 
                        # User can change zname...This is OK. Just update internal tables.
                        newSlots[slotNum]['zname'] = name
                     
        for slotNum in range (1,len(newSlots)): 
    
            status = slotStatus[slotNum]
                 
            if status == None:
                continue

	    # Fix for 9363: Update the M state
	    self.slots[slotNum]['mstate'] = int(newSlots[slotNum]['mstate']) 

	    #if newSlots[slotNum]['status'] == self.unreachable:
		#continue
	   
	    # Check for case where user might have deleted a valid device in Zenoss.
	    # This would be a user error that should be corrected.
	    
	    if (status == self.boardUnchanged):
		if (newSlots[slotNum]['status'] != self.empty) and (foundDevices[slotNum] == False):
		    status = self.boardAdded
		else:
		     #If we just added the SHMM, then we need to recreate this slot's RRD graphs.
		     if newShmm == True:
			 self.add_rrd(slotNum, newSlots[slotNum]['name'])
		     continue
		
            if (status == self.boardUnhealthy): 
                continue
	   
            if status == self.boardRemoved: 
                if foundDevices[slotNum] == True:
                    device = self.dmd.Devices.findDevice(self.slots[slotNum]['ip']) 
                    # Delete device.
                    if not device:
		        log.info("cannot find device in slot %s to delete" % slotNum)
		    else:     
		        device.deleteDevice()
		        self.delete_slot_rrd(slotNum)
                        commit()
                self.clearSlot(self.slots[slotNum],slotNum)
            else:	     
	        newSlotInfo = newSlots[slotNum]	    
	        newIp = newSlotInfo['ip']
	        newName = newSlotInfo['name']
	        newSerial = newSlotInfo['serial']

    	        if (newName == self.shelfMgrName):
                    prefix = self.nonZnyxPrefix
                elif (newSlots[slotNum]['name'] == self.zxsbcName) or (newSlots[slotNum]['name'] == self.zx9210Name):
		    prefix = self.znyxSBCPrefix
	        else:
	            prefix = self.znyxSwitchPrefix
		
	        newClassPath = prefix + newName
	        
	        if (status == self.boardAdded):
		    # Get new name.
		    self.get_device_zname(newSlotInfo,slotNum)
		    newZName = newSlotInfo['zname']
		    
		    # Add new device via Zenoss.
		    log.info("add for boardAdded")
                    self.add_dmd_device(newIp, newZName, newClassPath, self.options.chassisName, slotNum, newSerial)
                    
	        else:
		    # Hot Swap
                    # If different board type, then delete old device and add new one.
                    # Otherwise, generate event.
 
                    if (newName != self.slots[slotNum]['name']):
			if foundDevices[slotNum] == True:			 
		            device = self.dmd.Devices.findDevice(self.slots[slotNum]['ip'])
		            if not device:
			        log.info("cannot find device in slot %s to delete" % slotNum)
			    else:
		                device.deleteDevice()
		                commit()
		        
		        # Get new name.
		        self.get_device_zname(newSlotInfo,slotNum)
		        newZName = newSlotInfo['zname']
		        log.info("add for hotswap: slotNum=%s, newIP=%s, newZName = %s, slots['name']= %s" % (slotNum, newIp, newZName,self.slots[slotNum]['name']))
                        # Add new device via Zenoss
		        self.add_dmd_device(newIp, newZName, newClassPath, self.options.chassisName, slotNum, newSerial)
                    else:
		        # If Serial number has changed, save new one to Zenoss.
		        if self.slots[slotNum]['serial'] != newSerial:
			    self.slots[slotNum]['serial'] = newSerial
			    self.set_device_properties()
			 
		    # Generate event.
                    self.sendEvent(dict(
                        device=self.options.monitor, component="zxchassisdaemon",
                        eventClass='/App/Znyx', severity=2, 
                        summary=("zxchassisdaemon: Hot swap in slot = %s." % str(slotNum))))
                            
                #NOTE: DON'T CHANGE IP ADDRESS.
                #self.slots[slotNum]['ip'] = newIp 
                
	        self.slots[slotNum]['zname'] = newSlotInfo['zname']
	        self.slots[slotNum]['name'] = newSlotInfo['name']	        
	        self.slots[slotNum]['serial'] = newSerial
	        #self.slots[slotNum]['status'] = self.ok
	        #Status should be self.ok or self.unreachable
	        self.slots[slotNum]['status'] = newSlotInfo['status']
	        
	        #Add RDR templates.
                self.add_rrd(slotNum, newName)

        self.dmd.Devices.reIndex()
        commit()

    def set_device_properties(self):
	 
        #Use local data structure (slots) to set device attributes in Zenoss.
        log.info("set_device_properties")
    
        # Set serial number, slot & name.
        # Zenoss will overwrite serial number & slot for Znyx devices.
        # So, only set these values for ZXSBC devices.
        # NOTE: Add error handling & logging.
        
        modificationFlag = False
        
        for device in self.dmd.Devices.getSubDevices():
	    
            for slotNum in range (0,len(self.slots)):
                
                slotInfo = self.slots[slotNum]
                         
                # Skip empty slots
                if slotInfo['status'] == self.empty:
		    continue
	    
                if slotInfo['ip'] == device.getManageIp():
        	    if device.id != slotInfo['zname']:
                        device.renameDevice(slotInfo['zname'])
                    # Don't set serial number for Znyx devices.
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
 
        # Verify the IP addresses
        for slotNum in range (0, len(slots)):
            slotIp = slots[slotNum]['ip']
            results = os.system("ping -c 2 " + slotIp)

            if results == 256:
		slots[slotNum]['status'] = self.unreachable
		log.info("setup_chassis: Slot%s (%s) Unreachable"% (slotNum,slotIp)) 
                self.sendEvent(dict(
                    device=self.options.monitor, component="zxchassisdaemon",
                    eventClass='/App/Znyx', severity=0, summary=("zxchassisdaemon: Slot%s (%s) Unreachable"% (slotNum,slotIp)))) 
            else:
		 slots[slotNum]['status'] = self.ok
             
        # Set up Shelf Manager. It's always in Slot 0.
    
        slotInfo = slots[0]
        slotInfo['name'] = "SHMM"
        slotInfo['serial'] = "0"
        slotInfo['name'] = "ShelfMgr"
        shelfManagerIP = slotInfo['ip']
 
        # If the Shelf Manager is unreachable then set all slots to empty and return.
        
        if slotInfo['status'] == self.unreachable:
	    return

        # Get info from the ShelfManager about each of the slots.
        
        for slotNum in range (1,len(slots)):
	    
	    slotInfo = slots[slotNum]
	    deviceIdOid = '.1.3.6.1.4.1.16394.2.1.1.21.1.10.0.%s' % slotNum
	    mstateOid = '.1.3.6.1.4.1.16394.2.1.1.21.1.11.0.%s' % slotNum
	    serialOid = '.1.3.6.1.4.1.16394.2.1.1.32.1.17.%s' % slotNum
	
	    # Get M state and store as an integer
	    val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, mstateOid))    
	    
	    if val == self.emptyStr or int(val) == 0:
	        # Board not present, so clear slot info and set mstate to no board present (0).
	        self.clearSlot(slotInfo,slotNum)
	        slots[slotNum]['mstate'] = 0	        
	    else: 
		slotInfo['mstate'] = val
	        # Get serial number
	        val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, serialOid))
	        slotInfo['serial'] = val
	        # Get device ID string
	        val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shelfManagerIP, deviceIdOid))
	        slotInfo['name'] = val

    def setup_leds(self, slots):
	 
        #Initialize port info.
        log.info("setup_leds")
 
        child = None
        
        for slotNum in range (1,len(slots)):

	    slotInfo = slots[slotNum]
	             
            slotIp = slotInfo['ip'] 

 	    # Get 9210 leds from SHMM
            if (slotInfo['name'] == self.zx9210Name):

                shmmIp = slots[0]['ip']
                
                #Determine IPMB address
                ipmb = self.ipmbAddr[slotNum]
                
                # Get the 4 LEDs
                for a in range (0,4):
		    ledOID = '1.3.6.1.4.1.16394.2.1.1.22.1.7.' + str(ipmb) + '.0.' + str(a)
		    ledVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shmmIp, ledOID))
		    if ledVal == self.emptyStr:
		        log.info("Unable to read %s in SHMM Mib" % ledOID)
		        break
		    else:
			fieldName = self.ledNames[a]
		        if (int(ledVal) & 0xFF) != 0:
			    slotInfo[fieldName] = self.onStr
		        else:
			    slotInfo[fieldName] = self.offStr
           
            # Can't read LEDs from board if it's not reachable.
 	    if (slotInfo['status'] != self.ok):
                continue
	   
	    devName = slotInfo['name']
            if (devName != self.zx2010Name) and (devName != self.zx7300Name):
		continue
               
            # Open a telnet session to a remote server, and wait for a username prompt.
            child = pexpect.spawn('telnet ' + slotIp)
            child.expect ('login:')
     
            # Send the username, and then wait for a prompt.
            child.sendline ('root')
            child.expect ('#')
                
	    # Get switch LEDs
	    child.sendline ('zreg 0x2001a0')
            child.expect ('#')
            switch_led_results = self.parse_zreg_results(child.before)	   
            log.info("switch leds = 0x%x" % switch_led_results)
            
	    # Save common switch LEDs from CPLD register at offset 0x1a
	    
	    if (switch_led_results & 0x8) > 0:
		slotInfo['oaa'] = self.onStr
	    else:
		slotInfo['oaa'] = self.offStr

	    if (switch_led_results & 0x10) > 0:
		slotInfo['clk'] = self.onStr
	    else:
		slotInfo['clk'] = self.offStr
	
	    if devName == self.zx2010Name:
		 
		# Save ZX2010 LEDs from CPLD register at offset 0x1a
		if (switch_led_results & 0x2) > 0:
		    slotInfo['oafault'] = self.onStr
		else:
		    slotInfo['oafault'] = self.offStr
	
	        # Get shmm LEDs from CPLD register at offset 0x1e
	        child.sendline ('zreg 0x2001e0')
                child.expect ('#')
                shmm_led_results = self.parse_zreg_results(child.before)
                log.info("shmm leds = 0x%x" % shmm_led_results) 
                
		if (shmm_led_results & 0x1) > 0:
		    slotInfo['hot'] = self.onStr
		else:
		    slotInfo['hot'] = self.offStr
		    
		if (shmm_led_results & 0x4) > 0:
		    slotInfo['shmm'] = self.onStr
		else:
		    slotInfo['shmm'] = self.offStr
  		    
		if (shmm_led_results & 0x10) > 0:
		    slotInfo['oos'] = self.onStr
		else:
		    slotInfo['oos'] = self.offStr              
            else:
		# Save 7300 LEDs from CPLD register at offset 0x1a
		if (switch_led_results & 0x2) > 0:
		    slotInfo['ext'] = self.onStr
		else:
		    slotInfo['ext'] = self.offStr

		if (switch_led_results & 0x4) > 0:
		    slotInfo['int'] = self.onStr
		else:
		    slotInfo['int'] = self.offStr
		
		# NOTE: Uncomment & test this code when 7300s are available.
		# Get the remainder of 7300 LED values from SHMM.

                #shmmIp = slots[0]['ip']
                
                #Determine IPMB address
                #ipmb = self.ipmbAddr[slotNum]
                
                # Get HEALTHY LED
		#ledOID = '1.3.6.1.4.1.16394.2.1.1.22.1.7.' + str(ipmb) + '.0.2'
		#ledVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shmmIp, ledOID))
		#if ledVal == self.emptyStr:
		    #log.info("Unable to read %s in SHMM Mib" % ledOID)
		#else:
		    #if (int(ledVal) & 0xFF) != 0:
	                #slotInfo['healthy'] = self.onStr
		    #else:
			#slotInfo['healthy'] = self.offStr
			
		    # Get SVC LED
		    #ledOID = '1.3.6.1.4.1.16394.2.1.1.22.1.7.' + str(ipmb) + '.0.3'
		    #ledVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', shmmIp, ledOID))
		    #if ledVal == self.emptyStr:
		        #log.info("Unable to read %s in SHMM Mib" % ledOID)
		    #else:
		        #if (int(ledVal) & 0xFF) != 0:
	                    #slotInfo['svc'] = self.onStr
		        #else:
			    #slotInfo['svc'] = self.offStr
                
        if child != None:
	    # Exit the telnet session, and wait for a special end-of-file character.
            child.sendline ('exit')
            child.expect (pexpect.EOF)			
           
    def setup_ports(self, slots):
	 
        #Initialize port info.
        log.info("setup_ports")
        
        # NOTE: After one timeout/error on an SNMP, everything is set to default values.
        # Is there a better way to handle this? 
        for slotNum in range (0,len(slots)):
            
	    slotInfo = slots[slotNum]
	    
	    if slotInfo['status'] == self.unreachable:
		continue	    
	    
            slotIp = slotInfo['ip']	 
	    timeout = False
	    firstZreIfIndex = 0
	    
	    if slotInfo['status'] == self.unreachable or slotInfo['status'] == self.empty:
		 continue
            
	    devName = slotInfo['name']

	    if devName == self.zx2010Name:
	        devOID = 18
	        numEthPorts = 3
	        slotInfo['numPorts'] = 20
	        slotInfo['console'] = None
	    elif devName == self.zx7300Name:
	        devOID = 17
	        numEthPorts = 3
	        slotInfo['numPorts'] = 28
	        slotInfo['console'] = None
	    elif devName == self.zx9210Name:
	        numEthPorts = 12
	        slotInfo['numPorts'] = 0
	        slotInfo['console'] = None		 
	    elif devName == self.shelfMgrName: 
		numEthPorts = 2
		slotInfo['numPorts'] = 0
		slotInfo['console'] = None
	    else:
	        # Not a ZNYX board.
	        numEthPorts = 6
	        slotInfo['numPorts'] = 0
	        
	    # Find out the number of interfaces (1-based).
	    ifNumOID = '.1.3.6.1.2.1.2.1.0'
	    ifNumVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifNumOID))
	    if ifNumVal == self.emptyStr:
		log.info("Unable to read %s in IF-MIB" % ifNumOID)
	        ifNumVal = "0"
	        timeout = True  
	    
	    # Get ifAdmin/ifOper for eth ports and find ifIndex of first zre interface (if there is one).
	    for a in range (1, int(ifNumVal)):

	        if timeout == False:
		    ifDescrOID = '.1.3.6.1.2.1.2.2.1.2.' + str(a)
		    descrVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifDescrOID))
		    if descrVal == self.emptyStr:
		        log.info("Unable to read %s in IF-MIB" % ifDescrOID)
		        timeout = True
		    elif ((descrVal.find("zre") != -1) and firstZreIfIndex == 0):
			firstZreIfIndex = a
		    else:		
		        if descrVal.find("eth") != -1 and descrVal.find(".") == -1:
			    ifAdminOID = '.1.3.6.1.2.1.2.2.1.7.'+ str(a)
			    adminVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifAdminOID))
			    if adminVal == self.emptyStr:
				log.info("Unable to read %s in IF-MIB" % ifAdminOID)
				timeout = True
			    else:
		                if adminVal.find("1") != -1:
				    aVal = self.upStr
			        else:
				    aVal = self.downStr
				    
			        ifOperOID = '.1.3.6.1.2.1.2.2.1.8.'+ str(a)
			        operVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifOperOID))
			        if operVal == self.emptyStr:
			            log.info("Unable to read %s in IF-MIB" % ifOperOID)
			            timeout = True
			        else:
			            if operVal.find("1") != -1:
					oVal = self.upStr
				    else:
					oVal = self.downStr
					
                                    # Check for extra processing for 9210 ports.		
                                    if devName != self.zx9210Name:
				        slotInfo[descrVal] = {'cnf': aVal, 'link':oVal}
				    else:		    
				        # Find speed
				        ifSpeedOID = '.1.3.6.1.2.1.2.2.1.5.'+ str(a)
				        speedVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifSpeedOID))
				        if speedVal == self.emptyStr:
					    log.info("Unable to read %s in IF-MIB" % ifSpeedOID)
			                    timeout = True
			                else:
					    if int(speedVal) == 0:
					        sVal = None
					    elif int(speedVal) > 10000000:
						sVal = self.fastStr
					    else:
					        sVal = self.slowStr
					    slotInfo[descrVal] = {'cnf': aVal, 'link':oVal, 'spd':sVal}

					    slotInfo['sw1'] = {'cnf': None, 'link':None, 'spd':None} 
					    slotInfo['sw2'] = {'cnf': None, 'link':None, 'spd':None} 
					    slotInfo['app1'] = {'cnf': None, 'link':None, 'spd':None} 
					    slotInfo['app2'] = {'cnf': None, 'link':None, 'spd':None} 

				            if descrVal.find("eth0") != -1:
					        slotInfo['fab2'] = {'cnf': aVal, 'link':oVal, 'spd':sVal}
					    elif descrVal.find("eth1") != -1:
					        slotInfo['fab1'] = {'cnf': aVal, 'link':oVal, 'spd':sVal}
				            elif descrVal.find("eth4") != -1:
					        slotInfo['cpu1'] = {'cnf': aVal, 'link':oVal, 'spd':sVal}
					    elif descrVal.find("eth5") != -1:
					        slotInfo['cpu2'] = {'cnf': aVal, 'link':oVal, 'spd':sVal}
					    elif descrVal.find("eth6") != -1:
					        slotInfo['base'] = {'cnf': aVal, 'link':oVal, 'spd':sVal}
					        slotInfo['bas1'] = {'cnf': aVal, 'link':oVal, 'spd':sVal}
					    elif descrVal.find("eth7") != -1:
					        slotInfo['bas2'] = {'cnf': aVal, 'link':oVal, 'spd':sVal}

                #if timeout == True:
		    #log.info("Timeout is true. Set eth ports to down.")
	            #for a in range (1, numEthPorts):
		        #slotInfo['eth'+str(a-1)] = {'cnf': None, 'link': None}
	   	    
	    # Get Link Status for Znyx switches.

	    for a in range(0,slotInfo['numPorts']):
	        if timeout == False:
	            linkOID = '.1.3.6.1.4.1.688.2.3.%s.7.1.2.' % devOID
	            val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, linkOID + str(a+1)))
	        else:
		    val = self.emptyStr
		    
	        if val == self.emptyStr:
		    linkVal = None
		    timeout = True
		else:
		    if val.find("1") != -1:
		        linkVal = self.upStr
		    else:
		        linkVal = self.downStr
	        
	        # Get ifAdminStatus for 'cnf' entries.
	        if timeout == False and firstZreIfIndex > 0:
		    index = str(firstZreIfIndex+a) 
	            ifAdminOID =  '.1.3.6.1.2.1.2.2.1.7.'+ index
	            val = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, ifAdminOID))
	        else:
		    val = self.emptyStr
	    
	        if val == self.emptyStr:
		    adminVal = None
		    timeout = True
	        else:
	            if val.find("1") != -1:
		        adminVal = self.upStr
		    else:
		        adminVal = self.downStr
		        			
	        slotInfo['port'+str(a)] = {'cnf':adminVal, 'link':linkVal} 

    def setup_shmm(self, slots):
	 
        log.info("setup_shmm")
        
        if self.slots[0]['status'] == self.unreachable:
	    return
         
        timeout = False
        
	slotInfo = self.slots[0]	    
        slotIp = slotInfo['ip']

        # FRU Mappings: lfan = 3, rfan = 4, lpem = 5, rpem = 6
        # 'hot':None,'warn':None,'ok':None,'mstate':None,'serial':None
        
	for fru in range (3, 7):
	    
	    # Set up name of FRU used in dictionary and Serial OID which is fru-dependent.
	    if fru == 3:
                fruName = 'lfan'
                serialOID = '.1.3.6.1.4.1.16394.2.1.1.33.1.12.1.' + str(fru)
            elif fru == 4:
		fruName = 'rfan'
		serialOID = '.1.3.6.1.4.1.16394.2.1.1.33.1.12.2.' + str(fru)
	    elif fru == 5:
		fruName = 'lpem'
		serialOID = '.1.3.6.1.4.1.16394.2.1.1.34.1.13.1.' + str(fru)
	    elif fru == 6:
		fruName = 'rpem'
		serialOID = '.1.3.6.1.4.1.16394.2.1.1.34.1.13.2.' + str(fru)
	    else:
		continue
	    
            # Initialize dictionary entry for this FRU.
            slotInfo[fruName] = {'hot':None,'warn':None,'ok':None,'mstate':None,'serial':None}
              
            # Get values via SNMP. 
            
            if timeout == False:
		 
		# Get HOT LED
		hotOID = '.1.3.6.1.4.1.16394.2.1.1.22.1.7.32.' + str(fru) +'.0'
		hotVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, hotOID))
		if hotVal == self.emptyStr:
		    log.info("Unable to read %s in PPS-SENTRY-MIB: " % hotOID)
		    #timeout = True
		    #continue
		else:
		    hotInt = int(hotVal) & 0xF
		    if (hotInt != 0):
			slotInfo[fruName]['hot'] = self.onStr
		    else:
			slotInfo[fruName]['hot'] = self.offStr 
			       
		# Get WARN LED
		
		warnOID = '.1.3.6.1.4.1.16394.2.1.1.22.1.7.32.' + str(fru) +'.1'
		warnVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, warnOID))
		if warnVal == self.emptyStr:
		    log.info("Unable to read %s in PPS-SENTRY-MIB: " % warnOID)
		    #timeout = True
		    #continue
		else:
		    warnInt = int(warnVal) & 0xF
		    if (warnInt != 0):
			slotInfo[fruName]['warn'] = self.onStr
		    else:
			slotInfo[fruName]['warn'] = self.offStr 
		    
		# Get OK LED

		okOID = '.1.3.6.1.4.1.16394.2.1.1.22.1.7.32.' + str(fru) +'.2'
		okVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, okOID))
		if okVal == self.emptyStr:
		    log.info("Unable to read %s in PPS-SENTRY-MIB: " % okOID)
		    #timeout = True
		    #continue
		else:
		    okInt = int(okVal) & 0xF
		    if (okInt != 0):
			slotInfo[fruName]['ok'] = self.onStr
		    else:
			slotInfo[fruName]['ok'] = self.offStr 
		    
		# Get MState
		mStateOID = '.1.3.6.1.4.1.16394.2.1.1.2.1.11.32.' + str(fru) 
		mStateVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, mStateOID))
		if mStateVal == self.emptyStr:
		    log.info("Unable to read %s in PPS-SENTRY-MIB: " % mStateOID)
		    #timeout = True
		    #continue
		else:
		    slotInfo[fruName]['mstate'] = mStateVal 
		    		
		# Get Serial Number
		
		serialVal = self.get_snmp_value( "snmpget -v 1 -c %s %s %s" % ('public', slotIp, serialOID))
		if serialVal == self.emptyStr:
		    log.info("Unable to read %s in PPS-SENTRY-MIB: " % serialOID)
		    #timeout = True
		    #continue
		else:
		    slotInfo[fruName]['serial'] = serialVal 
			

    def finish_loop(self):
	if self.options.cycle:
	    self.sendHeartbeat()
            reactor.callLater(self.options.cycletime, self.runCycle)     
            
    def main_loop(self):
        
        log.info("zxchassisdaemon: main_loop")
     	         
        # Handle any changes, including Hot Swap, to the chassis configuration.
        self.process_config_changes()
         
        # Make sure that all RRD graphs have been created.
        # This is needed for when device goes from unreachable or MState 7 to OK.
        # Can't retrieve thresholds for graphs when unreachable or MState 7
        self.check_rrds(self.slots)
     
        # Dump Zenoss device configuration to zxdevices.xml
        #os.system("/usr/local/zenoss/zenoss/bin/zendevicedump -o %s" % self.zxdevicesFileName)  

        # Generate internal tables from SNMP gets.
        self.setup_ports(self.slots)
        self.setup_leds(self.slots)
        self.setup_shmm(self.slots)
            
        # Output data to zxchassis.xml

        log.info("self.slots = %s" % self.slots)   
        
        outputSlots = self.slots
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
	    slotStr = "\'slot%s\': outputSlots[%s]" % (slotNum,slotNum)
	    dictionaryStr += slotStr
	    if slotNum == (len(outputSlots) - 1):
	        dictionaryStr += "}"
	    else:
	        dictionaryStr += ","
	        
        dictionary = eval(dictionaryStr)
        xml = dict2xml(dictionary, roottag='zx2000')
        
        try:
            chassisFile = open(self.zxchassisFileName,'w')
            chassisFile.write(xml)      
        except IOError:
	    log.info("zxchassisdaemon: error writing %s" % self.zxchassisFileName) 
	    self.sendEvent(dict(
               device=self.options.monitor, component="zxchassisdaemon",
               eventClass='/App/Znyx', severity=0, 
               summary=("Error writing %s" % self.zxchassisFileName)))
	else:
            chassisFile.close()  	 
        
        os.system("chmod 644 " + self.zxchassisFileName)
        
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
  