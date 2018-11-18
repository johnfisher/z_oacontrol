/* Zmyx Networks OAControl
    */
xmlns="http://www.w3.org/2000/svg";
     
var black = "rgb(0, 0, 0)";
var blue =  "rgb(0, 0, 255)"; // BUG: #0000ff does not work in a === test!!!
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
//   ZX1900 UG: The zled application understand the colors, off, green, amber, red, blink_green, blink_amber, blink_red and, the
// special color, speed_activity. The speed_activity color provides a secondary lookup, that instructs the hardware
// to base the color off of the LED on the current link speed and activity state. 

// create the blink object. We don't know any leds yet, so just pass ob.proto
// it may not matter here, but the books aren't sanguine about new() or var x = {};
var blinklist = Object.create( {"led1-l" :  {color : blue	, blink : true, shape : "rect" } } );
var idarray = [];
var stop_short_interval = false ; // used for flag to stop blinking
var blink_duration = 600 ; // blink loop interval
var snmp_loop_duration = 5000 ; // loop for snmpgets

/// set up the initial web page  ////////////////////////////////////
function setupPage(){

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
	  if ( $('#7300-3group').css("opacity") > 0) {
	      floatMenu('#menuDiv73003','#7300-3group', 395, 80);
	  }
	});
    $('#7300-4group').mouseover(function(){
	    if ( $('#7300-4group').css("opacity") > 0) {
	      floatMenu('#menuDiv73004','#7300-4group', 335, 80);
	  }
	});
    $('#7300-5group').mouseover(function(){
	  if ( $('#7300-5group').css("opacity") > 0) {
	      floatMenu('#menuDiv73005','#7300-5group', 275, 80);
	  }  
	});
    $('#sbc-3group').mouseover(function(){
	  if ( $('#sbc-3group').css("opacity") > 0) {
	      floatMenu('#menuDivSbc3','#sbc-3group', 395, 80);
	  }  
	});
    $('#sbc-4group').mouseover(function(){
	if ( $('#sbc-4group').css("opacity") > 0) {
	      floatMenu('#menuDivSbc4','#sbc-4group', 335, 80);
	  }  
	});
    $('#sbc-5group').mouseover(function(){
	if ( $('#sbc-5group').css("opacity") > 0) {
	      floatMenu('#menuDivSbc5','#sbc-5group', 275, 80);
	  }  
	});
    $('#1900Agroup').mouseover(function(){
	      floatMenu('#menuDiv1900a','#1900Agroup', 515, 80);
	});
    $('#1900Bgroup').mouseover(function(){
	      floatMenu('#menuDiv1900b','#1900Bgroup', 455, 80);
	});
    $('#shmc-1group').mouseover(function(){
	      floatMenu('#menuDivShMc1','#shmc-1group', 195, 350);
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
}
////////////// END  setup  ///////////////////////////////


function loop_GetSNMP(){
    loop_control = window.setInterval(function() {
	$.get("backend.php",  function(data){
	    var json_data = $.parseJSON(data);
	    process_1900FabricData(json_data);
	    process_1900BaseData(json_data);
	    process_7300Data(json_data);
	    processSlotData(json_data);
	      } );
   }, snmp_loop_duration );

}


function set_AllLEDs(color){
  // sets all SVG leds to color
    var tags=document.getElementsByTagName("rect");  // note limited to "rect" for now
    for(var x=0;x<tags.length;x++){
	var myid = tags[x].id;
	if( myid.match("led") && !myid.match("power") && !myid.match("hot")){
	     $("#" + myid).css("fill", color) ;
	}
    }
}

function blinkLED(){
    var blink_loop = window.setInterval(function() {
	for( var name in blinklist){
	    if ( blinklist[ name ].blink === true ){
		var date = new Date();
		var time = date.getTime() ;  // getTime translates to total milliseconds
		var delay = time - blinklist[ name ].timestamp ;
		// we need to add some randomized number of ms to the timestamps
		// to prevent a pulsing effect as all LEDs blink together
		var newtime =  time += getRandomInteger( 100  , blink_duration   );
		var col = blinklist[ name ].color ;

		if ( delay > blink_duration ) {
		      if ( name.match("led") ) {
			    if ( $("#" + name).css("fill") === black ) {
				$("#" + name).css("fill", col );
			    }else{
				$("#" + name).css("fill", black );
			    }
			    blinklist[ name ].timestamp  = newtime ;
		      } else if ( name.match("glow")) {
			var test = $("#" + name).css("stroke") ;
			    if ( $("#" + name).css("stroke") === blue ) {
				$("#" + name).css("stroke", col );
			    }else{
				$("#" + name).css("stroke", blue );
			    }
			    blinklist[ name ].timestamp  = newtime ;			
		      }
		}
	     }
	    // for future use as a second way to stop the loop
	    if (stop_short_interval === true) {
		clearInterval(short_interval);
	    }
	}
    }, blink_duration ); 
}

function getOrigLEDState(){
// note: this populates the blinklist object
// captures original color of leds too except "power" which has a gradiant
    var rtags=document.getElementsByTagName("rect");  // note limited to "rect" for now
    for(var x=0;x<rtags.length;x++){
	var myid = rtags[x].id;
	var date = new Date();
	var addmin = Math.round( blink_duration/3 );
	var newtime = date.getTime() + getRandomInteger( addmin  , blink_duration );
	if( myid.match("led")  && !myid.match("power")){
	    // set all LEDs to not blink by default
	    blinklist[ myid ] = { blink : false, color : $("#" + myid).css("fill"), shape : "rect", timestamp : newtime	 } ;
	}else if ( myid.match("glow") && !myid.match("power") ){
	    // set all glows to not blink by default // "glows" are rect with no fill used for alarms
	    blinklist[ myid ] = { blink : false, color : $("#" + myid).css("stroke"), shape : "rect", timestamp : newtime	 } ;
//alert("myid " + myid);
	}
	switch(myid) {  // set special LEDs where we have no snmp data
	    case "ledAfclk":
	      blinklist[ myid ].blink = true ;
	      break;
	    case "ledAbclk":
	       blinklist[ myid ].blink = true ;
	      break;
	    case "ledAfok":
	      $("#" + myid).css("fill", green) ;//placeholder until we can get this status
	      break;
	    case "ledAbok":
	      $("#" + myid).css("fill", green)  ;//placeholder until we can get this status
	      break;	      
	    case "ledAfe1":
	      $("#" + myid).css("fill", black);  //placeholder until we can get this status
	      break;
	    case "ledAbe1":
	      $("#" + myid).css("fill", black);   //placeholder until we can get this status
	      break;	   
	    case "ledAsys":
	      $("#" + myid).css("fill", green);   //placeholder until we can get this status
	      break;	
	    case "ledAhealthy":
	      $("#" + myid).css("fill", green);   //placeholder until we can get this status
	      break;	
	    case "ledAsvc":
	      $("#" + myid).css("fill", green);   //placeholder until we can get this status
	      break;
	    case "led7300-3-clk":
	      blinklist[ myid ].blink = true ;
	      break;
	    case "led7300-4-clk":
	      blinklist[ myid ].blink = true ;
	      break;
	    case "led7300-5-clk":
	      blinklist[ myid ].blink = true ;
	      break;
	    default:
	      break;
	  }
    }
    // circles so not picked up by "rect" above
    var ctags=document.getElementsByTagName("circle");  // note limited to "rect" for now
    for(var x=0;x<ctags.length;x++){
	var myid = ctags[x].id;
	var date = new Date();
	var addmin = Math.round( blink_duration/3 );
	var newtime = date.getTime() + getRandomInteger( addmin  , blink_duration );
	if( myid.match("led")  && !myid.match("power")){
	    // set all LEDs to not blink by default
	    blinklist[ myid ] = { blink : false, color : $("#" + myid).css("fill"), shape : "circle", timestamp : newtime	 } ;
	}else if ( myid.match("glow") && !myid.match("power") ){
	    // set all glows to not blink by default // "glows" are rect with no fill used for alarms
	    blinklist[ myid ] = { blink : false, color : $("#" + myid).css("stroke"), shape : "circle", timestamp : newtime	 } ;
//alert("myid " + myid);
	}
	switch(myid) {  // set special LEDs where we have no snmp data
	    case "led7300-3-clk":
	      blinklist[ myid ].blink = true ;
	      break;
	    case "led7300-4-clk":
	      blinklist[ myid ].blink = true ;
	      break;
	    case "led7300-5-clk":
	      blinklist[ myid ].blink = true ;
	      break;
	    default:
	      break;
	  }
    }
}



function process_1900FabricData(json){
// taking in json data from snmpget done by backend php via ajax

    for (var zre in json["slot1"]["fabric ports"] ) {
	    //logDebug(zre) ;
	    if ( json["slot1"]["fabric ports"][zre] == "down" ) {
		$("#ledAf" + zre ).css("fill", amber );
		//logDebug("down: #ledAf" + zre );
	    }else if ( json["slot1"]["fabric ports"][zre] == "up" ) {
		$("#ledAf" + zre ).css("fill", green );
				//logDebug("up: #ledAf" + zre );
	    }else {
		$("#ledAf" + zre ).css("fill", black ); //some unknown state
				//logDebug("unkniown: #ledAf" + zre );
	    }
    }
    if ( json["slot1"]["fabric ext"] == "on" ) {
	$("#ledAfext").css("fill", red );      
    }else if ( json["slot1"]["fabric ext"] == "off" ) {
	$("#ledAfext").css("fill", black );       
    }else {
	$("#ledAfext").css("fill", blue ); //some unknown state     
    }
    if ( json["slot1"]["fabric int"] == "on" ) {
	$("#ledAfint").css("fill", red );      
    }else if ( json["slot1"]["fabric int"] == "off" ) {
	$("#ledAfint").css("fill", black );       
    }else {
	$("#ledAfint").css("fill", blue ); //some unknown state     
    }
}

function process_1900BaseData(json){
// taking in json data from snmpget done by backend php via ajax

    for (var zre in json["slot1"]["base ports"] ) {
	    //logDebug(zre) ;
	    if ( json["slot1"]["base ports"][zre] == "down" ) {
		$("#ledAb" + zre ).css("fill", amber );
	    }else if ( json["slot1"]["base ports"][zre] == "up" ) {
		$("#ledAb" + zre ).css("fill", green );
	    }else {
		$("#ledAb" + zre ).css("fill", black ); //some unknown state
	    }
    }
    if ( json["slot1"]["base ext"] == "on" ) {
	$("#ledAbext").css("fill", red );      
    }else if ( json["slot1"]["base ext"] == "off" ) {
	$("#ledAbext").css("fill", black );       
    }else {
	$("#ledAbext").css("fill", blue ); //some unknown state     
    }
    if ( json["slot1"]["base int"] == "on" ) {
	$("#ledAbint").css("fill", red );      
    }else if ( json["slot1"]["base int"] == "off" ) {
	$("#ledAbint").css("fill", black );       
    }else {
	$("#ledAbint").css("fill", ltgrey ); //some unknown state     
    }
}


function process_7300Data(json){
// taking in json data from snmpget done by backend php via ajax

    for ( var item in json ) {
	if ( json[ item ][ "name" ] == "ZX7300") {
	      for (var zre in json[ item ]["7300 ports"] ) {
		  var slotnum = item.replace("slot", ''); 
			      //logDebug("item " + item + "   slotnum " + slotnum) ;
			if ( zre >= 26 ) {  // ports 26 and 27 behave just like an led on the 1900A
			    if ( json["slot" + slotnum]["7300 ports"][zre] == "down" ) {
				$("#led7300-" + slotnum + "-" + zre ).css("fill", amber );
			    }else if ( json["slot" + slotnum]["7300 ports"][zre] == "up" ) {
				$("#led7300-" + slotnum + "-" + zre ).css("fill", green );
			    }else {
				$("#led7300-" + slotnum + "-" + zre ).css("fill", black ); //some unknown state
			    }
			} else {  // RJ45 link lights
			    if ( json["slot" + slotnum]["7300 ports"][zre] == "down" ) {
				$("#led7300-" + slotnum + "-" + zre + "l" ).css("fill", black );
				$("#led7300-" + slotnum + "-" + zre + "r" ).css("fill", black );
			    }else if ( json["slot" + slotnum]["7300 ports"][zre] == "up" ) {
				$("#led7300-" + slotnum + "-" + zre + "l" ).css("fill", green );
				$("#led7300-" + slotnum + "-" + zre + "r" ).css("fill", green );
			    }else {
				$("#led7300-" + slotnum + "-" + zre + "l" ).css("fill", red );	// some unknown state
				$("#led7300-" + slotnum + "-" + zre + "r" ).css("fill", red );
			    }
			}
		}
		if ( json["slot" + slotnum]["7300 ext"] == "on" ) {
		    $("#led7300-" + slotnum + "-ext").css("fill", red );      
		}else if ( json["slot" + slotnum]["7300 ext"] == "off" ) {
		    $("#led7300-" + slotnum + "-ext").css("fill", black );       
		}else {
		    $("#led7300-" + slotnum + "-ext").css("fill", blue ); //some unknown state     
		}
		if ( json["slot" + slotnum]["7300 int"] == "on" ) {
		    $("#led7300-" + slotnum + "-int").css("fill", red );      
		}else if ( json["slot" + slotnum]["7300 int"] == "off" ) {
		    $("#led7300-" + slotnum + "-int").css("fill", black );       
		}else {
		    $("#led7300-" + slotnum + "-int").css("fill", ltgrey ); //some unknown state     
		} 
	  
	}
    }
}


function processSlotData(json){
 // take in json SNMP for slots 3,4,5
 //  just to see whats registered in the slot by the shmc
 // the board may actually be gone, or in an intermediate state
 // first display correct board by slot
 
    if ( json["slot1"]["name"] === "ZX1900A"){
	setBoardState( json["slot1"]["M"], "1900A", 1 );	
    }else if ( json["slot1"]["name"] === 'N/A' ) {
	// means we are physically in ejector open state but already passed to M1
	setBoardEjectState( 1 ); 
    } else{
	//later//
    }
    if ( json["slot2"]["name"] === "ZX1900B"){
	setBoardState( json["slot2"]["M"], "1900B", 2 );	
    }else if ( json["slot2"]["name"] === 'N/A' ) {
	// means we are physically in ejector open state but already passed to M1
	setBoardEjectState( 2 ); 
    } else{
	//later
    } 
    if ( json["slot3"]["name"] === "ZX7300"){
	popSlot3_ZX7300();
	setBoardState( json["slot3"]["M"], "7300", 3 );	
    }else if ( json["slot3"]["name"] === "SBC" ) {
	popSlot3_Sbc();
	setBoardState( json["slot3"]["M"], "sbc", 3 ); //note case
    }else if ( json["slot3"]["name"] === 'N/A' ) {
	// means we are physically in ejector open state but already passed to M1
	setBoardEjectState( 3 ); 
    } else{
	popSlot3_Empty();
    }
    if ( json["slot4"]["name"] === "ZX7300"){
	popSlot4_ZX7300();
	setBoardState( json["slot4"]["M"], "7300", 4 );	
    }else if ( json["slot4"]["name"] === "SBC" ) {
	popSlot4_Sbc();
	setBoardState( json["slot4"]["M"], "sbc", 4 );	
    }else if ( json["slot4"]["name"] === 'N/A' ) {
	// means we are physically in ejector open state but already passed to M1
	setBoardEjectState( 4 ); 
    }else {
	popSlot4_Empty();
    }
    if ( json["slot5"]["name"] === "ZX7300"){
	popSlot5_ZX7300();
	setBoardState( json["slot5"]["M"], "7300", 5 );	
    }else if ( json["slot5"]["name"] === "SBC" ) {
	popSlot5_Sbc();
	setBoardState( json["slot5"]["M"], "sbc", 5 );	
    }else if ( json["slot5"]["name"] === '"N/A"' ) {
	// means we are physically in ejector open state but already passed to M1
	setBoardEjectState( 5 ); 
    }else {
      //alert( "no board name" + json["slot5"][0] );
	popSlot5_Empty();
    }  
    
        //document.getElementById("tempnotify").innerHTML = ("") ;
}

function setBoardEjectState( slot ) {
  // use sbc graphic, and turn off lettering to make it generic
  // then set LEDs to indicate ejector open
  switch ( slot) {
    case 1 :
      //later
      break;
    case 2 :
      //later
      break;
    case 3 :
      popSlot3_Sbc();
      $('#sbc-3ejectgroup').css("opacity", 0 );
      blinklist [ "sbc-3glow" ].blink = true;
      document.getElementById("slot3notify").innerHTML = ("Ejector lever opened!") ;
      break;      
    case 4 : 
      popSlot4_Sbc();
      $('#sbc-4ejectgroup').css("opacity", 0 );
      blinklist [ "sbc-4glow" ].blink = true;
      document.getElementById("slot4notify").innerHTML = ("Ejector lever opened!") ;
      break;      
    case 5 :
      popSlot5_Sbc();
      $('#sbc-5ejectgroup').css("opacity", 0 );
      blinklist [ "sbc-5glow" ].blink = true; 
      document.getElementById("slot5notify").innerHTML = ("Ejector lever opened!") ;
      break;      
  }
  // now genericize it
  
  
}

function setBoardState(mstate,board,slot){
	  /*M0 No power and hot swap handle open
	  M1 No communications. (Wait in M1 until hot swap ejector is closed)
	  M2 FRU announces its presence to the ShMC and awaits activation permission
	  M3 Activation
	  M4 Operational state (command issued to enable backend power)
	  M5 Deactivation request (e.g. hot swap ejector opened)
	  M6 Deactivation granted by ShMC
	  M7 Unexpected loss of communication between FRU and ShMC */   
	  
//alert("board " + board + " mstate " + mstate + " slot "  + slot);
    switch( mstate) {	// change LED colors and hot swap LED color see ATCA spec
      case "M0(0)":   // blue LED off
	  boardOutOfService(board, slot);
	  $("#led" + board + "-" + slot + "hot").css("fill", black) ;
	  blinklist [ "led" + board + "-" + slot + "hot" ].blink = false ;
	  break;	  
      case "M1(1)":	// blue LED on
	  boardOutOfService(board, slot);
	  $("#led" + board + "-" + slot + "hot").css("fill", blue) ;
	  blinklist [ "led" + board + "-" + slot + "hot" ].blink = false ;
	  break;	  
      case "M2(2)":	// blue LED blink
	  boardOutOfService(board, slot);
	  $("#led" + board + "-" + slot + "hot").css("fill", blue) ;
	  blinklist [ "led" + board + "-" + slot + "hot" ].blink = true ;
	  break;	  
      case "M3(3)":	// blue LED off
	  boardOutOfService(board, slot);
	  $("#led" + board + "-" + slot + "hot").css("fill", black) ;
	  blinklist [ "led" + board + "-" + slot + "hot" ].blink = false ;
	  break;	  
      case "M4(4)":	// blue LED off // ejectboard states off
	  if (  blinklist [  board + "-" + slot + "glow" ].blink === true ) { 
	      boardReturnToService(board,slot);
	  }
	  $("#led" + board + "-" + slot + "hot").css("fill", black) ;
	  blinklist [ "led" + board + "-" + slot + "hot"].blink = false ; 
	  break;	  
      case "M5(5)":	// blue LED blink
	  boardOutOfService(board, slot);
	  $("#led" + board + "-" + slot + "hot").css("fill", blue) ;
	  blinklist [ "led" + board + "-" + slot + "hot" ].blink = true ;
	  break;	  
      case "M6(6)": // blue LED blink
	  boardOutOfService(board, slot);
	  $("#led" + board + "-" + slot + "hot").css("fill", blue) ;	  
	  blinklist [ "led" + board + "-" + slot + "hot" ].blink = true ;
	  break;	  
      case "M7(7)": // blue LED no change
	  boardOutOfService(board, slot);
	  break;	  
      default : //error condition
	  $("#led" + board + "-" + slot + "hot").css("fill", red) ;
	  blinklist [ "led" + board + "-" + slot + "hot" ].blink = false ;
	  break;	  
    }
  
}

function boardOutOfService(board,slot){
  // LEDs are named led7300-2nnnn ledsbc-1nnnn where 1 & 2 or 3 are slot numbers and nnnn is unique
      document.getElementById("tempnotify").innerHTML = ("Board going out of service! board: " + board + " slot: " + slot) ;
    if ( board === "7300" ) {
	setBoardBlack("7300", slot);
    }else if ( board === "sbc"){
	setBoardBlack("sbc", slot); //note case
    }else {
	// do nothing
    }
  
}

function boardReturnToService(board,slot){
  // LEDs are named led7300-2nnnn ledsbc-1nnnn where 1 & 2 or 3 are slot numbers and nnnn is unique
    for( var name in blinklist){
	    if ( name.match("led") && name.match("board") ){
		$("#" + name).css("fill", blinklist[ name ].color) ;   // return to default color
	    } else if ( name.match("glow") && name.match("board") ){
		$("#" + name).css("stroke", blinklist[ name ].color) ; // return to default color
	    }
    }
    $("#led" + board + "-" + slot + "hot").css("fill", black) ;
    $( "#" + board + "-" + slot + "glow").css("stroke", coolorange) ;
    $( "#" + board + "-" + slot + "ejectgroup").css("opacity", 100 );
    blinklist [ "led" + board + "-" + slot + "hot" ].blink = false ;
    blinklist [  board + "-" + slot + "glow" ].blink = false ;
    document.getElementById("tempnotify").innerHTML = ("Board returned to service! board: " + board + " slot: " + slot) ;

}

function setBoardBlack(board,slot){
  // sets all SVG leds to light grey
    var tags=document.getElementsByTagName("rect");  // note limited to "rect" for now
    for(var x=0;x<tags.length;x++){
	var myid = tags[x].id;
	if( myid.match("led" + board + "-" + slot) &&  !myid.match("hot")){
	     $("#" + myid).css("fill", ltgrey) ;
	}
    }
}

function floatMenu(menu, svg, topy, leftx  ) {
      invisbleMenus(last_menu);		// make the last menu invisible
      last_menu = menu ;	// reset the last_menu var to this menu
      visbleMenus(menu);		// make this menu visible
      $(menu).animate({top:topy,left:leftx},{duration:100,queue:false});
      $(menu).fadeIn( 400);
  
}
function visbleMenus(menu){
    // to be used on mouseover, mousenter, hover events to clear any previous menus
    // because we can't use mousout typ. events to clear menus
    $(menu).css("visibility", "visible");
}
function invisbleMenus(menu){
    // to be used on mouseover, mousenter, hover events to clear any previous menus
    // because we can't use mousout typ. events to clear menus
    $(menu).css("visibility", "hidden");
}

function popSlot3_ZX7300(){
    popSlot3_Empty(); // reset for the seond time you push "SB"
    $('#7300-3group').css("visibility", "visible" );
    $('#7300-3group').animate({svgTransform: 'translate(-16,-297)',svgOpacity: 100}, 2000);
}
function popSlot4_ZX7300(){
    popSlot4_Empty(); // reset for the seond time you push "SB"
    $('#7300-4group').css("visibility", "visible" );
    $('#7300-4group').animate({svgTransform: 'translate(-38,-445)',svgOpacity: 100}, 2000);
}
function popSlot5_ZX7300(){
    popSlot5_Empty(); // reset for the seond time you push "SB"
    $('#7300-5group').css("visibility", "visible" );
    $('#7300-5group').animate({svgTransform: 'translate(-30,-404)',svgOpacity: 100}, 2000);
}
function popSlot3_Sbc(){
    popSlot3_Empty(); // reset for the seond time you push "SB"
    $('#sbc-3group').css("visibility", "visible" );
    $('#sbc-3group').animate({svgTransform: 'translate(110,-445)',svgOpacity: 100}, 2000);
}
function popSlot4_Sbc(){
    popSlot4_Empty(); // reset for the seond time you push "SBC"
    $('#sbc-4group').css("visibility", "visible" );
    $('#sbc-4group').animate({svgTransform: 'translate(110,-405)',svgOpacity: 100}, 2000);
}
function popSlot5_Sbc(){
    popSlot5_Empty(); // reset for the seond time you push "SBC"
    $('#sbc-5group').css("visibility", "visible" );
    $('#sbc-5group').animate({svgTransform: 'translate(-56,385)',svgOpacity: 100}, 2000);
}
function popSlot3_Empty(){
    $('#sbc-3group').css("visibility", "hidden" );
    $('#7300-3group').css("visibility", "hidden" );
    $('#empty-3').css("visibility", "visible" );
}
function popSlot4_Empty(){
    $('#sbc-4group').css("visibility", "hidden" );
    $('#7300-4group').css("visibility", "hidden" );
    $('#empty-4').css("visibility", "visible" );
}
function popSlot5_Empty(){
    $('#sbc-5group').css("visibility", "hidden" );
    $('#7300-5group').css("visibility", "hidden" );
    $('#empty-5').css("visibility", "visible" );

}

// Returns a random number between min and max
function getRandomInteger(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function logDebug(newtext){
    document.getElementById("debugdiv").innerHTML += (".... " + newtext) ;
}

//////////////////////////// END of ACTIVE CODE /////////////////////////////

// function overTempAnim(){
// // turning off event handlers for animation
// //???????? what to do ????????
//     // this popslotting takes 2100 ms:
//     $('#slot3notify').css("background", ltnotify);
//     document.getElementById("slot3notify").innerHTML = ("Load ZX7300") ;
//     $('#slot4notify').css("background", ltnotify);
//     document.getElementById("slot4notify").innerHTML = ("Load SBC") ;
//     popSlot3_ZX7300();
//     popSlot4_Sbc();
// 
// 
// 
//     var count = 0;
//     var short_interval = window.setInterval(function() {
//     // runs about half speed of what you'd expect! so use a repeat ms number twice nominal
//      switch(count) {
// 	case 4:
// 	    $('#slot3notify').css("background", idlenotify);
// 	    document.getElementById("slot3notify").innerHTML = ("") ;
// 	    $('#slot4notify').css("background", idlenotify);
// 	    document.getElementById("slot4notify").innerHTML = ("") ;
// 	    $('#tempnotify').css("background", ltnotify);
// 	    document.getElementById("tempnotify").innerHTML = ("Main Fan- over 40C threshold: 42C") ;
// 	    pulse('#fan-lglow');
// 	break;
// 	case 13:
// 	    pulse('#fan-lglow');
// 	break;
// 	case 21:
// 	    pulse('#fan-lglow');
// 	break;
// 	case 28:
// 	    document.getElementById("tempnotify").innerHTML = ("") ;
// 	    $('#tempnotify').css("background", idlenotify);
// 	break;
// 	case 29:
// 	    $('#tempnotify').css("background", ltnotify);
// 	    document.getElementById("tempnotify").innerHTML = ("Right Fan- over 40C threshold: 45C") ;
// 	    pulse('#sidefan-rglow');
// 	break;
// 	case 37:
// 	    pulse('#sidefan-rglow');
// 	break;
// 	case 44:
// 	    document.getElementById("tempnotify").innerHTML = ("") ;
// 	    $('#tempnotify').css("background", idlenotify);
// 	break;
// 	case 45:
// 	    $('#tempnotify').css("background", ltnotify);
// 	    document.getElementById("tempnotify").innerHTML = ("Left Fan- over 40C threshold: 44C") ;
// 	    pulse('#sidefan-lglow');
// 	break;
// 	case 53:
// 	    pulse('#sidefan-lglow');
// 	break;
// 	case 60:
// 	    document.getElementById("tempnotify").innerHTML = ("") ;
// 	    $('#tempnotify').css("background", idlenotify);
// 	break;
//  	case 61:
// 	    $('#tempnotify').css("background", ltnotify);
// 	    document.getElementById("tempnotify").innerHTML = ("ZX1900A- over 40C threshold: 43C") ;
// 	    pulse('#1900Aglow');
//  	break;
//  	case 69:
// 	    pulse('#1900Aglow');
//  	break;
// 	case 76:
// 	    document.getElementById("tempnotify").innerHTML = ("") ;
// 	    $('#tempnotify').css("background", idlenotify);
// 	break;
//  	case 77:
// 	    $('#tempnotify').css("background", ltnotify);
// 	    document.getElementById("tempnotify").innerHTML = ("ZX1900B- over 40C threshold: 45C") ;
// 	    pulse('#1900Bglow');
// 	break;
// 	case 85:
// 	    pulse('#1900Bglow');
// 	break;
// 	case 92:
// 	    document.getElementById("tempnotify").innerHTML = ("") ;
// 	    $('#tempnotify').css("background", idlenotify);
// 	break;
// 	case 93:
// 	    $('#tempnotify').css("background", ltnotify);
// 	    document.getElementById("tempnotify").innerHTML = ("Slot3 ZX7300- over 40C threshold: 45C") ;
// 	    pulse('#7300-3glow');
// 	break;
// 	case 101:
// 	    pulse('#7300-3glow');
// 	break;
// 	case 108:
// 	    document.getElementById("tempnotify").innerHTML = ("") ;
// 	    $('#tempnotify').css("background", idlenotify);
// 	break;
// 	case 109:
// 	    $('#tempnotify').css("background", ltnotify);
// 	    document.getElementById("tempnotify").innerHTML = ("Slot4 SBC- over 35C threshold: 36C") ;
// 	    pulse('#sbc-4glow');
// 	break;
// 	case 117:
// 	    pulse('#sbc-4glow');
// 	break;
// 	case 124:
// 	    document.getElementById("tempnotify").innerHTML = ("") ;
// 	    $('#tempnotify').css("background", idlenotify);
// 	break;
// 	case 125:
// 	    $('#tempnotify').css("background", ltnotify);
// 	    document.getElementById("tempnotify").innerHTML = ("Shelf manager- over 30C threshold: 34C") ;
// 	    pulse('#shmcglow');
// 	break;
// 	case 133:
// 	    pulse('#shmcglow');
// 
// 	break;
// 	case 141:
// 	    document.getElementById("tempnotify").innerHTML = ("") ;
// 	    $('#tempnotify').css("background", idlenotify);
// 	break;
//  	case 142:
// 	    location.reload();
// 	    return "";
//  	break;
// 
//       }
//       count++;
//     }, 700 );
//     
// }

/*
function getCurrentLEDBlinkState(){
// iterate through blinklist, looking for blink = true
// this is what we'd do if some function was resetting the state of LEDs
// take the true ones and re-create idarray
    idarray.length = 0; // clean it out
    for ( var id in blinklist ) {
	//alert ( "blink is " + blinklist [ id ].blink ) ;
	if ( blinklist [ id ].blink === true ) {
	     idarray.push(id); 
	}
    }

}*/





// function pulse(myselector, color){;
//     if ( color === "orange") {
// 	  var mycolor = $(myselector).css("stroke");
// 	  $(myselector).animate({svgStroke: coolorange }, 400, 
// 	      function(){ $(myselector).animate({svgStroke: hotorange}, 2000, 
// 	      function(){ $(myselector).animate({svgStroke: coolorange}, 800 );});});
// 	  $(myselector).css("stroke", mycolor).delay( 3200 );
//     }else if ( color === "blue") {
//       	  var mycolor = $(myselector).css("stroke");
// 	  $(myselector).animate({svgStroke: coolorange }, 1000, 
// 	      function(){ $(myselector).animate({svgStroke: coolorange }, 400, 
// 	      function(){ $(myselector).animate({svgStroke: blue}, 1000 );});});
// 	  $(myselector).css("stroke", mycolor).delay( 1000 );
//     }
// }


// function pulsing(myselector){
//     var count = 0;
//     var mycolor = $(myselector).css("stroke");
//     var short_interval = window.setInterval(function() {
//       if ( count > 3 ) {
// 	  $(myselector).css("stroke", coolorange);
// 	  short_interval.clear(); 
//       }
//       $(myselector).animate({svgStroke: coolorange }, 800);
//       $(myselector).delay(1200).animate({svgStroke: hotorange}, 2000);
//       count++;
//     }, 3800 );
//     $(myselector).css("stroke", mycolor);
// }

