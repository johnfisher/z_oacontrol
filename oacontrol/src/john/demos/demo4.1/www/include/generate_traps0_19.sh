#!/bin/bash
# bounce zre's up and down to produce snmptraps for zenoss


while ;
do

zlc zre0..19 up
sleep 1
zlc zre2 down
sleep 2
zlc zre4 down
sleep 1
zlc zre3 down
sleep 3
zlc zre5 down
sleep 1
zlc zre0..19 up
sleep 1
zlc zre11 down
sleep 2
zlc zre12 down
sleep 1
zlc zre13 down
sleep 3
zlc zre0..19 down
sleep 1
zlc zre0..19 up
sleep 1
zlc zre0 down
sleep 2
zlc zre19 down
sleep 1
zlc zre15 down
sleep 3
zlc zre11 down
sleep 1
zlc zre0..19 up
sleep 1
zlc zre7 down
sleep 2
zlc zre6 down
sleep 1
zlc zre9 down
sleep 3
zlc zre3 down
sleep 1
zlc zre0..19 up

done