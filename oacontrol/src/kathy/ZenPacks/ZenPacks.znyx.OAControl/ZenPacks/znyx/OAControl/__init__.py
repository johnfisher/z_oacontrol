

import Globals
import os.path

from os import listdir
from shutil import copy

from Products.ZenModel.ZenPack import ZenPack as ZenPackBase
from Products.ZenUtils.Utils import zenPath

class ZenPack(ZenPackBase):
    def install(self, app):
        super(ZenPack, self).install(app)
        
        # Copy commands to libexec directory.
        srcDir = self.path('libexec')
        dstDir = zenPath('libexec')
        files = os.listdir(srcDir)
        for f in files:
	     if not f.endswith('pyc'):
		  copy(f, dstDir)
               
skinsDir = os.path.join(os.path.dirname(__file__), 'skins')
from Products.CMFCore.DirectoryView import registerDirectory
if os.path.isdir(skinsDir):
    registerDirectory(skinsDir, globals())


