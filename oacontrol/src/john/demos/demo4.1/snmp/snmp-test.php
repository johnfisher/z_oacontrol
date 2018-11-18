<?PHP


$zre1admin = @snmpget("10.2.0.215", 'public', "ifAdminStatus.11");
$zre1oper = @snmpget("10.2.0.215", 'public', "ifOperStatus.11");
$zre15admin = @snmpget("10.2.0.215", 'public', "ifAdminStatus.15");
$zre15oper = @snmpget("10.2.0.215", 'public', "ifOperStatus.15");

$zre1znyxctl = @snmpget("10.2.0.215", "public" , 'zZX1900FABRICLinkCtrlState.2'); //1.3.6.1.4.1.688.2.3.15.7.1.2.3
$zre0znyxctl = @snmpget("10.2.0.215", "public" , 'zZX1900FABRICLinkCtrlState.1'); //zre0
$zre15znyxctl = @snmpget("10.2.0.215", "public" , 'zZX1900FABRICLinkCtrlState.16'); // zre15

$allports = @snmpwalk("10.2.0.215", "public" , 'zZX1900FABRICLinkCtrlState');

/////////////////////////////////////////
// $allports = @snmpwalk("10.2.0.215", "public" , 'zZX1900FABRICLinkCtrlState');
// produces with print_r:
// Array
// (
//     [0] => INTEGER: down(2)
//     [1] => INTEGER: up(1)
//     [2] => INTEGER: down(2)
//     [3] => INTEGER: down(2)
//     [4] => INTEGER: down(2)
//     [5] => INTEGER: down(2)
//     [6] => INTEGER: down(2)
//     [7] => INTEGER: down(2)
//     [8] => INTEGER: down(2)
//     [9] => INTEGER: down(2)
//     [10] => INTEGER: down(2)
//     [11] => INTEGER: down(2)
//     [12] => INTEGER: down(2)
//     [13] => INTEGER: down(2)
//     [14] => INTEGER: down(2)
//     [15] => INTEGER: down(2)
//     [16] => INTEGER: down(2)
//     [17] => INTEGER: down(2)
//     [18] => INTEGER: down(2)
//     [19] => INTEGER: down(2)
// )

function importMibs () {
    $mib_path = '/usr/share/snmp/mibs';   
    if ( $handle = opendir($mib_path) )   { 
	while ( false !== ($file = readdir($handle))  ){
	    if($file ) 	{     	
		snmp_read_mib( $mib_path . '/' . $file ) ;
	    }
	}
    }
    closedir($handle);
}


function getAllZRELinkState ( $ip,  $znyxPlatform )
{
    //net-snmp: snmpwalk  -v1 -c public 10.2.0.215 zZX1900FABRICLinkCtrlState
    //array snmp2_walk ( string $host , string $community , string $object_id [, string $timeout = 1000000 [, string $retries = 5 ]] )
    // getAllZRELinkState ( "10.2.0.215",  "ZX1900FABRIC") 
importMibs();

    $snmpObject = 'z' . $znyxPlatform . 'LinkCtrlState';
    $snmpdatarray = snmp2_walk( $ip, "public", $snmpObject ) ;
    return $snmpdatarray ;
}

$linkStatus = getAllZRELinkState( "10.2.0.215",  'ZX1900FABRIC') ;

// 1.3.6.1.2.1.2.2.1.8.10 equals ifOperStatus.10
$a = array(1,2,3,4);

print "\n";
echo substr_compare("abcde", "a", 1, 1);
print "\n" ;
 //foreach ($allports as $val) {    
//echo "$val \n"; 
//}
//foreach ($b as $bval) {    echo "$bval\n"; }

print_r ($linkStatus );


print "\n";
// echo "zre1 admin = $zre1admin";
// print "\n";
// 
// echo "zre1 oper = $zre1oper";
// print "\n";
// 
// echo "zre15 admin = $zre15admin";
// print "\n";
// 
// echo "zre15 oper = $zre15oper";
// print "\n";
// 
// echo "zre0znyxctl = $zre0znyxctl";
// print "\n";
// echo "zre1znyxctl = $zre1znyxctl";
// print "\n";
// echo "zre15znyxctl = $zre15znyxctl";
// print "\n";
?>