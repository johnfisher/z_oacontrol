<?php
 



header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 2010 05:00:00 GMT");
//header("Content-type: application/json");
 
//Turn of Apache output compression
// Necessary if you have gzip setup in your httpd.conf (e.g. LoadModule deflate_module modules/mod_deflate.so)
 //apache_setenv('no-gzip', 1);
 ini_set('zlib.output_compression', 0);
//  
// //Disable all PHP output buffering
 ini_set('output_buffering', 'Off');
 ini_set('implicit_flush', 1);
 ob_implicit_flush(1);
//  
 for ($i = 0, $level = ob_get_level(); $i < $level; $i++) { ob_end_flush(); } //Flush all levels of the buffer to start
 
error_reporting(E_ALL);
 
 
?>

<?php
include "functions4.1.php";


//loopForSNMPData();
writeSNMP();







 //echo json_encode(array("name"=>"John","time"=>"2pm")); 

// $mystring = '{ "name" : "John" , "time" : "20clocky"}';
// 
// //echo $mystring;
// 
// $myutf8str = utf8_encode($mystring) ;
// 
// //echo "";
// 
// echo $myutf8str ;



//$arr=array("name"=>"John","time" => "20clocky");
//echo json_encode( $arr);


?>



