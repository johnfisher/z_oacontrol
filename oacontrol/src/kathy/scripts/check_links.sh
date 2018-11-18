#!/bin/bash

states=(UP NOT_INITED STOPPED DOWN RELEASED TESTING BLOCKED FORCED_DOWN EKEY_DISABLED)

speeds=(AUTO 10HD 10FD 100HD 100FD 1000HD 1000FD 10GFD 12GFD)

toggles=(ON OFF)

# GET LINK DATA
# HOW DO I DETERMINE IP ADDRESS?
# HOW DO I KNOW PORT RANGE?

# Open a telnet session to a remote server, and wait for a username prompt.
  `telnet -l root 10.2.0.244`
 
  # Send the prebuilt command, and then wait for another shell prompt.
  zlc zre0..52 query

  # Capture the results of the command into a variable. This can be displayed, or written to disk.
  set results $expect_out(buffer)
  # Exit the telnet session, and wait for a special end-of-file character.
  send "exit\r"
  expect eof

# PROCESS LINK DATA
  echo $results

