# Example code:  ##############################
#
# Import a standard function, and get the HTML request and response objects.
#from Products.PythonScripts.standard import html_quote
#request = container.REQUEST
#response =  request.response
#
# Return a string identifying this script.
# print "This is the", script.meta_type, '"%s"' % script.getId(),
# if script.title:
#   print "(%s)" % html_quote(script.title),
#print "in", container.absolute_url()
#return printed
#################################################


print "This is the", script.meta_type, '"%s"' % script.getId(),
if script.title:
    print "(%s)" % html_quote(script.title),
print "in", container.absolute_url()

print [ d.id for d in context.getSubDevices() ]
print [ d in context.getSubDevices() ]
print context.getSubDevices()

print [ d.name() for d in context.getSubDevices() ]
print [ d.getManageIp() for d in context.getSubDevices() ]
print [ d.getHWSerialNumber() for d in context.getSubDevices() ]
#print [ d.rackslot for d in context.getSubDevices() ]


#Another snippet of code:
for d in context.getSubDevices():
     groups = d.getDeviceGroupNames()
     for g in groups:
          print g



return printed


from Products.DataCollector.plugins.CollectorPlugin import SnmpPlugin, GetTableMap, GetMap
from Products.DataCollector.plugins.DataMaps import ObjectMap, MultiArgs
class ZX7300DeviceMib(SnmpPlugin):

    modname = "ZenPacks.znyx.oac.ZX7300Device"
    
# snmpGetMap gets scalar SNMP MIBs (single values)

    snmpGetMap = GetMap({
        '.1.3.6.1.4.1.688.2.3.17.1.0' :  'slotNumber',
        '.1.3.6.1.4.1.688.2.3.17.9.0' :  'setHWSerialNumber',
        '.1.3.6.1.4.1.688.2.3.17.16.0' : 'oaVersionNumber',       
        '.1.3.6.1.4.1.688.2.3.17.21.0':  'hwProductName',
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
        
        log.debug("slotNumber=%s", om.slotNumber)
        log.debug("oaVersionNumber=%s", om.oaVersionNumber)
        log.debug("hwProductName=%s", om.hwProductName)
        
        om.rackSlot = om.slotNumber
        
        om.setHWProductKey = MultiArgs(om.hwProductName, "Znyx Networks, Inc.") 
        om.setOSProductKey = MultiArgs(om.oaVersionNumber, "Open Architect")
        
        return om

