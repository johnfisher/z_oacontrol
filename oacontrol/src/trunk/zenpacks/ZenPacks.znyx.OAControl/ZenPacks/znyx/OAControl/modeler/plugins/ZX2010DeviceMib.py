######################################################################
#
# znyx.OAControl Zenpack
#
# ZX7300DeviceMib modeler plugin
#
######################################################################

__doc__="""ZX2010DeviceMib

ZX2010DeviceMib gets product data from ZX2010.MIB

$Id: $"""

#__version__ = '$Revision: $'[11:-2]

from Products.DataCollector.plugins.CollectorPlugin import SnmpPlugin, GetTableMap, GetMap
from Products.DataCollector.plugins.DataMaps import ObjectMap, MultiArgs
class ZX2010DeviceMib(SnmpPlugin):

    modname = "ZenPacks.znyx.OAControl.ZX2010Device"
    
# snmpGetMap gets scalar SNMP MIBs (single values)

    snmpGetMap = GetMap({
        #'.1.3.6.1.4.1.688.2.3.18.1.0' :  'slotNumber',
        '.1.3.6.1.4.1.688.2.3.18.9.0' :  'setHWSerialNumber',
        '.1.3.6.1.4.1.688.2.3.18.16.0' : 'oaVersionNumber',       
        '.1.3.6.1.4.1.688.2.3.18.21.0':  'hwProductName',
        })

	   
    def process(self, device, results, log):
        """collect snmp information from this device"""
        log.info('processing %s for device %s', self.name(), device.id)
        
        #Collect Znyx Info
        getdata, tabledata = results
  
	if not getdata:
            log.warn("Unable to retrieve getdata from %s", device.id)
            
        log.debug( "Get Data= %s", getdata )
        
        om = self.objectMap(getdata)
        
        #log.debug("slotNumber=%s", om.slotNumber)
        log.debug("oaVersionNumber=%s", om.oaVersionNumber)
        log.debug("hwProductName=%s", om.hwProductName)
        
        #om.rackSlot = om.slotNumber
        
        om.setHWProductKey = MultiArgs(om.hwProductName, "Znyx Networks, Inc.") 
        om.setOSProductKey = MultiArgs(om.oaVersionNumber, "Open Architect")
        
        return om

