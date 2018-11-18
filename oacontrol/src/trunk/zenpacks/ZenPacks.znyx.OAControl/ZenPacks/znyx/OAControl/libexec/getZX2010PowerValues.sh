# Shellscript to use individual snmpget commands to get
#    voltage readings for a ZX2010 from Pigeon Point SHELF MANAGER.
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
# ./getZX2010PowerValues.sh  10.2.0.83  public  v2c  134 1
#
###############################################################################################

ZX2010_1_0VA=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.3 2>/dev/null)
ZX2010_1_0VA=$(echo $ZX2010_1_0VA | bc -l 2>/dev/null)

ZX2010_1_0VB=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.4 2>/dev/null)
ZX2010_1_0VB=$(echo $ZX2010_1_0VB | bc -l 2>/dev/null)

ZX2010_1_5V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.2 2>/dev/null)
ZX2010_1_5V=$(echo $ZX2010_1_5V | bc -l 2>/dev/null)

ZX2010_2_5V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.5 2>/dev/null)
ZX2010_2_5V=$(echo $ZX2010_2_5V | bc -l 2>/dev/null)

ZX2010_3_3V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.6 2>/dev/null)
ZX2010_3_3V=$(echo $ZX2010_3_3V | bc -l 2>/dev/null)

ZX2010_3_3V_SB=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.8 2>/dev/null)
ZX2010_3_3V_SB=$(echo $ZX2010_3_3V_SB | bc -l 2>/dev/null)

ZX2010_3_6V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.7 2>/dev/null)
ZX2010_3_6V=$(echo $ZX2010_3_6V | bc -l 2>/dev/null)

echo "ZX2010_Power_$5|ZX2010_1_0VA_$5=$ZX2010_1_0VA ZX2010_1_0VB_$5=$ZX2010_1_0VB ZX2010_1_5V_$5=$ZX2010_1_5V \
ZX2010_2_5V_$5=$ZX2010_2_5V ZX2010_3_3V_$5=$ZX2010_3_3V ZX2010_3_3V_SB_$5=$ZX2010_3_3V_SB ZX2010_3_6V_$5=$ZX2010_3_6V"

exit 0
