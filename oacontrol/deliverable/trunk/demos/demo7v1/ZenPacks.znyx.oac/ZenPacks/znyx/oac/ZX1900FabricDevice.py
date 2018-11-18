######################################################################
#
# znyx.oac Zenpack
#
# ZX1900FabricDevice object class
#
######################################################################

from Globals import InitializeClass
from Products.ZenRelations.RelSchema import *
from Products.ZenModel.Device import Device
from Products.ZenModel.ZenossSecurity import ZEN_VIEW
from copy import deepcopy


class ZX1900FabricDevice(OASwitch):
    "A ZX1900Fabric Device"

#    _relations = Device._relations + (
#        ('ZhpInt', ToManyCont(ToOne,
#            'ZenPacks.znyx.oac.ZhpInterface', 'ZX1900FabricDev')),
#        )

    factory_type_information = deepcopy(Device.factory_type_information)
#    factory_type_information[0]['actions'] += (
#            { 'id'              : 'BridgeInt'
#            , 'name'            : 'Bridge Interfaces'
#            , 'action'          : 'BridgeDeviceDetail'
#            , 'permissions'     : (ZEN_VIEW, ) },
#            )


    def __init__(self, *args, **kw):
        Device.__init__(self, *args, **kw)
        self.buildRelations()


InitializeClass(ZX1900FabricDevice)
