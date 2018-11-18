<?PHP
$VERSION = "0.3" ;

//error_reporting(0) ;
error_reporting(E_ALL) ; // Uncomment this to debug PHP code

$cfg = Array('ui_lang'=>"") ; 
$show = NULL ;
// External Files Inclusion /*{{{*/
if (!((file_exists("include/config.php")) AND (file_exists("include/functions.php"))) ) {
	die("ZiPEC can't access required files.<br/>Please check your installation") ;
} else { 
	require("include/config.php") ;
	require("include/functions.php") ;
}
if (!file_exists("include/locale/".$cfg['ui_lang'].".php")) {
	die("ZiPEC can't find the language file ".@$cfg['ui_lang'].".<br/>Please check your configuration.") ;
} else {
	require("include/locale/".$cfg['ui_lang'].".php") ;
}


	
/*}}}*/

// Allow Access from any other web client or allow only iPhones /*{{{*/
	if ((!stristr($_SERVER['HTTP_USER_AGENT'],"iphone")) && ($cfg['restrct'])) {
		echo "Unauthorized."; // You can also redirect to another url by commenting this line and uncommenting the next one
		// header("Location: http://yoururlofchoice.tld/whatever");
		exit;
	}
/*}}}*/

init(); 

// Client device detection  /*{{{*/
// Currently only iPhones, iPod Touches and BlackBerries are supported
// if ((stristr($_SERVER['HTTP_USER_AGENT'],"iphone")) or $cfg['cssforc']) {		// iPhones
// 	$css_file = "iphone.css" ;
// } elseif (stristr($_SERVER['HTTP_USER_AGENT'],"ipod")) {	// iPods (same CSS as iPhones, but this might change in the future)
// 	$css_file = "iphone.css" ;
// } elseif (stristr($_SERVER['HTTP_USER_AGENT'],"blackberry")) { 	// BlackBerries
// 	$css_file = "blackberry.css";
// } else {
// 	$css_file = "blackberry.css";				// Default CSS (HTCs and such)
// }
/*}}}*/
 $css_file = "iphone.css";
if (($cfg['context']["$context"])and($cfg["use_con"])) { 
	$context_clause = $cfg['context']["$context"."_filter"] ; 
} else { 
	$context_clause = "1"; 
}
// Do we have to hide acknowledged events ?
if ($show=='new') {
	$user_filter = "and eventState=0";
}

// Open a SQL Connection to the Events Database	/*{{{*/
	$connect = DB_Connect() ;
	if (!$connect) {
		die($msg[err_db]);
	}
	if (!@mysql_select_db($cfg[db_base])) {
		die($msg[err_tb]) ;
	}
/*}}}*/

// Modify the status of selected event, if any
if (($_GET[action]=="ack")) { //and($evid!="")) {
	if ( $_GET[pstate] == 'noack' ) { $eventState = 0 ; $state = "Acknowledged"; } else { $eventState = 1 ; $state = "New"; } // Ne fonctionne pas
	$evid_filter = "and evid='$_GET[evid]'"; // This clause is used later for refreshing the event div
	$query = "update $cfg[db_tabl] set eventState = NOT eventState, ownerid='".$_GET[login]."' where 1 $evid_filter limit 1";
	$result = mysql_query($query);

	$log_query = "insert into $cfg[db_log] values ('$_GET[evid]','".$_GET[login]."',concat(utc_date(),' ',utc_time()),'Event state changed to $state from ZiPEC')";
	@mysql_query($log_query);
	$mode = "update" ;
}
// Display the configuration page if asked for
if ($mode=="setup") {
	include("include/setup.php");
	exit ;
}

