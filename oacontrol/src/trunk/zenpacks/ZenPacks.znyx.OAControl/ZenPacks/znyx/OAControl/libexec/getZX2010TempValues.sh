# Shellscript to use individual snmpget commands to get
#    temperature readings for a ZX2010 from Pigeon Point SHELF MANAGER.
#
# ShelfMgr IP is first parameter; SNMP communty name is second parameter;
# SNMP version is third parameter;
# IPMB address (decimal) of monitored slot is fourth parameter.
# Slot number is the fifth parameter.
#
# Driven by power command performance template
# ${here/ZenPackManager/packs/ZenPacks.znyx/OAControl/path}/libexec/getSBCPowerValues.sh            
#       ${here/manageIp} ${here/zSnmpCommunity} ${here/zSnmpVer} ipmbAddr slotNum
#
# Usage Example:
# ./getZX2010TempValues.sh  10.2.0.83  public  v2c  134 1
#
###############################################################################################

ZX2010_Center_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.9 2>/dev/null)
ZX2010_Center_Temp=$(echo $ZX2010_Center_Temp | bc -l 2>/dev/null)

echo "ZX2010_Temp_$5|ZX2010_Center_Temp_$5=$ZX2010_Center_Temp"

exit 0
