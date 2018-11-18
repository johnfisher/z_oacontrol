<?PHP

require("../lib/functions.php") ;
require("../lib/config.php") ;
require("../lib/".$cfg['ui_lang'].".php") ;


// Open a SQL Connection to the Events Database	/*{{{*/
	$connect = DB_Connect() ;
	if (!$connect) {
		die($msg[err_db]);
	}
	if (!@mysql_select_db($cfg[db_base])) {
		die($msg[err_tb]) ;
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


///////////////// html starts here ////////////////////////////////////////////////////////
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">


<html>
<head>

<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript" src="js/jquery.svg.js"></script>
<script type="text/javascript" src="js/jquery.svganim.js" ></script> 
<script type="text/javascript" src="js/hoverIntent.js"></script>
<script type="text/javascript" src="js/zsuperfish.js"></script>
<script type="text/javascript" src="js/oac.js"></script>
<!-- <script type="text/javascript" src="js/jquery.svgdom.js	"></script> -->
<script type="text/javascript" src="js/jqueryui/jquery-ui-1.8.14.custom/js/jquery-ui-1.8.14.custom.min.js"></script>

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

///////////////////////////////////////////////
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
    getsvg();  

});
    
// laod the svg
function getsvg(){

      $("#svgload").svg({  
            loadURL: 'zx1900_master_exploded.svg',  
            onLoad: main,  
            settings: {}  
          } );

}



function main(){



    // superfish menu initialise plugins
    jQuery(function(){
	    jQuery('ul.sf-menu').superfish();
    });

     //////  logDebug("test debug");
// hide the 7300's and sbc's ///////////////////////////
    $('#7300-3group').css("opacity", 0 );
    $('#7300-4group').css("opacity", 0 );
    $('#7300-5group').css("opacity", 0 );
    $('#sbc-3group').css("opacity", 0 );
    $('#sbc-4group').css("opacity", 0 );
    $('#sbc-5group').css("opacity", 0 );

// mouseover functions: typ.//////////////////////////////////////////////////////////////////////////
// WHY DONT WE USE MOUSEOUT? because the hover or mouseout conflicts with the one in superfish menu
$('#7300-3group').mouseover(function(){
      invisbleMenus(last_menu);		// make the last menu invisible
      last_menu = '#menuDiv73003' ;	// reset the last_menu var to this menu
      visbleMenus(last_menu);		// make this menu visible
      $("#menuDiv73003").animate({top:600,left:80},{duration:100,queue:false});
      $("#menuDiv73003").fadeIn( 400);
    });
$('#7300-4group').mouseover(function(){
      invisbleMenus(last_menu);
      last_menu = '#menuDiv73004' ;
      visbleMenus(last_menu);
      $("#menuDiv73004").animate({top:540,left:80},{duration:100,queue:false});
      $("#menuDiv73004").fadeIn( 400);
    });
$('#7300-5group').mouseover(function(){
      invisbleMenus(last_menu);
      last_menu = '#menuDiv73005' ;
      visbleMenus(last_menu);
      $("#menuDiv73005").animate({top:480,left:80},{duration:100,queue:false});
      $("#menuDiv73005").fadeIn( 400);
    });
$('#sbc-3group').mouseover(function(){
      invisbleMenus(last_menu);
      last_menu = '#menuDivSbc3' ;
      visbleMenus(last_menu);
      $("#menuDivSbc3").animate({top:600,left:80},{duration:100,queue:false});
      $("#menuDivSbc3").fadeIn( 400);
    });
$('#sbc-4group').mouseover(function(){
      invisbleMenus(last_menu);
      last_menu = '#menuDivSbc4' 
      visbleMenus(last_menu);
      $("#menuDivSbc4").animate({top:540,left:80},{duration:100,queue:false});
      $("#menuDivSbc4").fadeIn( 400);
    });
$('#sbc-5group').mouseover(function(){
      invisbleMenus(last_menu);
      last_menu = '#menuDivSbc5' ;
      visbleMenus(last_menu);
      $("#menuDivSbc5").animate({top:480,left:80},{duration:100,queue:false});
      $("#menuDivSbc5").fadeIn( 400);
    });
$('#1900agroup').mouseover(function(){
      invisbleMenus(last_menu);
      last_menu = '#menuDiv1900a' ;
      visbleMenus(last_menu);
      $("#menuDiv1900a").animate({top:728,left:80},{duration:100,queue:false});
      $("#menuDiv1900a").fadeIn( 400);
    });
$('#1900bgroup').mouseover(function(){
      invisbleMenus(last_menu);
      last_menu = '#menuDiv1900b' ;
      visbleMenus(last_menu);
      $("#menuDiv1900b").animate({top:663,left:100},{duration:100,queue:false});
      $("#menuDiv1900b").fadeIn( 400);
    });
$('#shmc-1group').mouseover(function(){
      invisbleMenus(last_menu);
      last_menu = '#menuDivShMc1' ;
      visbleMenus(last_menu);
      $("#menuDivShMc1").animate({top:390,left:350},{duration:100,queue:false});
      $("#menuDivShMc1").fadeIn( 400);
    });
// mousover empty and chassis functions clear the visible menus
// because we can;t use mouseout; dont do anything else
$('#empty-3').mouseover(function(){
//alert("empty3");
      invisbleMenus(last_menu);		// make the last menu invisible
      last_menu = '';			// reset last menu to ''
    });
$('#empty-4').mouseover(function(){
//alert("empty3");
      invisbleMenus(last_menu);
      last_menu = '';
    });
$('#empty-5').mouseover(function(){
//alert("empty3");
      invisbleMenus(last_menu);
      last_menu = '';
    });
$('#chassisgroup').mouseover(function(){
//alert("chassis");
      invisbleMenus(last_menu);
      last_menu = '';
    });

////////////// END  MAIN  ///////////////////////////////
}


