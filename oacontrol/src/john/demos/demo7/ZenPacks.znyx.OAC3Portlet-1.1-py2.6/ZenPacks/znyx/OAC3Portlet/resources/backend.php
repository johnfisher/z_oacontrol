<?php
 
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

include "functions.php";
getSHMM();

writeSNMP();

function getSHMM(){
	if (file_exists('chassis.xml')){
		$xml = simplexml_load_file('chassis.xml');
		// var_dump($xml);
		 $GLOBALS["baseip"] = $xml->base->{"ip"};
		 $GLOBALS["fabip"] = $xml->fab->{"ip"};
		 $GLOBALS["shmmip"] = $xml->shmm->{"ip"};
		 $GLOBALS["slot1_ip"] = $xml->slot1->{"ip"};
		 $GLOBALS["slot2_ip"] = $xml->slot2->{"ip"};
		 $GLOBALS["slot3_ip"] = $xml->slot3->{"ip"};
		 $GLOBALS["slot4_ip"] = $xml->slot4->{"ip"};
		 $GLOBALS["slot5_ip"] = $xml->slot5->{"ip"};
		 $GLOBALS["slot6_ip"] = $xml->slot6->{"ip"};
		 $GLOBALS["slot7_ip"] = $xml->slot7->{"ip"};
		 $GLOBALS["slot8_ip"] = $xml->slot8->{"ip"};
	}else{
		exit('Error: cant open chassis.xml.');
	}
}


?>

