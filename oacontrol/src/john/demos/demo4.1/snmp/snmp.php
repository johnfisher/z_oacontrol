<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">


<html>
<head>

<script>
<?PHP
$count = 0 ;
 $maxCount = 10;
$ipfabswitch= '10.2.0.215' ;

/////////////////////////
//   S50layer2 stop = amber for  0..19
//   S50layer2 start + zlc up = green if cabled
//   S50layer2 start + zlc up = blank if cable not inserted
//   S50layer2 stop + zlc up = all amber
//	S50 start + link down = amber ; ifoper=up ifadmin=up
//     zlc down, ifconfig down, no zhp = amber = admin=down oper=down
//     zlc up, ifconfig down, no zhp = amber = admin=down oper=down
//     zlc down, ifconfig up zre, no zhp = amber = admin=up oper=down
//     zlc up, ifconfig up, no zhp = green = admin=up oper=up
//     zlc down, ifconfig down, yes zhp = amber = admin=down oper=down   ( "yes zhp" means the tested zre is in a zhp which is ifconfig up)
//     zlc up, ifconfig down, yes zhp = green = admin=down oper=down
//     zlc down, ifconfig up, yes zhp = amber = admin=up oper=down
//     zlc up, ifconfig up, yes zhp = green = admin=up oper=up
// 
//     amber = admin=down oper=down | admin=up oper=down | admin=up oper=up cable pulled
//     green = admin=up oper=up | admin=down oper=down
// 
//     zlc down, ifconfig down, no zhp = amber = zZX1900FABRICLinkCtrlState.3 =2
//     zlc up, ifconfig down, no zhp = amber = zZX1900FABRICLinkCtrlState.3 =2
//     zlc down, ifconfig up zre, no zhp = amber = zZX1900FABRICLinkCtrlState.3 =2
//     zlc up, ifconfig up, no zhp = green = zZX1900FABRICLinkCtrlState.3 =1
//     zlc down, ifconfig down, yes zhp = amber = zZX1900FABRICLinkCtrlState.3 =2  ( "yes zhp" means the tested zre is in a zhp which is ifconfig up)
//     zlc up, ifconfig down, yes zhp = green = zZX1900FABRICLinkCtrlState.3 =1
//     zlc down, ifconfig up, yes zhp = amber = zZX1900FABRICLinkCtrlState.3 =2
//     zlc up, ifconfig up, yes zhp = green = zZX1900FABRICLinkCtrlState.3 =1
//     zlc up, ifconfig up, yes zhp = green = zZX1900FABRICLinkCtrlState.3 =2 cable pulled!


//// string snmp2_get ( string $host , string $community , string $object_id [, string $timeout = 1000000 [, string $retries = 5 ]] ) ////



function getZRELinkState ( $ip, $community, $snmpObject,  $index)
{
    // "10.2.0.215", "public" , 'zZX1900FABRICLinkCtrlState' , '16' // zre15
    $thisoid =  $snmpObject .'.' .  $index ; 
    $snmpdata = @snmpget($ip, $community,  $thisoid);
    if ( $snmpdata == 'INTEGER: down(2)') {
	return "down" ;
    }elseif ( $snmpdata == 'INTEGER: up(1)') {
	return "up" ;
    }else {
	return "bad snmp state:  $snmpdata" ;
    }
}

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

?>
///////////////////////////////////////////////
xmlns="http://www.w3.org/2000/svg"


// prepare the dom and then load the svg
$(document).ready(function(){
    main();  

});
   

function main(){

return " main return";
////////////// END  MAIN  ///////////////////////////////
}


////////////// HTML BEGINS /////////////////////////////


</script>

</head><body>
<h3 >OAC Demo snmp:</h3>


<div id="svgdiv">
<!------------------------ SVG loads here --------------------->
</div>

<div id="debug"> OUTPUT: <br>
link status = <?PHP print_r ( $linkStatus) ; ?><br>
<br>


</body></html>


