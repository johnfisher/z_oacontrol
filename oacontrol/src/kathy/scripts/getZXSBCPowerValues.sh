# Shellscript to use individual snmpget commands to get
#    voltage readings for an ZXSBC from Pigeon Point SHELF MANAGER.
#
# ShelfMgr IP is first parameter; SNMP communty name is second parameter;
# SNMP version is third parameter;
# IPMB address (decimal) of monitored slot is fourth parameter.
# Slot number is the fifth parameter.
#
# Driven by power command performance template
# ${here/ZenPackManager/packs/ZenPacks.znyx/OAControl/path}/libexec/getZXSBCPowerValues.sh            
#       ${here/manageIp} ${here/zSnmpCommunity} ${here/zSnmpVer} ipmbAddr slotNum
#
# Usage Example:
# ./getZXSBCPowerValues.sh  10.2.0.83  public  v2c  134 1
#
###############################################################################################

ZXSBC_1_2V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.20 2>/dev/null)
ZXSBC_1_2V=$(echo $ZXSBC_1_2V | bc -l 2>/dev/null)

ZXSBC_1_5V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.29 2>/dev/null)
ZXSBC_1_5V=$(echo $ZXSBC_1_5V | bc -l 2>/dev/null)

ZXSBC_1_8V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.22 2>/dev/null)
ZXSBC_1_8V=$(echo $ZXSBC_1_8V | bc -l 2>/dev/null)

ZXSBC_12V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.26 2>/dev/null)
ZXSBC_12V=$(echo $ZXSBC_12V | bc -l 2>/dev/null)

ZXSBC_2_5V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.23 2>/dev/null)
ZXSBC_2_5V=$(echo $ZXSBC_2_5V | bc -l 2>/dev/null)

ZXSBC_3_3V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.24 2>/dev/null)
ZXSBC_3_3V=$(echo $ZXSBC_3_3V | bc -l 2>/dev/null)

ZXSBC_3_3V_SB=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.16 2>/dev/null)
ZXSBC_3_3V_SB=$(echo $ZXSBC_3_3V_SB | bc -l 2>/dev/null)

ZXSBC_5V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.25 2>/dev/null)
ZXSBC_5V=$(echo $ZXSBC_5V | bc -l 2>/dev/null)

ZXSBC_5V_SB=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.17 2>/dev/null)
ZXSBC_5V_SB=$(echo $ZXSBC_5V_SB | bc -l 2>/dev/null)

ZXSBC_CPU0V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.27 2>/dev/null)
ZXSBC_CPU0V=$(echo $ZXSBC_CPU0V | bc -l 2>/dev/null)

ZXSBC_CPU1V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.28 2>/dev/null)
ZXSBC_CPU1V=$(echo $ZXSBC_CPU1V | bc -l 2>/dev/null)

ZXSBC_VBAT=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.19 2>/dev/null)
ZXSBC_VBAT=$(echo $ZXSBC_VBAT | bc -l 2>/dev/null)

ZXSBC_VTTDDR=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.21 2>/dev/null)
ZXSBC_VTTDDR=$(echo $ZXSBC_VTTDDR | bc -l 2>/dev/null)

echo "ZXSBC_Power_$5|ZXSBC_1_2V_$5=$ZXSBC_1_2V ZXSBC_1_5V_$5=$ZXSBC_1_5V ZXSBC_1_8V_$5=$ZXSBC_1_8V ZXSBC_12V_$5=$ZXSBC_12V \
ZXSBC_2_5V_$5=$ZXSBC_2_5V ZXSBC_3_3V_$5=$ZXSBC_3_3V ZXSBC_3_3V_SB_$5=$ZXSBC_3_3V_SB ZXSBC_5V_$5=$ZXSBC_5V \
ZXSBC_5V_SB_$5=$ZXSBC_5V_SB ZXSBC_CPU0V_$5=$ZXSBC_CPU0V ZXSBC_CPU1V_$5=$ZXSBC_CPU1V \
ZXSBC_VBAT_$5=$ZXSBC_VBAT ZXSBC_VTTDDR_$5=$ZXSBC_VTTDDR"

exit 0
