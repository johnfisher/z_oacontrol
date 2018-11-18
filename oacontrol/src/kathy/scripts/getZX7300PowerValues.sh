# Shellscript to use individual snmpget commands to get
#    voltage readings for a ZX7300 from Pigeon Point SHELF MANAGER.
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
# ./getZX7300PowerValues.sh  10.2.0.83  public  v2c  134 1
#
###############################################################################################

ZX7300_1_0V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.3 2>/dev/null)
ZX7300_1_0V=$(echo $ZX7300_1_0V | bc -l 2>/dev/null)

ZX7300_1_2V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.9 2>/dev/null)
ZX7300_1_2V=$(echo $ZX7300_1_2V | bc -l 2>/dev/null)

ZX7300_1_25VVDD=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.7.$4.7 2>/dev/null)
ZX7300_1_25VVDD=$(echo $ZX7300_1_25VVDD | bc -l 2>/dev/null)

ZX7300_1_5V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.6 2>/dev/null)
ZX7300_1_5V=$(echo $ZX7300_1_5V | bc -l 2>/dev/null)

ZX7300_2_5V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.5 2>/dev/null)
ZX7300_2_5V=$(echo $ZX7300_2_5V | bc -l 2>/dev/null)

ZX7300_3_3V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.4 2>/dev/null)
ZX7300_3_3V=$(echo $ZX7300_3_3V | bc -l 2>/dev/null)

ZX7300_3_3V_SB=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.8 2>/dev/null)
ZX7300_3_3V_SB=$(echo $ZX7300_3_3V_SB | bc -l 2>/dev/null)

ZX7300_12V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.2 2>/dev/null)
ZX7300_12V=$(echo $ZX7300_12V | bc -l 2>/dev/null)

echo "ZX7300_Power_$5|ZX7300_1_0V_$5=$ZX7300_1_0V ZX7300_1_2V_$5=$ZX7300_1_2V ZX7300_1_25VVDD_$5=$ZX7300_1_25VVDD \
ZX7300_1_5V_$5=$ZX7300_1_5V ZX7300_2_5V_$5=$ZX7300_2_5V ZX7300_3_3V_$5=$ZX7300_3_3V ZX7300_3_3V_SB_$5=$ZX7300_3_3V_SB \
ZX7300_12V_$5=$ZX7300_12V"

exit 0
