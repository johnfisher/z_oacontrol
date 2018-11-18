<?PHP
// all the PHP functions  //

$loop_break = false;  // flag to turn off loop
define( 'MIB_PATH', '/usr/share/snmp/mibs'); 
define( 'LOOP_DUR', '5000000' );


function getAllZRELinkState ( $ip,  $znyxPlatform )
{
    //net-snmp: snmpwalk  -v1 -c public 10.2.0.215 zZX1900FABRICLinkCtrlState
    //array snmp2_walk ( string $host , string $community , string $object_id [, string $timeout = 1000000 [, string $retries = 5 ]] )
    // getAllZRELinkState ( "10.2.0.215",  "ZX1900FABRIC")
    $snmpObject = 'z' . $znyxPlatform . 'LinkCtrlState';
    $snmpdatarray = snmp2_walk(  $ip, "public", $snmpObject ) ;
    $cleansnmp = substr_replace($snmpdatarray, '', 0 , 9); // trim from front
    $clean2snmp = substr_replace($cleansnmp, '', -3 , 3) ; //trim from rear 
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


function loopForSNMPData() {
//// this loop is where the comet long-poll happens
    importMibs();
    global $loop_break ;
    while ( $loop_break == false) {
	    $snmp = getAllZRELinkState( "10.2.0.215",  'ZX1900FABRIC') ;
	    $cleansnmp = substr_replace($snmp, '', 0 , 9); // trim from front
	    $clean2snmp = substr_replace($cleansnmp, '', -3 , 3) ; //trim from rear 
	    $json= json_encode( $clean2snmp, JSON_FORCE_OBJECT ); 
	    echo $json;
	    
	    usleep( LOOP_DUR );
	  
    }
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

function slotOccupier($ip){
// get whats in each slots from shmc
// return data: slot# :: empty|7300|sbc
// zero member [0] of array is slot 1 five member [5] is shelfmanager1 which is not a slot, but would be #6
// or should shmc2 be 6 and shmc1 be seven?
    $slotdata = array( 0 => array('','') );
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

    // raw data: 'STRING: "Switch"'
    // raw data: 'INTEGER: M4(4)'
    for ($i = 0; $i <= 4; $i++) {
	if ( preg_match ( "/STRING/" , $snmpdata[$i]  ) ){
	    $slotdata[$i][0]  = substr_replace($snmpdata[$i] , '', 0 , 8); // raw data = STRING: "Switch" or sim.
	}else  {
	    $slotdata[$i][0]  = "empty" ;
	}
	if (  preg_match ( "/INTEGER/" , $mstate[$i] ) ){
	    $slotdata[$i][1]  = substr_replace($mstate[$i] , '', 0 , 9); // raw data = INTEGER: M4(4) or sim.
	}else {
	    $slotdata[$i][1]  = "empty";
	}	
    }
	  //print_r($slotdata);
    return $slotdata ;
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
	 
importMibs();
$slots = slotOccupier("10.2.6.10");
	
$data = array( "slot1" => array(), "slot2" => array(), "slot3" => array(), "slot4" => array(), "slot5" => array(), "shmc" => array(), "chassis" => array() ) ;

switch (  $slots[0][0]  ) {	//slot1
    case '"Switch"':
        $data["slot1"]["name"] = "ZX1900A" ;		//mark type of board in slot3
        $data["slot1"]["M"] = $slots[0][1] ;	//mark M state
        $data["slot1"]["fabric ports"] = getAllZRELinkState( "10.2.0.215",  'ZX1900FABRIC') ; //load up on snmp data
        $data["slot1"]["base ports"] = getAllZRELinkState( "10.2.0.155",  'ZX1900BASE') ; //load up on snmp data
        $data["slot1"]["fabric ext"] =  getExtState( "10.2.0.215",  'ZX1900FABRIC') ; 
        $data["slot1"]["fabric int"] =  getIntState( "10.2.0.215",  'ZX1900FABRIC') ; 
        $data["slot1"]["base ext"] =  getExtState( "10.2.0.155",  'ZX1900BASE') ; 
        $data["slot1"]["base int"] =  getIntState( "10.2.0.155",  'ZX1900BASE') ; 
        break;
     default:				// all other matches get marked empty!
        $data["slot1"]["name"] = $slots[0][0] ;
        $data["slot1"]["M"] = $slots[0][1];	// save M state just in case
        $data["slot1"]["fabric ports"] = "" ; //load up on snmp data
        $data["slot1"]["base ports"] = "" ; //load up on snmp data
        $data["slot1"]["fabric ext"] = "" ; 
        $data["slot1"]["fabric int"] =  "" ; 
        $data["slot1"]["base ext"] =  "" ; 
        $data["slot1"]["base int"] =  "" ; 
}
switch (  $slots[1][0]  ) {	//slot2
    case '"ZX1900B"':
        $data["slot2"]["name"] = "ZX1900B" ;		//mark type of board in slot3
        $data["slot2"]["M"] = $slots[2][1] ;	//mark M state
        $data["slot2"]["data"] = "empty";
        break;
     default:				
        $data["slot2"]["name"] = $slots[1][0] ;
        $data["slot2"]["M"] = $slots[1][1];	// save M state just in case
        $data["slot2"]["data"] = 	"empty" ; 	
}
switch (  $slots[2][0]  ) {	//slot3
    case '"Payload Switch"':
        $data["slot3"]["name"] = "ZX7300" ;		//mark type of board in slot3
        $data["slot3"]["M"] = $slots[2][1] ;	//mark M state
        $data["slot3"]["7300 ports"] = getAllZRELinkState( "10.2.0.249",  'ZX7300') ; //load up on snmp data
        $data["slot3"]["7300 ext"] =  getExtState("10.2.0.249",  'ZX7300') ; 
        $data["slot3"]["7300 int"] =  getIntState( "10.2.0.249",  'ZX7300') ; 
        break;
    case '"MPCBL0030"':
        $data["slot3"]["name"] = "SBC" ;
        $data["slot3"]["M"] = $slots[2][1] ;
        $data["slot3"][2] = getSNMPLinux( "10.2.0.XXX",  'LINUXMIB') ;
        break;
     default:				// all other matches get marked empty!
        $data["slot3"]["name"] = $slots[2][0] ;
        $data["slot3"]["M"] = $slots[2][1];	// save M state just in case
        $data["slot3"][2] = 	"" ; 	
}
switch (  $slots[3][0]  ) {	//slot4
    case '"Payload Switch"':
        $data["slot4"]["name"] = "ZX7300" ;		//mark type of board in slot3
        $data["slot4"]["M"] = $slots[3][1] ;	//mark M state
        $data["slot4"]["7300 ports"] = getAllZRELinkState( "10.2.0.249",  'ZX7300') ; //load up on snmp data
        $data["slot4"]["7300 ext"] =  getExtState("10.2.0.249",  'ZX7300') ; 
        $data["slot4"]["7300 int"] =  getIntState( "10.2.0.249",  'ZX7300') ; 
        break;
    case '"MPCBL0030"':
        $data["slot4"]["name"] = "SBC" ;
        $data["slot4"]["M"] = $slots[3][1] ;
        $data["slot4"][2] = getSNMPLinux( "10.2.0.XXX",  'LINUXMIB') ;
        break;
     default:
        $data["slot4"]["name"] = $slots[3][0]  ;
        $data["slot4"]["M"] = $slots[3][1] ;
        $data["slot4"][2] = 	"" ;
}
switch (  $slots[4][0]  ) {  //slot5
    case '"Payload Switch"':
        $data["slot5"]["name"] = "ZX7300" ;		//mark type of board in slot3
        $data["slot5"]["M"] = $slots[4][1] ;	//mark M state
        $data["slot5"]["7300 ports"] = getAllZRELinkState( "10.2.0.249",  'ZX7300') ; //load up on snmp data
        $data["slot5"]["7300 ext"] =  getExtState("10.2.0.249",  'ZX7300') ; 
        $data["slot5"]["7300 int"] =  getIntState( "10.2.0.249",  'ZX7300') ; 
        break;
    case '"MPCBL0030"':
        $data["slot5"]["name"] = "SBC" ;
        $data["slot5"]["M"] = $slots[4][1] ;
        $data["slot5"][2] = getSNMPLinux( "10.2.0.XXX",  'LINUXMIB') ;
        break;
     default:
        $data["slot5"]["name"] = $slots[4][0]  ;
        $data["slot5"]["M"] = $slots[4][1] ;
        $data["slot5"][2] = 	"";
}

$data["shmc"][0] = getSNMPShMC( "10.2.0.XXX",  'PPS-SENTRY-MIB') ;

$json= json_encode( $data, JSON_FORCE_OBJECT ); 
echo $json;

}

   

?>