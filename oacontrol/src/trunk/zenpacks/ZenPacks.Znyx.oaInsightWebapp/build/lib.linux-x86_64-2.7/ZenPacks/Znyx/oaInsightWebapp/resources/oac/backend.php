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
getAddresses();

writeSNMP();

function getAddresses(){
	if (file_exists('chassis.xml')){
		$xml = simplexml_load_file('chassis.xml');
		//var_dump($xml);
		 $GLOBALS["shmm_ip"]["8"] = stringifyXmlObject( $xml->slot8->{"shmm-ip"} ) ;
		 $GLOBALS["shmm_ip"]["7"] = stringifyXmlObject ($xml->slot7->{"shmm-ip"} ) ;
		 $GLOBALS["slot_ip"]["1"] = stringifyXmlObject( $xml->slot1->{"ip"} ) ;
		 $GLOBALS["slot_ip"]["2"] = stringifyXmlObject( $xml->slot2->{"ip"} ) ;
		 $GLOBALS["slot_ip"]["3"] = stringifyXmlObject( $xml->slot3->{"ip"} ) ;
		 $GLOBALS["slot_ip"]["4"] = stringifyXmlObject( $xml->slot4->{"ip"} ) ;
		 $GLOBALS["slot_ip"]["5"] = stringifyXmlObject( $xml->slot5->{"ip"} ) ;
		 $GLOBALS["slot_ip"]["6"] = stringifyXmlObject( $xml->slot6->{"ip"} ) ;
		 $GLOBALS["slot_ip"]["7"] = stringifyXmlObject( $xml->slot7->{"ip"} ) ;
		 $GLOBALS["slot_ip"]["8"] = stringifyXmlObject( $xml->slot8->{"ip"} ) ;
		//var_dump( $GLOBALS) ) ;
	}else{
		exit('Error: cant open chassis.xml.');
	}

//print_r  $GLOBALS;
//echo "<p>..........";
//$foo = array( (string) $xml->channel->item->title );
//print_r( stringifyXmlObject( $xml->slot8->{"shmm-ip"} ));
//$ip = array ((string) $xml->slot8->{"shmm-ip"} );
//print_r($ip[0]);
//echo "<p>..........";


}


?>

