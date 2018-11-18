<?php
 
/*
Simple COMET script tested to work with IE6, IE8, IE9, Chrome 5, Chrome 10, Firefox 3.6.16, Firefox 4, Safari 5, Opera 11
*/
 
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
 
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
 
$startTime = time();
$maxLoopTime = 50;
 
// while(time()-$startTime < $maxLoopTime) {
//  
// 	echo '<script type="text/javascript">';
// 	echo "dumpText(".time().');'.str_repeat(' ',500); //500 characters of padding
// 	echo "</script>\r\n";
//  
// 	flush();
//  
//   	$randSleep = mt_rand(100000, 5000000); //sleep between 100 ms and 2 seconds
// 	usleep($randSleep);
// }

///////////////////////////////////////////////////////////////////////////////
$count = 0 ;
$maxCount = 50;
while($count < $maxCount) {
  $snmp_values = snmpwalk("10.2.0.215", "public", null);
  echo '<script type="text/javascript">';
	echo "dumpText(".$snmp_values.');'.str_repeat(' ',500); //500 characters of padding
	echo "</script>\r\n";

  $count++;
}
 
?>
<script type="text/javascript">dumpText("Output Finished");</script>
</body>
</html>