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

skinsDir = os.path.join(os.path.dirname(__file__), 'skins')
if os.path.isdir(skinsDir):
    registerDirectory(skinsDir, globals())

log = logging.getLogger('oaInsightWebapp')
log.info ("Debug oaInsightWebapp")

from Products.ZenModel.ZenPack import ZenPackBase

class ZenPack(ZenPackBase):
                log.info ("Begin: Class Definition oaInsightWebapp")   
		def _registeroaInsightWebapp(self, app):
                    zpm = app.zport.ZenPortletManager
		    portletsrc=os.path.join(os.path.dirname(__file__),'lib','oaInsightWebapp.js')
                    log.info("portletsrc")		    
		    #Its a dirty hack - register_portlet will add ZenPath one more time
		    #and we don't want to hardcode path explicitly here like in other ZenPacks
		    p=re.compile(zenPath(''))
		    portletsrc=p.sub('',portletsrc)
                    zpm.register_portlet(
                        sourcepath=portletsrc,
                        id='oaInsightWebapp',
                        title='oaInsight Webapp',
                        permission=ZEN_COMMON)
 		    
		def install(self, app):
                    ZenPackBase.install(self, app)
                    self._registeroaInsightWebapp(app)
    
                def upgrade(self, app):
                    ZenPackBase.upgrade(self, app)
                    self._registeroaInsightWebapp(app)
        
                def remove(self, app, leaveObjects=False):
                    ZenPackBase.remove(self, app, leaveObjects)
                    zpm = app.zport.ZenPortletManager
                    zpm.unregister_portlet('oaInsightWebapp')
                    
                log.info ("End: Class Definition oaInsightWebapp")
