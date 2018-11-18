#!/usr/bin/perl
use JSON::XS;
use strict;
my $server="enter you hostname here";
my $port="8080";
my $user="username";
my $password="password";
my %devices;
my $wget="/usr/bin/wget";
my $wget_type=2; # 1 - older wget, 2 - later version
my $node;
my $url;


while(<>)
{
process($_);	
}

sub process
{
my ($line)=@_;
chomp($line);
$line=~s/#.+$//;
my $res;
if ($line=~m/NODE (.+)/)
{
	$node=$1;
#	print STDERR "Found node $node\n";
	undef($node) if ($node eq "DEFAULT");
	if (defined($node))
	{
		$url=get_device_url($node);
#		print STDERR "url($node)=$url\n";
	}
}
if (defined($node))
{
	if ($line=~m/<%url%>/)
	{
#		print STDERR "TAG URL\n";
		#print "url=$url\n";
		my $tmp="http://".get_serv_url_no_auth()."$url";
		$line=~s/<%url%>/$tmp/;
	}
	elsif ($line=~m/<%status%>/)
	{
#		print STDERR "TAG STATUS\n";
#		print STDERR "$node $url\n";
		$res=get_device_max_severity($url);
		$line=~s/<%status%>/$res/;
	}
	elsif ($line=~m/<%rrd-from/)
	{
		while($line=~m/<%rrd-from([^%]+)%>/)
		{
			my $tmp;
			$tmp=$1;
			my $res;
			if ($tmp=~m/\((.+),(.+),(.+)\)/)
			{
				$res=get_rrd_value($1,$2,$3);
			}
			elsif($tmp=~m/\((.+),(.+)\)/) 
			{
				$res=get_rrd_value($1,$2);
			}
			else
			{
				die ("Bad format $line");
			}
			if ($line!~s/<%rrd-from([^%]+)%>/$res/)
			{
				die ("Error 1");
			}
		}
	}
	elsif ($line=~m/<%rrd/)
	{
		while($line=~m/<%rrd([^%]+)%>/)
		{
			my $tmp;
			$tmp=$1;
			my $res;
			#device, url, dsname,action
			if ($tmp=~m/\((.+),(.+),(.+),(.+)\)/)
			{
				my $url=get_device_url($1);
				$res=get_rrd_value("$url/$2",$3,$4);
			}
			#the same as above but without action
			elsif($tmp=~m/\((.+),(.+),(.+)\)/) 
			{
				my $url=get_device_url($1);
				$res=get_rrd_value("$url/$2",$3);
			}
			else
			{
				die ("Bad format $line");
			}
			if ($line!~s/<%rrd([^%]+)%>/$res/)
			{
				die ("Error 1");
			}
		}
	}
	elsif ($line=~m/<%graph/)
	{
		while($line=~m/<%graph([^%]+)%>/)
		{
			my $tmp;
			$tmp=$1;
			my $res;
			#device, url, graphname
			if ($tmp=~m/\((.+),(.+),(.+)\)/)
			{
				my $url=get_device_url($1);
				$res=get_graph_url("$url/$2",$3);
			}
			else
			{
				die ("Bad format $line");
			}
			if ($line!~s/<%graph([^%]+)%>/$res/)
			{
				die ("Error 1");
			}
		}
	}
	elsif ($line=~m/<%status-width/)
	{
		while($line=~m/<%status-width([^%]+)%>/)
		{
			my $tmp;
			$tmp=$1;
			my $res;
			#WidthIfOK, device, port
			if ($tmp=~m/\((.+),(.+),(.+)\)/)
			{
				my $url=get_device_url($2);
				$res=get_port_status("$url/$3");
				if ($res==1) #OK
				{
				  $res=$1; #default width
				}
				else
				{
				  $res=0;
				}
			}
			else
			{
				die ("Bad format $line");
			}
			if ($line!~s/<%status-width([^%]+)%>/$res/)
			{
				die ("Error 1");
			}
		}
	}


}
print "$line\n";
}