// The Checklist is done, let's fetch the events
	$list = "" ; // This variable is going to contain the event list
	$i = 0 ;
	// Note: You can edit this query to your liking
	$query = "select evid,severity,eventState,prodstate,device,summary,component,trim(leading '|/' from systems) as systems,location,ownerid,count,date_format(from_unixtime(firsttime),'$date_format') as firsttime, date_format(from_unixtime(lasttime),'$date_format') as lasttime, round(unix_timestamp() - firsttime) as `timediff` from $cfg[db_tabl] where $cfg[ev_filt] and $context_clause $user_filter $evid_filter order by $cfg[ev_ordr] ;";
	$result = mysql_query($query);
	while ($event = mysql_fetch_array($result)){
		if ($event['eventState']=="1") { $ack = "acked"; $ro = 'checked'; } else { $ack = "noack"; $ro=''; }
		if ($event['ownerid']) { 
			$event['ownerid'] = ucfirst($event['ownerid']);
			$acknowledgement = "$msg[ackby] $event[ownerid]" ; 
		} else { 
			$acknowledgement = "<b>$msg[noack]</b> ";
		}
		if (!$event[component]) { $event[component] = $msg[undefined] ; }
		$event['systems'] = str_replace("|","",$event['systems']);
		
		$page['content'] .="\n\t\t\t<div id='container-$event[evid]' class='noclass'>
					<div class=\"event zenevents_$event[severity]_$ack $ack\" id='event_id_$i' >
					<div style='display:inline; float:left;margin-right:4px; '><input type='checkbox' onclick=\"localStorage.evid='container-$event[evid]';makeRequest('index.php', '?mode=update&evid=$event[evid]&context=$context&pstate=$ack&action=ack&show='+localStorage.show+'&login='+localStorage.login);\" $ro name='evid[]' style='height:30px; width:30px;'/></div> 
					<div onclick=\"toggle_visibility('$event[evid]');\" >
						<p class='device'>$event[device]</p>
						<p class='info'>$event[firsttime] - $event[systems]</p>
					</div>
						<div class='visibleifpressed hide' id='$event[evid]' >				
					";
					$page['content'] .= "
							<dl>
								<dt>$msg[component]</dt><dd>$event[component]</dd>
								<dt>$msg[message]</dt><dd>$event[summary]</dd>
								<dt></dt><dd>$acknowledgement</dd>
								<dt>$msg[first]</dt><dd>$event[firsttime]</dd>
								<dt>$msg[last]</dt><dd>$event[lasttime]</dd>
								<dt>$msg[diff]</dt><dd>".datediff($event[timediff])."</dd>
								<dt>$msg[count]</dt><dd>$event[count]</dd>
								<dt>$msg[location]</dt><dd>$event[location]</dd>
							</dl>
					";
					$page['content'] .="
						</div>
				</div>\n</div>\n";
		$i++ ;
	}
	// Is there's no entries, a special message is displayed, unless if we're updating a modified event - in this case no output is done
	if ((@mysql_num_rows($result)==0)and($_GET[action]!="ack")) {
		$page['content'] = "<div class='event zenevents_0_acked noalarm'>$msg[no_ev]</div>\n";
		$i=0 ;
	}
// Close the SQL Connection
DB_Close($connect) ;


if ($mode=="update") {
	$page['content'] .= "
<script type='text/javascript' >
update_buttons();
update_count($i);
</script>

";
        echo header('Content-Type: text/html; charset=ISO-8859-15');
        echo $page['content'];
        exit; // 
}



// Toolbar 
//$page['toolbar']  = "<a onclick=\"ajax_loadContent('list','?mode=update&context=$context');\"><img src='skins/$cfg[ui_skin]/img/refresh.png'></a>";
//$page['toolbar'] .= "<a onclick=\"ajax_loadContent('list','?mode=update&context=$context&amp;show=new');\"><img src='skins/$cfg[ui_skin]/img/refresh.png'></a>";


// Toolbar 
$page['toolbar']  = "<a onclick=\"ajax_loadContent('list','?mode=update&context=$context&show='+localStorage.show);\"><img src='skins/$cfg[ui_skin]/img/refresh.png'></a>";
$page['toolbar'] .= "<a onclick=\"document.getElementById('new_button').src='skins/".$cfg['ui_skin']."/img/new_selected.png';document.getElementById('all_button').src='skins/".$cfg['ui_skin']."/img/all.png';localStorage.setItem('show', 'new');ajax_loadContent('list','?mode=update&context=$context&show='+localStorage.show);\"><img src='skins/$cfg[ui_skin]/img/new.png' id='new_button' /></a>";
$page['toolbar'] .= "<a onclick=\"document.getElementById('all_button').src='skins/".$cfg['ui_skin']."/img/all_selected.png';document.getElementById('new_button').src='skins/".$cfg['ui_skin']."/img/new.png';localStorage.setItem('show', '');ajax_loadContent('list','?mode=update&context=$context&show='+localStorage.show);\"><img src='skins/$cfg[ui_skin]/img/all.png' id='all_button' /></a>";

