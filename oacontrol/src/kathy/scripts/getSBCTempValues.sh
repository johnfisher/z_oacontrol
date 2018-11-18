# Shellscript to use individual snmpget commands to get
#    temperature readings for an SBC from Pigeon Point SHELF MANAGER.
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
# ./getSBCTempValues.sh  10.2.0.83  public  v2c  134
#
###############################################################################################

SBC_Baseboard_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.48 2>/dev/null)
SBC_Baseboard_Temp=$(echo $SBC_Baseboard_Temp | bc -l 2>/dev/null)

SBC_CPU0_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.55 2>/dev/null)
SBC_CPU0_Temp=$(echo $SBC_CPU0_Temp | bc -l 2>/dev/null)

SBC_CPU1_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.56 2>/dev/null)
SBC_CPU1_Temp=$(echo $SBC_CPU1_Temp | bc -l 2>/dev/null)

SBC_Drive_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.93 2>/dev/null)
SBC_Drive_Temp=$(echo $SBC_Drive_Temp | bc -l 2>/dev/null)

SBC_DRAM_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.94 2>/dev/null)
SBC_DRAM_Temp=$(echo $SBC_DRAM_Temp | bc -l 2>/dev/null)

SBC_Inlet_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.95 2>/dev/null)
SBC_Inlet_Temp=$(echo $SBC_Inlet_Temp | bc -l 2>/dev/null)

echo "ZXSBC_Temp|SBC_Baseboard_Temp=$SBC_Baseboard_Temp SBC_CPU0_Temp=$SBC_CPU0_Temp SBC_CPU1_Temp=$SBC_CPU1_Temp \
SBC_Drive_Temp=$SBC_Drive_Temp SBC_DRAM_Temp=$SBC_DRAM_Temp SBC_Inlet_Temp=$SBC_Inlet_Temp"

exit 0
