# Shellscript to use individual snmpget commands to get
#    temperature readings for an ZXSBC from Pigeon Point SHELF MANAGER.
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
# ./getZXSBCTempValues.sh  10.2.0.83  public  v2c  134 1
#
###############################################################################################

ZXSBC_Baseboard_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.48 2>/dev/null)
ZXSBC_Baseboard_Temp=$(echo $ZXSBC_Baseboard_Temp | bc -l 2>/dev/null)

ZXSBC_CPU0_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.55 2>/dev/null)
ZXSBC_CPU0_Temp=$(echo $ZXSBC_CPU0_Temp | bc -l 2>/dev/null)

ZXSBC_CPU1_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.56 2>/dev/null)
ZXSBC_CPU1_Temp=$(echo $ZXSBC_CPU1_Temp | bc -l 2>/dev/null)

ZXSBC_Drive_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.93 2>/dev/null)
ZXSBC_Drive_Temp=$(echo $ZXSBC_Drive_Temp | bc -l 2>/dev/null)

ZXSBC_DRAM_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.94 2>/dev/null)
ZXSBC_DRAM_Temp=$(echo $ZXSBC_DRAM_Temp | bc -l 2>/dev/null)

ZXSBC_Inlet_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.95 2>/dev/null)
ZXSBC_Inlet_Temp=$(echo $ZXSBC_Inlet_Temp | bc -l 2>/dev/null)

echo "ZXSBC_Temp_$5|ZXSBC_Baseboard_Temp_$5=$ZXSBC_Baseboard_Temp ZXSBC_CPU0_Temp_$5=$ZXSBC_CPU0_Temp ZXSBC_CPU1_Temp_$5=$ZXSBC_CPU1_Temp \
ZXSBC_Drive_Temp_$5=$ZXSBC_Drive_Temp ZXSBC_DRAM_Temp_$5=$ZXSBC_DRAM_Temp ZXSBC_Inlet_Temp_$5=$ZXSBC_Inlet_Temp"

exit 0
