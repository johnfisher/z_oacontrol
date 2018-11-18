<?PHP
// all the PHP functions  //
require_once("XML/Serializer.php");
$loop_break = false;  // flag to turn off loop
define( 'MIB_PATH', '/usr/share/mibs/netsnmp'); 
define( 'LOOP_DUR', '5000000' );

function getAllZRELinkState ( $ip,  $znyxPlatform )
{
    //net-snmp: snmpwalk  -v1 -c public FABIP zZX1900FABRICLinkCtrlState
    //array snmp2_walk ( string $host , string $community , string $object_id [, string $timeout = 1000000 [, string $retries = 5 ]] )
    // getAllZRELinkState ( FABIP,  "ZX1900FABRIC")
    $snmpObject = 'z' . $znyxPlatform . 'LinkCtrlState';
    $snmpdatarray = snmp2_walk(  $ip, "public", $snmpObject ) ;
//echo "...<p>";
//print_r( $snmpdatarray);
//echo "<p>....";
    $cleansnmp = substr_replace($snmpdatarray, '', 0 , 9); // trim from front
    $clean2snmp = substr_replace($cleansnmp, '', -3 , 3) ; //trim from rear 
//echo "...<p>";
//print_r( $clean2snmp);
//echo "<p>....";
    return $clean2snmp ;
}

function getExtState ( $ip,  $znyxPlatform )
{
    $snmpObject = 'z' . $znyxPlatform . 'ExternalFaultLedStatus';
    $snmpdatarray = snmp2_walk(  $ip, "public", $snmpObject ) ;
    $cleansnmp = substr_replace($snmpdatarray[0], '', 0 , 9); // trim from front 
    $clean2snmp = substr_replace($cleansnmp, '', -3 , 3) ; //trim from rear 
    return $clean2snmp ;
}

function getIntState ( $ip,  $znyxPlatform )
{
    $snmpObject = 'z' . $znyxPlatform . 'InternalFaultLedStatus';
    $snmpdatarray = snmp2_walk(  $ip, "public", $snmpObject ) ;
    $cleansnmp = substr_replace($snmpdatarray[0], '', 0 , 9); // trim from front 
    $clean2snmp = substr_replace($cleansnmp, '', -3 , 3) ; //trim from rear 
    return $clean2snmp ;
}

function getSerialNo ( $ip,  $znyxPlatform )
{
    $snmpObject = 'zhwCompSerial.1';
    $snmpdata = snmp2_get(  $ip, "public", 'zhwCompSerial.1' ) ;
    $cleansnmp = substr_replace($snmpdata, '', 0 , 9); // trim from front STRING: "01DH00003ZNX"
    $clean2snmp = substr_replace($cleansnmp, '', -1 , 3) ; //trim from rear 
    return $clean2snmp ;
}

function stringifyXmlObject( $obj )
{
	// use to get a string out of the one-member array that simplexml creates when it sees an element
	$arr_result = array ((string) $obj );
	return ($arr_result[0]);
}


function importMibs () {     
    if ( $handle = opendir( MIB_PATH ) )   { 
	while ( false !== ($file = readdir($handle))  ){
	    if($file ) 	{  // later add a filter for "Z" mibs to speed up   	
		snmp_read_mib( MIB_PATH . '/' . $file ) ;
	    }
	}
    }
    closedir($handle);
}

function slotOccupier(){
// get whats in each slots from shmc
// return data: slot# :: empty|7300|sbc
// zero member [0] of array is slot 1 
	// which shmm is active? assume 8 for now
	if  ( $GLOBALS["shmm_ip"][8] != null ) {
		$ip = $GLOBALS["shmm_ip"][8] ;
		$slotdata = array( );
		$snmpdata[0] = snmp2_get(  $ip, "public", "fru-device-by-site-id-string.0.1" ) ;
		$mstate[0] = snmp2_get ( $ip, "public", "fru-device-by-site-hot-swap-state.0.1" ) ;
		$snmpdata[1] = snmp2_get(  $ip, "public", "fru-device-by-site-id-string.0.2" ) ;
		$mstate[1] = snmp2_get ( $ip, "public", "fru-device-by-site-hot-swap-state.0.2" ) ;
		$snmpdata[2] = snmp2_get(  $ip, "public", "fru-device-by-site-id-string.0.3" ) ;
		$mstate[2] = snmp2_get ( $ip, "public", "fru-device-by-site-hot-swap-state.0.3" ) ;
		$snmpdata[3] = snmp2_get(  $ip, "public", "fru-device-by-site-id-string.0.4" ) ;
		$mstate[3] = snmp2_get ( $ip, "public", "fru-device-by-site-hot-swap-state.0.4" ) ;
		$snmpdata[4] = snmp2_get(  $ip, "public", "fru-device-by-site-id-string.0.5" ) ;
		$mstate[4] = snmp2_get ( $ip, "public", "fru-device-by-site-hot-swap-state.0.5" ) ;
		$snmpdata[5] = snmp2_get(  $ip, "public", "fru-device-by-site-id-string.0.6" ) ;
		$mstate[5] = snmp2_get ( $ip, "public", "fru-device-by-site-hot-swap-state.0.6" ) ;
		$snmpdata[6] = snmp2_get(  $ip, "public", "fru-device-by-site-id-string.0.7" ) ;
		$mstate[6] = snmp2_get ( $ip, "public", "fru-device-by-site-hot-swap-state.0.7" ) ;
		$snmpdata[7] = snmp2_get(  $ip, "public", "fru-device-by-site-id-string.0.8" ) ;
		$mstate[7] = snmp2_get ( $ip, "public", "fru-device-by-site-hot-swap-state.0.8" ) ;

		// raw data: 'STRING: "Switch"'
		// raw data: 'INTEGER: M4(4)'
		for ($i = 0; $i < 8; $i++) {
			if ( preg_match ( "/STRING/" , $snmpdata[$i]  ) ){
				$slotdata[$i + 1][0]  = substr_replace($snmpdata[$i] , '', 0 , 8); // raw data = STRING: "Switch" or sim.
			}else  {
				$slotdata[$i + 1][0]  = "empty" ;
			}
			if (  preg_match ( "/INTEGER/" , $mstate[$i] ) ){
				$slotdata[$i + 1][1]  = substr_replace($mstate[$i] , '', 0 , 9); // raw data = INTEGER: M4(4) or sim.
			}else {
				$slotdata[$i + 1][1]  = "empty";
			}	
		}
		//print_r($slotdata);
			//echo "<p>";
		return $slotdata ;
	}
}


