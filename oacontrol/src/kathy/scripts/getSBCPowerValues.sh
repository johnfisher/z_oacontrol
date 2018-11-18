# Shellscript to use individual snmpget commands to get
#    voltage readings for an SBC from Pigeon Point SHELF MANAGER.
#
# ShelfMgr IP is first parameter; SNMP communty name is second parameter;
# SNMP version is third parameter;
# IPMB address (decimal) of monitored slot is fourth parameter.
#
# Driven by power command performance template
# ${here/ZenPackManager/packs/ZenPacks.znyx/OAControl/path}/libexec/getSBCPowerValues.sh            
#       ${here/manageIp} ${here/zSnmpCommunity} ${here/zSnmpVer} ipmbAddr
#
# Usage Example:
# ./getSBCPowerValues.sh  10.2.0.83  public  v2c  134
#
###############################################################################################

SBC_1_2V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.20 2>/dev/null)
SBC_1_2V=$(echo $SBC_1_2V | bc -l 2>/dev/null)

SBC_1_5V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.29 2>/dev/null)
SBC_1_5V=$(echo $SBC_1_5V | bc -l 2>/dev/null)

SBC_1_8V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.22 2>/dev/null)
SBC_1_8V=$(echo $SBC_1_8V | bc -l 2>/dev/null)

SBC_12V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.26 2>/dev/null)
SBC_12V=$(echo $SBC_12V | bc -l 2>/dev/null)

SBC_2_5V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.23 2>/dev/null)
SBC_2_5V=$(echo $SBC_2_5V | bc -l 2>/dev/null)

SBC_3_3V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.24 2>/dev/null)
SBC_3_3V=$(echo $SBC_3_3V | bc -l 2>/dev/null)

SBC_3_3V_SB=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.16 2>/dev/null)
SBC_3_3V_SB=$(echo $SBC_3_3V_SB | bc -l 2>/dev/null)

SBC_5V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.25 2>/dev/null)
SBC_5V=$(echo $SBC_5V | bc -l 2>/dev/null)

SBC_5V_SB=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.17 2>/dev/null)
SBC_5V_SB=$(echo $SBC_5V_SB | bc -l 2>/dev/null)

SBC_CPU0V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.27 2>/dev/null)
SBC_CPU0V=$(echo $SBC_CPU0V | bc -l 2>/dev/null)

SBC_CPU1V=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.28 2>/dev/null)
SBC_CPU1V=$(echo $SBC_CPU1V | bc -l 2>/dev/null)

SBC_VBAT=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.19 2>/dev/null)
SBC_VBAT=$(echo $SBC_VBAT | bc -l 2>/dev/null)

SBC_VTTDDR=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.21 2>/dev/null)
SBC_VTTDDR=$(echo $SBC_VTTDDR | bc -l 2>/dev/null)

echo "ZXSBC_Power|SBC_1_2V=$SBC_1_2V SBC_1_5V=$SBC_1_5V SBC_1_8V=$SBC_1_8V SBC_12V=$SBC_12V \
SBC_2_5V=$SBC_2_5V SBC_3_3V=$SBC_3_3V SBC_3_3V_SB=$SBC_3_3V_SB SBC_5V=$SBC_5V SBC_5V_SB=$SBC_5V_SB \
SBC_CPU0V=$SBC_CPU0V SBC_CPU1V=$SBC_CPU1V SBC_VBAT=$SBC_VBAT SBC_VTTDDR=$SBC_VTTDDR"

exit 0
