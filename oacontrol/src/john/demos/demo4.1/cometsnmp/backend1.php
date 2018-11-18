<?php
 
/*
Simple COMET script tested to work with IE6, IE8, IE9, Chrome 5, Chrome 10, Firefox 3.6.16, Firefox 4, Safari 5, Opera 11
*/
 
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 2020 05:00:00 GMT");
 
//Turn of Apache output compression
// Necessary if you have gzip setup in your httpd.conf (e.g. LoadModule deflate_module modules/mod_deflate.so)
apache_setenv('no-gzip', 1);
ini_set('zlib.output_compression', 0);
 
//Disable all PHP output buffering
ini_set('output_buffering', 'Off');
ini_set('implicit_flush', 1);
ob_implicit_flush(1);
 
for ($i = 0, $level = ob_get_level(); $i < $level; $i++) { ob_end_flush(); } //Flush all levels of the buffer to start
 
error_reporting(E_ALL);
 
?><html>
<head>
  <title>Comet php backend</title>
</head>
<body>
<script type="text/javascript">
	var dumpText = window.parent.dumpText;

</script>
<?php

function getAllZRELinkState ( $ip,  $znyxPlatform )
{
    //net-snmp: snmpwalk  -v1 -c public 10.2.0.215 zZX1900FABRICLinkCtrlState
    //array snmp2_walk ( string $host , string $community , string $object_id [, string $timeout = 1000000 [, string $retries = 5 ]] )
    // getAllZRELinkState ( "10.2.0.215",  "ZX1900FABRIC")
    $snmpObject = 'z' . $znyxPlatform . 'LinkCtrlState';
    $snmpdatarray = snmp2_walk( $ip, "public", $snmpObject ) ;
    return $snmpdatarray ;
}

$linkStatus = getAllZRELinkState( "10.2.0.215",  'ZX1900FABRIC') ;
$text = " my dollar text";


	//$linkStatus = getAllZRELinkState( "10.2.0.215",  'ZX1900FABRIC') ;
	echo '<script type="text/javascript">';
	echo 'dumpText("' ;
foreach ( $linkStatus as $val ){
	echo  "$val"  ;
}
	echo '");' ;
	echo "</script>\r\n";

 




///////////////////////////////////////////////////////////////////////////////

  

	
//  while($count < $maxCount) {
// 	//$snmp_values = snmpwalk("10.2.0.215", "public", null) ;
// 	echo '<script type="text/javascript">';
// 	echo "dumpText(".time().');'.str_repeat(' ',500); //500 characters of padding
// 	echo 'dumpText(' . $snmp_values . ')'; 
// 	echo "</script>\r\n";
//  
// 	flush();
//  
//   	$randSleep = mt_rand(100000, 5000000); //sleep between 100 ms and 2 seconds
// 	usleep($randSleep);
// 	$count++;
//  }
 
?>
<script type="text/javascript">dumpText("Output Finished");</script>
</body>
</html>