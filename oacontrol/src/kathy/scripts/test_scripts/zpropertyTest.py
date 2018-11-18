
#!/usr/bin/env python
import Globals
from Products.ZenUtils.ZenScriptBase import ZenScriptBase
from transaction import commit

dmd = ZenScriptBase(connect=True).dmd

import re
		    
zPropName = 'zWinUser'
org = dmd.Devices.getOrganizer('/Network/ZXSBC')
value = org.getProperty(zPropName)
print value
org.setZenProperty(zPropName, 'root')
commit()
print "hallelujah2"

  


