
#!/usr/bin python

# Screen Scraping at its best!

import getopt, os, pexpect, re, string, sys, telnetlib, time, tty
from select import select

class NotTTYException(Exception): pass

class TerminalFile:
    def __init__(self,infile):
        if not infile.isatty():
            raise NotTTYException()
        self.file=infile

        #prepare for getch
        self.save_attr=tty.tcgetattr(self.file)
        newattr=self.save_attr[:]
        newattr[3] &= ~tty.ECHO & ~tty.ICANON
        tty.tcsetattr(self.file, tty.TCSANOW, newattr)

    def __del__(self):
        #restoring stdin
        import tty  #required this import here
        tty.tcsetattr(self.file, tty.TCSADRAIN, self.save_attr)

    def getch(self):
        if select([self.file],[],[],0)[0]:
            c=self.file.read(1)
        else:
            c=''
        return c

# ports is a list of a list of integers
# ports entry = [zreID, LinkStatus, OkLedStatus]
ports = []

# trunks is an list of a list of strings
# trunks entry = [trunkID, zreList, trunkType]
trunks = []

# zhps is a list of a list of strings
# zhps entry = [zhpID, vlanID, portList]
zhps = []

def add_port(startID, stopID, link, led):
     start = int(startID)
     stop =  int(stopID)
    
     portID = start
     found = False
     
     while (portID <= stop):
	  # Look for portID
	  # Add it if we can't find it.
	  
	  if ports != []:	  
	       for a in range(len(ports)):
		    p = ports[a]
		    if p[0] == portID:  
			 found = True
			 break	  
	  
	  if found == False:
	       ports.append([portID, link, led])
	  else:
	       break
	       
	  # Increment loop variable
	  portID = portID + 1
	  
     return

def process_word(zstring):
     
     zstring = zstring.strip('zre,')
 
     if (zstring.find("..") == -1):
	  start = zstring
	  stop = start
     else:
	  zstring = zstring.replace(".."," ")
	  nums = zstring.split()
	  start = nums[0]
	  stop = nums[len(nums) - 1]
		    
     add_port(start, stop, 0, 0)

     return
     
def process_zrl(l):
     found = False
     zString = ""
     
     # Assume format like zrl0 = zre1..21 OR zrl0 = ip
     # Strip out equal sign & split into words
     l = l.replace("="," ")
     words = l.split()
     words[0] = words[0].strip('zrl')
     
     # Add trunk
     if trunks != []:	  
	  for a in range(len(trunks)):
	       t = trunks[a]
	       if t[0] == words[0]:  
		    t[2] = words[1]
		    found = True
		    break

     if found == False:

	  # Add zres to ports.
	  start = 0
	  stop = 0
	  
	  for a in range(1,len(words)):
	       zString += words[a]
	       process_word(words[a])

	  trunks.append([words[0],zString,""])
	  
     return
     
def process_zhp(l):

     # Assume format like zhp1: vlan2 = zre22..23
     
     # Strip out equal sign
     l = l.replace("="," ")
     
     # Strip out colon
     l = l.replace(":"," ")
   
     # Strip off the beginning of zhp and vlan IDs.
     words = l.split()
     words[0] = words[0].strip('zhp')
     words[1] = words[1].strip('vlan')
   
     # Process zre/zrl words
     zString = ""
     start = 0
     stop = 0
	  
     for a in range(2,len(words)):
	  zString += words[a]
	  if words[a].startswith("zrl"):
	       for b in range(len(trunks)):
		    t = trunks[b]
		    if t[0] == words[a]:  
			 process_word(t[1])
			 break
	  elif words[a].startswith("zre"):
	       process_word(words[a])

     zhps.append([words[0],words[1],zString])
     
     return
     
def process_ports(l):
     
     # Assume format like zrl0 = untag2
     
     # Strip out equal sign
     l = l.replace("="," ")
   
     # Strip off the beginning of zhp and vlan IDs.
     words = l.split()
     #words[1] = words[1].strip('untag')
   
     # Process zre/zrl words
     start = 0
     stop = 0
	  
     for a in range(0,len(words)-1):
	  if words[a].startswith("zrl"):
	       for b in range(len(trunks)):
		    t = trunks[b]
		    if t[0] == words[a]:  
			 process_word(t[1])
			 break
	  elif words[a].startswith("zre"):
	       process_word(words[a])
 
     return
     
def parse_zconfig_results (r):

     lines = r.splitlines()
     for index in range(1,len(lines)):
	  line = lines[index]
	  if line.find("untag") != -1:
	       process_ports(line)
	  elif line.startswith("zrl"):
	       process_zrl(line)
	  elif line.startswith("zhp"):
	       process_zhp(line)
     return
     
def parse_zlc_results (portID, r):
     
     link = 0
     led = 0
     
     lines = r.splitlines()
     for line in range(1,len(lines)):
	  words = lines[line].split()

	  for a in range(0, len(words)):
	       words[a] = words[a].strip('zre:')
	       words[a] = words[a].strip('<>,')
	  
	  # Determine LINK & LED status.
	  for a in range(0, len(words)):
	       if (words[a] == "UP"):
		    link = 1
	       if (words[a] == "OK"):
		    if (a < (len(words) - 1)):
			 if (words[a+1] == "ON"):
			      led = 1
	  
	  # Update Ports list
	  if ports != []:	  
	       for a in range(len(ports)):
		    p = ports[a]
		    if p[0] == portID:  
			 p[1] = link
			 p[2] = led
			 break	  

     return
     
def main(): 

     host = "localhost"  
    
     try:
	  opts, args = getopt.getopt(sys.argv[1:], "h:", ["host="])
     except getopt.GetoptError, err:
	  # print help information and exit:
	  print str(err) 
	  sys.exit(2)
   
     # Get parameters   
     for opt, arg in opts:
	  if opt in ("-h", "--host"):
	       host = arg
	  else:
	       assert False, "unhandled option"
     
     # Open a telnet session to a remote server, and wait for a username prompt.
  
     child = pexpect.spawn('telnet ' + host)
     child.expect ('login:')
     
     # Send the username, and then wait for a prompt.
     child.sendline ('root')
     child.expect ('#')
  
     # Get the switch configuration.
     child.sendline ('zconfig -a')
     child.expect ('#')
     config_results = child.before
  
     parse_zconfig_results (config_results)

     # Get the link status.
     for a in range(len(ports)):
	  p = ports[a]
	  portID = "zre" + str(p[0])
	  
	  child.sendline ('zlc ' + portID + ' query')
	  child.expect ('#')
	  link_results = child.before
	  
	  parse_zlc_results (p[0], link_results)
	  
     # Exit the telnet session, and wait for a special end-of-file character.
     child.sendline ('exit')
     child.expect (pexpect.EOF)
     
     #print trunks
     #print zhps 
     #print ports
     
     f = open('/tmp/port_status', 'w')

     # Output to file, one line per port, separated by spaces:
     # PortID LINK(UP=1) LED(ON=1)

     for a in range(len(ports)):
	  p = ports[a]
	  #print '%4d %1d %1d' % (p[0], p[1], p[2])
	  f.write ( '%4d %1d %1d\n' % (p[0], p[1], p[2]))
	  
     f.close
     
if __name__ == '__main__': 
     s=TerminalFile(sys.stdin)
     print "Press q to quit..."
     while s.getch()!="q":
	  main()
	  time.sleep(1)
     print "-- END --"

  


