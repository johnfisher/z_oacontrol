#!/bin/bash
#
######################################################################################
### script to create network load ###
# use with two servers connected across
# ZX1900 backplane
# 1) put zre1 and zre2 in a VLAN ( default) on the fabric
#    zre1 goes to slot 4 ...  zre2 goes to slot 5
# 2) on thermopolis boards, ifconfig eth0 up with an ip address
#    slot 4 gets 192.168.1.4 and slot5 gets 192.168.1.5 (or adjust script)
#    then make the routes on both SBCs so the traffic uses eth0 "route add -host 192.168.1.n  dev eth0"
# 3) make sure you have an ftpserver ( apt-get install vsftpd ) on both
# 4) edit /etc/vsftpd.conf - turn on write and local user access - restart vsftpd
# 5) download the dir include/ftpnetload with its 10 dummy files to /home/zenoss
#    make sure the dir and files are owned by zenoss
# 6) this script should be on slot4 and/or slot5 /home/zenoss/ftpnetload and 
#    you MAY NEED TO RUN AS ROOT because zenoss does *something* to the routes
# 7) edit script with appropriate addresses etc if necessary
# 8) start the script ( use cron or /etc/init.d or manual to keep it running after reboot)
#
######################################################################################

HOST=192.168.1.4
USER=zenoss
PASS=zenoss
cd /home/zenoss/ftpnetload
while true
do
# all files are named 0..9
# get random digit by using nano format on date and getting last digit only
RANDDIGIT=`date +%N | cut -c9`

ftp -inv $HOST << EOF
user $USER $PASS
cd /home/zenoss/ftpnetload
put $RANDDIGIT
quit
EOF

sleep $RANDDIGIT

done