$page['toolbar'] .="<a href=\"http://john:8080/zport/dmd/Dashboard\" >  <img src='skins/$cfg[ui_skin]/img/znyx_icon3.png'></a>";



$page['toolbar']  .= "<a onclick=\"ajax_loadContent('list','?mode=setup&context=$context');document.getElementById('setup').src='skins/$cfg[ui_skin]/img/setup_on.png';\"><img id='setup' src='skins/$cfg[ui_skin]/img/setup.png'></a>";

//$page['toolbar'] .= "<a onclick=\"toggleClass('acked');update_buttons();\"><img id='toggle' src='skins/$cfg[ui_skin]/img/refresh.png' ></a>";

//$page['toolbar'] .= "test";
$page['toolbar']  .= "<span id='result'></span>";



// Status bar
$php_date_format_string = str_replace('%','',$date_format); // $date_format is taken from the language file (include/locale/*)
$php_date_format_string = str_replace(' H:i','',$php_date_format_string); // Comment this if you want current server time in the status bar
$page['status'] = "[".date($php_date_format_string)."] - <span id='count'>$i</span> $msg[event]";

// Output
// Requires 	$page[status] : 	ZiPEC status bar
//		$page[content] : 	Main window (Events list)
//		$page[toolbar] :	Toolbar located at the bottom of the viewport

///////////////////
$page["debug"] .= " test of debyg" ;

//include('include/layout.php');

///////////////// html starts here ////////////////////////////////////////////////////////
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">


<html>
<head>

<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript" src="js/jquery.svg.js"></script>
<script type="text/javascript" src="js/jquery.svganim.js" ></script> 
<script type="text/javascript" src="js/hoverIntent.js"></script>
<script type="text/javascript" src="js/zsuperfish.js"></script>
<script type="text/javascript" src="js/oac.js"></script>



<link rel="stylesheet" media="screen" href="css/oac.css" /> 

 
  



<!-- ///////////////////////////////////////////////////-->
<style type="text/css">
    div.svgbasics { width: 1000px; height: 1050px; float:left }
    div.yourdiv { width: 1000px; height: 200px;}
    div.controls { width:1000px; height:100px; background: red; border: 1px solid #484}
    table.tb { }
    button.bt {  }
    td.notify { width: 400px; height: 60px; background: #F2EAE3 }
div.menuDiv {  
    display:none; 
    position:absolute;  
    top:150px;  
    left:50%;  
    margin-left:35px;  
    width:200px;  
}  


</style>

<script>


<!-- ///////////////////////////////////////////////////-->
xmlns="http://www.w3.org/2000/svg"

var black = "rgb(0, 0, 0)";
var blue =  "#0000ff";
var green = "#00ff00";
var red = "#ff0000";
var amber =  "#FCB83B" ;
var dkglow = "#3B2507" ;
var ltglow = "#FCB83B" ;
var hotorange = "#F0730E" ;  // use for over-temp animation
//var coolorange= "#975118";
var coolorange= "#623815";
var dknotify = "#B18D75";
var ltnotify = "#F2DAC9";
var idlenotify = "#F2EAE3";
var ltgrey = "#E0E0E0";


var last_menu ;
var pulseflag = "on";
// prepare the dom and then load the svg
$(document).ready(function(){
    main();  

});
    




function main(){





////////////// END  MAIN  ///////////////////////////////
}


///////////////////////////////////////////////////////////
</script></head><body>



<div id="debug">Debug:<?PHP   echo $page['content'] ;?>

</body></html>

<!--//////////////////////////////////// end of file /////////////////////////////////-->
