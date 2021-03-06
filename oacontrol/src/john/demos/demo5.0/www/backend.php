<?php
 
/*
Simple COMET script tested to work with IE6, IE8, IE9, Chrome 5, Chrome 10, Firefox 3.6.16, Firefox 4, Safari 5, Opera 11
*/
 

header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 2020 05:00:00 GMT");
 
//Turn of Apache output compression
// Necessary if you have gzip setup in your httpd.conf (e.g. LoadModule deflate_module modules/mod_deflate.so)
//apache_setenv('no-gzip', 1);
ini_set('zlib.output_compression', 0);
 
//Disable all PHP output buffering
ini_set('output_buffering', 'Off');
ini_set('implicit_flush', 1);
ob_implicit_flush(1);
 
for ($i = 0, $level = ob_get_level(); $i < $level; $i++) { ob_end_flush(); } //Flush all levels of the buffer to start
 
error_reporting(E_ALL);
 
?>

<?php
include "include/functions.php";


//loopForSNMPData();
writeSNMP();


?>

