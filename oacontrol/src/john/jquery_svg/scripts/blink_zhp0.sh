#!/bin/bash

while :
  do
  ifconfig zhp0 down
  sleep 2
  ifconfig zhp0 up
  sleep 1
  ifconfig zhp0 down
  sleep 1
  ifconfig zhp0 up
  ifconfig zhp0 down
  sleep 1
  ifconfig zhp0 up
  sleep 2

  done