///////////////////////////////////////////////////////////
</script></head><body>
<h3 >OAC Demo 3: temperature alarms; floating menus; new layout; new colors.</h3>

<!-- START invisble divs for drop-down menus until raised by mouseover -->
<div id="menuDiv73003" class ="menuDiv">
<ul class="sf-menu">    <li>
				<a href="#a">ZX7300-Slot 3 <img src="images/arrows-orange-down.png"/></a>
				<ul>
				    <li> 
					    <a href="#aa">Configure</a>
				    </li>
				    <li>
					    <a href="#ab">Do this <img src="images/arrows-orange-right.png"/></a>
					    <ul>
						    <li><a href="#">Do That</a></li>
						    <li><a href="#aba">Do Other</a></li>
					    </ul>
				    </li>
				    <li> 
					    <a href="#aa">Events</a>
				    </li>
				    <li> 
					    <a href="#aa">Reports</a>
				    </li>
				</ul>
			</li>

		</ul>
<br></div>
<div id="menuDiv73004" class ="menuDiv">
<ul class="sf-menu">    <li>
				<a href="#a">ZX7300-Slot 4 <img src="images/arrows-orange-down.png"/></a>
				<ul>
				    <li> 
					    <a href="#aa">Configure</a>
				    </li>
				    <li>
					    <a href="#ab">menu items <img src="images/arrows-orange-right.png"/></a>
					    <ul>
						    <li><a href="#">menu item</a></li>
						    <li><a href="#aba">menu itemA1.1</a></li>
					    </ul>
				    </li>
				    <li> 
					    <a href="#aa">Events</a>
				    </li>
				    <li> 
					    <a href="#aa">Reports</a>
				    </li>
				</ul>
			</li>

		</ul>
<br></div>
<div id="menuDiv73005" class ="menuDiv">
<ul class="sf-menu">    <li>
				<a href="#a">ZX7300-Slot 5 <img src="images/arrows-orange-down.png"/></a>
				<ul>
				    <li> 
					    <a href="#aa">Configure</a>
				    </li>
				    <li>
					    <a href="#ab">menu items <img src="images/arrows-orange-right.png"/></a>
					    <ul>
						    <li><a href="#">menu item</a></li>
						    <li><a href="#aba">menu itemA1.1</a></li>
					    </ul>
				    </li>
				    <li> 
					    <a href="#aa">Events</a>
				    </li>
				    <li> 
					    <a href="#aa">Reports</a>
				    </li>
				</ul>
			</li>

		</ul>
<br></div>
<div id="menuDivSbc3" class ="menuDiv">
<ul class="sf-menu">    <li>
				<a href="#a">SBC-Slot 3 <img src="images/arrows-orange-down.png"/></a>
				<ul>
				    <li> 
					    <a href="#aa">Configure</a>
				    </li>
				    <li>
					    <a href="#ab">menu items <img src="images/arrows-orange-right.png"/></a>
					    <ul>
						    <li><a href="#">menu item</a></li>
						    <li><a href="#aba">menu itemA1.1</a></li>
					    </ul>
				    </li>
				    <li> 
					    <a href="#aa">Events</a>
				    </li>
				    <li> 
					    <a href="#aa">Report</a>
				    </li>
				</ul>
			</li>

		</ul>
<br></div>
<div id="menuDivSbc4" class ="menuDiv">
<ul class="sf-menu">    <li>
				<a href="#a">SBC-Slot 4 <img src="images/arrows-orange-down.png"/></a>
				<ul>
				    <li> 
					    <a href="#aa">Configure</a>
				    </li>
				    <li>
					    <a href="#ab">menu items <img src="images/arrows-orange-right.png"/></a>
					    <ul>
						    <li><a href="#">menu item</a></li>
						    <li><a href="#aba">menu itemA1.1</a></li>
					    </ul>
				    </li>
				    <li> 
					    <a href="#aa">Events</a>
				    </li>
				    <li> 
					    <a href="#aa">Report</a>
				    </li>
				</ul>
			</li>

		</ul>
