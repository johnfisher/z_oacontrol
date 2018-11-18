# Shellscript to use individual snmpget commands to get
#    temperature readings for a ZX9210 from Pigeon Point SHELF MANAGER.
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
# ./getZX9210TempValues.sh  10.2.0.83  public  v2c 140 4
#
###############################################################################################

ZX9210_CPU0_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.8 2>/dev/null)
ZX9210_CPU0_Temp=$(echo $ZX9210_CPU0_Temp | bc -l 2>/dev/null)
ZX9210_CPU1_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.9 2>/dev/null)
ZX9210_CPU1_Temp=$(echo $ZX9210_CPU1_Temp | bc -l 2>/dev/null)
ZX9210_DIMM_A_Max_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.10 2>/dev/null)
ZX9210_DIMM_A_Max_Temp=$(echo $ZX9210_DIMM_A_Max_Temp | bc -l 2>/dev/null)
ZX9210_DIMM_B_Max_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.11 2>/dev/null)
ZX9210_DIMM_B_Max_Temp=$(echo $ZX9210_DIMM_B_Max_Temp | bc -l 2>/dev/null)
ZX9210_DIMM_C_Max_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.12 2>/dev/null)
ZX9210_DIMM_C_Max_Temp=$(echo $ZX9210_DIMM_C_Max_Temp | bc -l 2>/dev/null)
ZX9210_DIMM_D_Max_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.13 2>/dev/null)
ZX9210_DIMM_D_Max_Temp=$(echo $ZX9210_DIMM_D_Max_Temp | bc -l 2>/dev/null)
ZX9210_DIMM_E_Max_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.14 2>/dev/null)
ZX9210_DIMM_E_Max_Temp=$(echo $ZX9210_DIMM_E_Max_Temp | bc -l 2>/dev/null)
ZX9210_DIMM_F_Max_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.15 2>/dev/null)
ZX9210_DIMM_F_Max_Temp=$(echo $ZX9210_DIMM_F_Max_Temp | bc -l 2>/dev/null)
ZX9210_DIMM_G_Max_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.16 2>/dev/null)
ZX9210_DIMM_G_Max_Temp=$(echo $ZX9210_DIMM_G_Max_Temp | bc -l 2>/dev/null)
ZX9210_DIMM_H_Max_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.17 2>/dev/null)
ZX9210_DIMM_H_Max_Temp=$(echo $ZX9210_DIMM_H_Max_Temp | bc -l 2>/dev/null)
ZX9210_CPU0_Thermal_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.20 2>/dev/null)
ZX9210_CPU0_Thermal_Temp=$(echo $ZX9210_CPU0_Thermal_Temp | bc -l 2>/dev/null)
ZX9210_CPU1_Thermal_Temp=$(/usr/bin/snmpget -$3 -c $2  -O qvU  $1 .1.3.6.1.4.1.16394.2.1.1.3.1.29.$4.21 2>/dev/null)
ZX9210_CPU1_Thermal_Temp=$(echo $ZX9210_CPU1_Thermal_Temp | bc -l 2>/dev/null)

echo "ZX9210Device_Temp_$5|ZX9210_CPU0_Temp_$5=$ZX9210_CPU0_Temp ZX9210_CPU1_Temp_$5=$ZX9210_CPU1_Temp \
ZX9210_DIMM_A_Max_Temp_$5=$ZX9210_DIMM_A_Max_Temp ZX9210_DIMM_B_Max_Temp_$5=$ZX9210_DIMM_B_Max_Temp \
ZX9210_DIMM_C_Max_Temp_$5=$ZX9210_DIMM_C_Max_Temp ZX9210_DIMM_D_Max_Temp_$5=$ZX9210_DIMM_D_Max_Temp \
ZX9210_DIMM_E_Max_Temp_$5=$ZX9210_DIMM_E_Max_Temp ZX9210_DIMM_F_Max_Temp_$5=$ZX9210_DIMM_F_Max_Temp \
ZX9210_DIMM_G_Max_Temp_$5=$ZX9210_DIMM_G_Max_Temp ZX9210_DIMM_H_Max_Temp_$5=$ZX9210_DIMM_H_Max_Temp \
ZX9210_CPU0_Thermal_Temp_$5=$ZX9210_CPU0_Thermal_Temp ZX9210_CPU1_Thermal_Temp_$5=$ZX9210_CPU1_Thermal_Temp"

exit 0

