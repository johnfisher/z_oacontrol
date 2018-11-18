#!/bin/bash

while :
  do
  ifconfig zhp1 down
  sleep 2
  ifconfig zhp2 down
  sleep 1
  ifconfig zhp2 up
  sleep 1
  ifconfig zhp1 up
  ifconfig zhp2 down
  sleep 1
  ifconfig zhp2 up
  sleep 2
  ifconfig zhp1 down
  sleep 1
  ifconfig zhp1 up
  ifconfig zhp0 down
  sleep 1
  ifconfig zhp0 up
  sleep 2
  ifconfig zhp2 down
  sleep 1
  ifconfig zhp2 up


  done