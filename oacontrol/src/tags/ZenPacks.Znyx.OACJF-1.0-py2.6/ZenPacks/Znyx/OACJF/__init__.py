from Products.ZenModel.ZenossSecurity import ZEN_COMMON
from Products.ZenUtils.Utils import zenPath
from Products.CMFCore.DirectoryView import registerDirectory
from time import localtime,strftime
import re
import Globals
import os
import os.path
import sys
import logging
import json



log = logging.getLogger('OACJF')
log.info ("Debug OACJF")

#skinsDir = os.path.join(os.path.dirname(__file__), 'skins')
#if os.path.isdir(skinsDir):
#    registerDirectory(skinsDir, globals())

from Products.ZenModel.ZenPack import ZenPackBase

class ZenPack(ZenPackBase):
                log.info ("Begin: Class Definition OACJF")   
		def _registerOACJF(self, app):
		    log.info("Begin: Registering OACJF")
                    zpm = app.zport.ZenPortletManager
		    portletsrc=os.path.join(os.path.dirname(__file__),'lib','OACJF.js')
		    # OK you cant just run the previous line again to get more libraries
		    #Its a dirty hack - register_portlet will add ZenPath one more time
		    #and we don't want to hardcode path explicitly here like in other ZenPacks
		    p=re.compile(zenPath(''))
		    portletsrc=p.sub('',portletsrc)
                    zpm.register_portlet(
                        sourcepath=portletsrc,
                        id='OACJF',
                        title='OAC PortletJF',
                        permission=ZEN_COMMON)
		    log.info("End: Registering OACJF")
		    
		def install(self, app):
                    ZenPackBase.install(self, app)
                    self._registerOACJF(app)
    
                def upgrade(self, app):
                    ZenPackBase.upgrade(self, app)
                    self._registerOACJF(app)
        
                def remove(self, app, leaveObjects=False):
                    ZenPackBase.remove(self, app, leaveObjects)
                    zpm = app.zport.ZenPortletManager
                    zpm.unregister_portlet('OACJF')
                    
                log.info ("End: Class Definition OACJF")
                
                  
def getOACDisplay(self, name='Kathy'):
    """
    Display a line of html.
    """

    log.info ("getOACDisplay")
    response = { 'columns': ['OAC'], 'data': [] }
    result='<div style="WIDTH: 100%; OVERFLOW: auto"><table>'
    result="%s Hello %s, Here Is A Line of Display</table></div>" % (result,name)
    row={'OAC': result}
    response['data'].append(row)
    
    log.info("response=%s",json.dumps(response))

    return json.dumps(response)
    
# Monkey-patch function onto zport. References to self are references to zport.
from Products.ZenModel.ZentinelPortal import ZentinelPortal    
ZentinelPortal.getOACDisplay = getOACDisplay