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

log = logging.getLogger('OACPortlet')
log.info ("Debug OACPortlet")

#skinsDir = os.path.join(os.path.dirname(__file__), 'skins')
#if os.path.isdir(skinsDir):
#    registerDirectory(skinsDir, globals())

from Products.ZenModel.ZenPack import ZenPackBase

class ZenPack(ZenPackBase):
                log.info ("Begin: Class Definition OACPortlet")   
		def _registerOACPortlet(self, app):
		    log.info("Begin: Registering OACPortlet")
                    zpm = app.zport.ZenPortletManager
		    portletsrc=os.path.join(os.path.dirname(__file__),'lib','OACPortlet.js')
		    #Its a dirty hack - register_portlet will add ZenPath one more time
		    #and we don't want to hardcode path explicitly here like in other ZenPacks
		    p=re.compile(zenPath(''))
		    portletsrc=p.sub('',portletsrc)
                    zpm.register_portlet(
                        sourcepath=portletsrc,
                        id='OACPortlet',
                        title='OAC Portlet',
                        permission=ZEN_COMMON)
		    log.info("End: Registering OACPortlet")
		    
		def install(self, app):
                    ZenPackBase.install(self, app)
                    self._registerOACPortlet(app)
    
                def upgrade(self, app):
                    ZenPackBase.upgrade(self, app)
                    self._registerOACPortlet(app)
        
                def remove(self, app, leaveObjects=False):
                    ZenPackBase.remove(self, app, leaveObjects)
                    zpm = app.zport.ZenPortletManager
                    zpm.unregister_portlet('OACPortlet')
                    
                log.info ("End: Class Definition OACPortlet")
                
                  
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