sub get_graph_url
{
my ($url,$graphname)=@_;
#print STDERR "GETT GRAPH $url\n";
my ($res,$status);
$url=$url."/getDefaultGraphDefs";
$url=~s/\/\//\//g;
($res,$status)=make_query($url);
if ($status==0)
{
	die ("Can't query $url");
}
if ($res eq "")
{
	die ("Empty responce for $url");
}
$res=~s/'/"/g;
my $t=decode_json $res;
while (my $element=shift @{$t})
{
	#print STDERR $element;
	if (!exists($$element{'url'}) || !exists($$element{'title'}))
	{
		die ("Bad responce format");
	}
	if ($$element{'title'} eq $graphname)
	{
	return("http://".get_serv_url_no_auth().$$element{'url'}."&comment=$$element{'title'}");

		
	}

}
#print STDERR $t;
return($res);
}


sub get_rrd_value
{
my ($url,$dsname,$change)=@_;
#print STDERR "GETT RRD $url $dsname\n";
my ($res,$status);
$url=$url."/getRRDValue/";
$url=~s/\/\//\//g;
($res,$status)=make_query($url,"dsname=$dsname");
if ($status==0 || $res eq "")
{
	die ("Can't query $url, $dsname");
}
if (defined($change))
{
	if ($change=~m/\*(\d+)/)
	{
		$res=$res*$1;
	}
}
return($res);
}


sub get_port_status
{
my ($url)=@_;
#print STDERR "GETT PORT STATUS $url\n";
my ($res,$status);
$url=$url."/getAqProperty";
$url=~s/\/\//\//g;
($res,$status)=make_query($url,"prop=operStatus");
if ($status==0)
{
	die ("Can't port status $url");
}
return($res);
}



sub get_serv_url
{
if ($wget_type eq 1)
{
  return("$user:$password".'@'."$server:$port/");	
}
elsif ($wget_type eq 2) # no auth here
{
  return("$server:$port/");	
}
}
sub get_serv_url_no_auth
{
return("$server:$port");	
}


#my $url= get_device_url("mail.chg.ru");
#get_device_max_severity($url);

#make query to Zenoss via WGET
sub make_query
{
my ($url,$params)=@_;	
my $t;
$t=get_serv_url()."$url";
if (defined($params))
{
	$t=$t."?$params";
}
$t=~s/\/\//\//g;
#print "$t\n";
if ($wget_type eq 1)
{
  open(IN,"$wget -O - -q 'http://$t'|") or die ("Can't run wget");
}
elsif ($wget_type eq 2)
{
  open(IN,"$wget --auth-no-challenge  --http-user '$user' --http-password '$password' -O - -q 'http://$t'|") or die ("Can't run wget");
}
my $res;
while($_=<IN>)
{
	$res=$res."$_";
}
close(IN);
if ($?==0)
{
  return($res,1); #OK
}

return($res,0); #Error
}

sub get_device_url
{
my ($devicename)=@_;
my ($url,$status)=make_query("zport/dmd/Devices/findDevicePath","devicename=$devicename");
if ($status==0)
{
	die ("Error searching device $devicename\n");
}
if (length($url)==0)
{
	print STDERR ("No such device $devicename\n");
}
return($url);
}

#get maximum unacknowledged severity
sub get_device_max_severity
{
my ($deviceurl)=@_;
my ($res,$status)=make_query("$deviceurl/getEventSummary");
if ($status==0)
{
	die ("Error reading get_device_max_severity for $deviceurl");
}
$res=~s/'/"/g;
my $t=decode_json $res;
if ($#{$t} ne 4)
{
	die("Error in response in get_device_max_severity.");
}
my $a;
my $c=5;
while($a=shift @{$t})
{
	my ($name,$ack,$nonack);
	$name=$$a[0];
	$ack=$$a[1];
	$nonack=$$a[2];
#	print "name=$name $ack $nonack\n";
	if ($nonack>$ack)
	{
		#print "max=$nonack\n";
		return($c);
	}
	$c--;
}
return(0);
}
