
#!/usr/bin/env python

import logging
import os
import sys
import time
from Globals import *
from twisted.internet import reactor, defer
from Products.ZenUtils.CyclingDaemon import CyclingDaemon
from Products.ZenCollector.scheduler import Scheduler

class MonitorForBitMsgs(CyclingDaemon):

  def __init__(self, *args, **kwargs):

    CyclingDaemon.__init__(self, *args, **kwargs) 

    self.options.cycletime = 10

    self.log.info("Kicking off init")

    print "did init"

 
    self.schedule = Scheduler(self.options)

    self.schedule.sendEvent = self.dmd.ZenEventManager.sendEvent

    self.schedule.monitor = self.options.monitor


    self.sendEvent(dict(
                    device=self.options.monitor, component="zenactions",
                    eventClass='/Cmd', severity=0, summary="zenactions started"))

  def runCycle(self):

    try:

      start = time.time()

      self.syncdb()

      self.main_loop()

    except:

      self.log.exception("unexpected exception")

      reactor.callLater(self.options.cycletime, self.runCycle)
 

  def main_loop(self):

     self.log.info("main_loop")
 

if __name__=='__main__':

# Zope magic ensues!

  mon = MonitorForBitMsgs(None, None)

  mon.log.info("Kicking off monitor")

  mon.run()
  