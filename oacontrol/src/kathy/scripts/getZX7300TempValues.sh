# Shellscript to use individual snmpget commands to get
#    temperature readings for a ZX7300 from Pigeon Point SHELF MANAGER.
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
# ./getZX7300TempValues.sh  10.2.0.83  public  v2c  134 1
#
###############################################################################################

ZX7300_Bottom_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.12 2>/dev/null)
ZX7300_Bottom_Temp=$(echo $ZX7300_Bottom_Temp | bc -l 2>/dev/null)

ZX7300_Center_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.10 2>/dev/null)
ZX7300_Center_Temp=$(echo $ZX7300_Center_Temp | bc -l 2>/dev/null)

ZX7300_Top_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.11 2>/dev/null)
ZX7300_Top_Temp=$(echo $ZX7300_Top_Temp | bc -l 2>/dev/null)

echo "ZX7300_Temp_$5|ZX7300_Bottom_Temp_$5=$ZX7300_Bottom_Temp ZX7300_Center_Temp_$5=$ZX7300_Center_Temp \
ZX7300_Top_Temp_$5=$ZX7300_Top_Temp"

exit 0
