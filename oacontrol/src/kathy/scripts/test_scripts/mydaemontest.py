
#!/usr/bin/env python

import daemon
import grp
import lockfile
import logging
import pwd
import sys

from mysnmptest import do_main_program

print "before daemon.DaemonContext()"

logger = logging.getLogger("DaemonLog")
logger.setLevel(logging.INFO)
formatter = logging.Formatter(
     "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler = logging.FileHandler("/tmp/log.file")
logger.addHandler(handler)

daemon_context = daemon.DaemonContext(
     pidfile=lockfile.FileLock("/tmp/mydaemontest.pid"),
     files_preserve=[handler.stream])
     
with daemon_context:
     logger.info("before do_main_program")
     do_main_program(logger)

