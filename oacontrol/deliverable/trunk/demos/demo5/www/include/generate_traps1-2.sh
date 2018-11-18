#!/bin/bash
# bounce zre's up and down to produce snmptraps for zenoss


while true
do

# just for form, actually few come up
zlc zre0..19 up
sleep 1
zlc zre2 down
sleep 2
zlc zre1 down
sleep 5
zlc zre2 up
sleep 3
zlc zre1 up
sleep 1
zlc zre1 down
sleep 2
zlc zre12 down
sleep 5
zlc zre1 down
sleep 3
zlc zre1 up
sleep 1
zlc zre2 up
sleep 5
zlc zre2 down
sleep 2
zlc zre1 down
sleep 3
zlc zre1 up
sleep 3
zlc zre11 down
sleep 1
zlc zre2 up
sleep 1
zlc zre1 up
sleep 3
zlc zre2 down
sleep 1
zlc zre1 up
sleep 3
zlc zre2 up


done