function getSNMPLinux(){
    $a = array(0 => "getsnmplinux return", 1 => "filler") ;
    return $a;
}


function getSNMPShMC(){
    $a = array(0 => "getsnmpshnc return", 1 => "filler") ;
    return $a;
}

function writeSNMP(){
		//print_r($GLOBALS);
		
	importMibs();

		
	$data = array( "slot1" => array(), "slot2" => array(), "slot3" => array(), "slot4" => array(), "slot5" => array(), "slot6" => array(), "slot7" => array(), "slot8" => array(), "chassis" => array() ) ;

	$slots = slotOccupier();  // $slots is <slot number>(0 =  name ,1= mstate)
	//print_r($slots);////////////////////////////////////////
	for ($i =1; $i <7 ; $i++){
		$slot_ip = $GLOBALS["slot_ip"][$i] ;
		$mstate = substr( $slots[$i][1] , -4, 1) ;  // standard text is M4(4) change to "4" // $rest = substr("abcdef", -3, 1); // returns "d"
		switch ( $slots[$i][0] ) {
			case '"ZX7300"' :
				// first enter essential info, even if board is non-functional
				$data["slot" . $i]["name"] = "ZX7300" ;		//mark type of board in slot3
				$data["slot" . $i]["ip"] = $slot_ip ;		//
				$data["slot" . $i]["mstate"] = $mstate ;	//mark M state
				if ( $mstate == "4"){
					// if board is up&running enter the rest
					$linkstates = getAllZRELinkState ( $slot_ip,  "ZX7300" );
					//print_r( $linkstates);
					for ($c = 0 ; $c < 28 ; $c++){
						$data["slot" . $i]["port" . $c]["link"] = $linkstates[$i] ;
						$data["slot" . $i]["port" . $c]["cnf"] =  ""  ;
					}
					$ext = getExtState ( $slot_ip,  "ZX7300"  )	;	
					$int = getExtState ( $slot_ip,  "ZX7300"  )	;	
					$ser = getSerialNo ( $slot_ip,  "ZX7300" );		
					$data["slot" . $i]["ext"] = $ext  ;	//
					$data["slot" . $i]["int"] = $int  ;	//
					$data["slot" . $i]["serial"] = $ser;	//
				// NOT YET AVAILABLE


					$data["slot" . $i]["oafault"] =  ""  ;	//
					$data["slot" . $i]["clk"] =  ""  ;	//
					$data["slot" . $i]["ok"] =  ""  ;	//
					$data["slot" . $i]["healthy"] =  ""  ;	//
					$data["slot" . $i]["svc"] =  ""  ;	//
					$data["slot" . $i]["sys"] =  ""  ;	//
					$data["slot" . $i]["swserial"]["link"] =  ""  ;	//
					$data["slot" . $i]["swserial"]["cnf"] =  ""  ;	//
					$data["slot" . $i]["eth0"]["link"] =  ""  ;	//
					$data["slot" . $i]["eth0"]["cnf"] =   "" ;	//
					$data["slot" . $i]["eth1"]["link"] =  ""  ;	//
					$data["slot" . $i]["eth1"]["cnf"] =  ""  ;	//
					$data["slot" . $i]["eth2"]["link"] =  ""  ;	//
					$data["slot" . $i]["eth2"]["cnf"] =  ""  ;	//
				}
			break;
			case '"MPCBL0030"' :
				$data["slot" . $i]["name"] = "sbc" ;		//mark type of board in slot3
				$data["slot" . $i]["ip"] = $slot_ip ;		//
				$data["slot" . $i]["mstate"] = $mstate ;	//mark M state
				$data["slot" . $i]["serialno"] = "" ;	//
			break;
			default:
				//
			break;
		}
	}
	for ($i =7; $i <9 ; $i++){
		$_2010slot_ip = $GLOBALS["slot_ip"][$i] ;
		$_2010mstate = substr( $slots[$i][1], -4, 1 ) ;
		if ( $slots[$i][0] == '"ZX2010"' ){
				$data["slot" . $i]["name"] = "ZX2010" ;		//mark type of board in slot3
				$data["slot" . $i]["ip"] = $_2010slot_ip ;		//
				$data["slot" . $i]["mstate"] = $_2010mstate ;	//mark M state
			if ( $_2010mstate == "4"){
				$ser = getSerialNo ( $_2010slot_ip,  "ZX2010" );	
				$data["slot" . $i]["serial"] = $ser ;	//
				$_2010linkstates = getAllZRELinkState( $_2010slot_ip,  "ZX2010" );
				for ($c = 0 ; $c < 20 ; $c++){
					$data["slot" . $i]["port" . $c]["link"] = $_2010linkstates[$i];
					$data["slot" . $i]["port" . $c]["cnf"] = ""  ;
				}
				$data["slot" . $i]["hot"] =  ""  ;	//
				$data["slot" . $i]["oaa"] =  ""  ;	//
				$data["slot" . $i]["shmm"] =  ""  ;	//
				$data["slot" . $i]["oafault"] =  ""  ;	//
				$data["slot" . $i]["oos"] =  ""  ;	//
				$data["slot" . $i]["clk"] =  ""  ;	//
				$data["slot" . $i]["shmmeth0"]["link"] = ""   ;	//
				$data["slot" . $i]["shmmeth0"]["cnf"] =  ""   ;	//
				$data["slot" . $i]["sweth0"]["link"] = "" ;	//
				$data["slot" . $i]["sweth0"]["cnf"] = "" ;	//
				$data["slot" . $i]["shmmserial"]["link"] = "" ;	//
				$data["slot" . $i]["shmmserial"]["cnf"] = "" ;	//
				$data["slot" . $i]["swserial"]["link"] = "" ;	//
				$data["slot" . $i]["swserial"]["cnf"] = "" ;	//
			}
		}
	}
	$data["chassis"]["lfan"]["hot"] = "" ;
	$data["chassis"]["lfan"]["warn"] = "" ;	
	$data["chassis"]["lfan"]["mstate"] = "" ;
	$data["chassis"]["lfan"]["ok"] = "" ;
	$data["chassis"]["lfan"]["serial"] = "" ;
	$data["chassis"]["rfan"]["hot"] = "" ;
	$data["chassis"]["rfan"]["warn"] = "" ;	
	$data["chassis"]["rfan"]["mstate"] = "" ;
	$data["chassis"]["rfan"]["ok"] = "" ;
	$data["chassis"]["rfan"]["serial"] = "" ;
	$data["chassis"]["lpem"]["hot"] = "" ;
	$data["chassis"]["lpem"]["warn"] = "" ;	
	$data["chassis"]["lpem"]["mstate"] = "" ;
	$data["chassis"]["lpem"]["ok"] = "" ;
	$data["chassis"]["lpem"]["serial"] = "" ;
	$data["chassis"]["rpem"]["hot"] = "" ;
	$data["chassis"]["rpem"]["warn"] = "" ;	
	$data["chassis"]["rpem"]["mstate"] = "" ;
	$data["chassis"]["rpem"]["ok"] = "" ;
	$data["chassis"]["rpem"]["serial"] = "" ;

	$xmlfile = dataToXML($data);
	//echo "<pre>";
	//echo htmlspecialchars($xmlfile);
	//echo "</pre>";
	
	$filename = 'oac.xml';
	if (!$handle = fopen($filename, 'w')) {
		echo "Cannot open file ($filename)";
		exit;
	}
	if (fwrite($handle, $xmlfile ) === FALSE) {
		echo "Cannot write to file ($filename)";
		exit;
	}
	fclose($handle); 

}

function dataToXML($data) {
		// Display the XML document   ... see http://pear.php.net/manual/en/package.xml.xml-serializer.xml-serializer.examples.php
		//echo '<pre>';
		//echo htmlspecialchars($serializer);
		//echo '</pre>';
	// An array of serializer options <br>  
	$serializer_options = array (  
		'addDecl' => TRUE,  
		'encoding' => 'ISO-8859-1',
		'indent' => '  ', 
		'rootName' => 'zx2000',  
		'defaultTagName' => 'color', 
	);  
	$serializer = new XML_Serializer($serializer_options);   
   // Serialize the data structure   
	$status = $serializer->serialize($data);   
	// Check whether serialization worked   
	if (PEAR::isError($status)) {   
		die($status->getMessage());   
	} 
	return $serializer->getSerializedData();
}



?>
