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
function writeSNMP(){
/*
      valid json   http://jsonlint.com/
		// { key : value, key : value}
		// { value , value }
      data from snmp:
      (
	  [0] => INTEGER: down(2)
	  [1] => INTEGER: up(1)
	  [2] => INTEGER: down(2)

      trimmed result:
	  [0] => down
	  [1] => up
	  [2] => down

*/
	 
importMibs();
//     $snmp = getAllZRELinkState( "10.2.0.215",  'ZX1900FABRIC');
//     $cleansnmp = substr_replace($snmp, '', 0 , 9); // trim from front
//     $clean2snmp = substr_replace($cleansnmp, '', -3 , 3) ; //trim from rear 
//     $json= json_encode( $clean2snmp, JSON_FORCE_OBJECT ); 
//     echo $json;
$data = array( "ZX1900A" => array(), "ZX1900B" => array(), "slot3" => array(), "slot4" => array(), "slot5" => array(), "shmc" => array(), "chassis" => array() ) ;

$data["ZX1900A"][0] = getAllZRELinkState( "10.2.0.215",  'ZX1900FABRIC') ;
$data["ZX1900B"][0] = getAllZRELinkState( "10.2.0.155",  'ZX1900BASE') ;
$data["ZX1900B"]["ext"] =  getExtState ( "10.2.0.155",  'ZX1900BASE') ;
$data["ZX1900B"]["int"] =  getIntState ( "10.2.0.155",  'ZX1900BASE') ;
$data["ZX1900A"]["ext"] =  getExtState ( "10.2.0.215",  'ZX1900FABRIC') ;
$data["ZX1900A"]["int"] =  getIntState ( "10.2.0.215",  'ZX1900FABRIC') ;
$json= json_encode( $data, JSON_FORCE_OBJECT ); 
echo $json;

}

   

?>