<br></div>
<div id="menuDivSbc5" class ="menuDiv">
<ul class="sf-menu">    <li>
				<a href="#a">SBC-Slot 5 <img src="images/arrows-orange-down.png"/></a>
				<ul>
				    <li> 
					    <a href="#aa">menu item that is quite long</a>
				    </li>
				    <li>
					    <a href="#ab">menu items <img src="images/arrows-orange-right.png"/></a>
					    <ul>
						    <li><a href="#">menu item</a></li>
						    <li><a href="#aba">menu itemA1.1</a></li>
					    </ul>
				    </li>
				    <li> 
					    <a href="#aa">Events</a>
				    </li>
				    <li> 
					    <a href="#aa">Report</a>
				    </li>
				</ul>
			</li>

		</ul>
<br></div>
<div id="menuDivShMc1" class ="menuDiv">
<ul class="sf-menu">    <li>
				<a href="#a">Shelf Manager 1 <img src="images/arrows-orange-down.png"/></a>
				<ul>
				    <li> 
					    <a href="#aa">CLIA Interface</a>
				    </li>
				    <li>
					    <a href="#ab">menu items <img src="images/arrows-orange-right.png"/></a>
					    <ul>
						    <li><a href="#">menu item</a></li>
						    <li><a href="#aba">menu itemA1.1</a></li>
					    </ul>
				    </li>
				</ul>
			</li>

		</ul>
<br></div>
<div id="menuDiv1900a" class ="menuDiv">
<ul class="sf-menu">    <li>
				<a href="#a">ZX1900A Switch <img src="images/arrows-orange-down.png"/></a>
				<ul>
				    <li> 
					    <a href="#aa">Telnet</a>
				    </li>
				    <li> 
					    <a href="#aa">Events</a>
				    </li>
				    <li> 
					    <a href="#aa">Reports</a>
				    </li>
				    <li>
					    <a href="#ab">menu items <img src="images/arrows-orange-right.png"/></a>
					    <ul>
						    <li><a href="#">menu item</a></li>
						    <li><a href="#aba">menu itemA1.1</a></li>
					    </ul>
				    </li>
				</ul>
			</li>

		</ul>
<br></div>
<div id="menuDiv1900b" class ="menuDiv">
<ul class="sf-menu">    <li>
				<a href="#a">ZX1900B FTM <img src="images/arrows-orange-down.png"/></a>
				<ul>
				    <li> 
					    <a href="#aa">Configure</a>
				    </li>
				    <li>
					    <a href="#ab">Do This <img src="images/arrows-orange-right.png"/></a>
					    <ul>
						    <li><a href="#">menu item</a></li>
						    <li><a href="#aba">menu itemA1.1</a></li>
					    </ul>
				    </li>
				    <li> 
					    <a href="#aa">Events</a>
				    </li>
				    <li> 
					    <a href="#aa">Reports</a>
				    </li>
				</ul>
			</li>

		</ul>
<br></div>
<!-- END invisble divs for drop-down menus until raised by mouseover -->
<div id="svgload" class="svgbasics">

<table class="tb">
<tr><th colspan=4 >Press buttons to configure the chassis with boards:</th></tr>
<tr><td>slot 5</td><td><button class="bt" onClick='popSlot5_ZX7300()' >ZX7300</button></td><td><button class="bt" onClick='popSlot5_Sbc()' >SBC</button></td><td><button class="bt" onClick='popSlot5_Empty()' >empty</button></td>
<td id="slot5notify" class="notify"></td><td></td><td></td></tr>
<tr><td>slot 4</td><td><button class="bt" onClick='popSlot4_ZX7300()' >ZX7300</button></td><td><button class="bt" onClick='popSlot4_Sbc()' >SBC</button></td><td><button class="bt" onClick='popSlot4_Empty()' >empty</td>
<td id="slot4notify" class="notify"></td><td></td><td></td></tr>
<tr><td>slot 3</td><td><button class="bt" onClick='popSlot3_ZX7300()' >ZX7300</button></td><td><button class="bt" onClick='popSlot3_Sbc()' >SBC</button></td><td><button class="bt" onClick='popSlot3_Empty()' >empty</button></td>
<td id="slot3notify" class="notify"></td><td></td><td></td></tr>
<tr><td>Demo alarms</td><td colspan=2><button class="bt" onClick='overTempAnim();' >Temperature Alarms</button></td><td></td>
<td id="tempnotify" class="notify"></td><td></td><td></td></tr>
</table>
<br>

<!------------------------ SVG loads here --------------------->
</div>

<div id="debug"><?PHP echo $page["content"]?>

</body></html>

//////////////////////////////////// end of file /////////////////////////////////
?>