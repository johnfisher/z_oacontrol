

/**********************
    Zmyx Networks OAControl
   all the javascript demo4.2 specific functions/classes/prototypes 
*************************/
xmlns="http://www.w3.org/2000/svg";

      
      
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

// create the blink object. We don't know any leds yet, so just pass ob.proto
// it may not matter here, but the books aren't sanguine about new() or var x = {};
var blinklist = Object.create( {"led1-l" :  {color : blue	, blink : true, shape : "rect" } } );
var idarray = [];
var stop_short_interval = false ; // used for flag to stop blinking
var blink_duration = 800 ; // blink loop interval


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
    var short_interval = window.setInterval(function() {
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
			if ( $("#" + name).css("fill") === black ) {
			    $("#" + name).css("fill", col );
			}else{
			    $("#" + name).css("fill", black );
			}
			blinklist[ name ].timestamp  = newtime ;
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
    var tags=document.getElementsByTagName("rect");  // note limited to "rect" for now
    for(var x=0;x<tags.length;x++){
	var myid = tags[x].id;
	var date = new Date();
	var addmin = Math.round( blink_duration/3 );
	var newtime = date.getTime() + getRandomInteger( addmin  , blink_duration );
	if( myid.match("led") && !myid.match("power")){
	    // set all LEDs to not blink by default
	    blinklist[ myid ] = { blink : false, color : $("#" + myid).css("fill"), shape : "rect", timestamp : newtime	 } ;
	}
	switch(myid)   // set special LEDs where we have no snmp data
	    {
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
	    default:
	      break;
	    }
    }
}


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

}





function process_1900AData(json){
// taking in json data from snmpget done by backend php via ajax

    for (var zre in json["ZX1900A"][0] ) {
	    //logDebug(zre) ;
	    if ( json["ZX1900A"][0][zre] == "down" ) {
		$("#ledAf" + zre ).css("fill", amber );
		//logDebug("down: #ledAf" + zre );
	    }else if ( json["ZX1900A"][0][zre] == "up" ) {
		$("#ledAf" + zre ).css("fill", green );
				//logDebug("up: #ledAf" + zre );
	    }else {
		$("#ledAf" + zre ).css("fill", black ); //some unknown state
				//logDebug("unkniown: #ledAf" + zre );
	    }
    }
    if ( json["ZX1900A"]["ext"] == "on" ) {
	$("#ledAfext").css("fill", red );      
    }else if ( json["ZX1900A"]["ext"] == "off" ) {
	$("#ledAfext").css("fill", black );       
    }else {
	$("#ledAfext").css("fill", blue ); //some unknown state     
    }
    if ( json["ZX1900A"]["int"] == "on" ) {
	$("#ledAfint").css("fill", red );      
    }else if ( json["ZX1900A"]["int"] == "off" ) {
	$("#ledAfint").css("fill", black );       
    }else {
	$("#ledAfint").css("fill", blue ); //some unknown state     
    }
}

function process_1900BData(json){
// taking in json data from snmpget done by backend php via ajax

    for (var zre in json["ZX1900B"][0] ) {
	    //logDebug(zre) ;
	    if ( json["ZX1900B"][0][zre] == "down" ) {
		$("#ledAb" + zre ).css("fill", amber );
	    }else if ( json["ZX1900B"][0][zre] == "up" ) {
		$("#ledAb" + zre ).css("fill", green );
	    }else {
		$("#ledAb" + zre ).css("fill", black ); //some unknown state
	    }
    }
    if ( json["ZX1900B"]["ext"] == "on" ) {
	$("#ledAbext").css("fill", red );      
    }else if ( json["ZX1900B"]["ext"] == "off" ) {
	$("#ledAbext").css("fill", black );       
    }else {
	$("#ledAbext").css("fill", blue ); //some unknown state     
    }
    if ( json["ZX1900B"]["int"] == "on" ) {
	$("#ledAbint").css("fill", red );      
    }else if ( json["ZX1900B"]["int"] == "off" ) {
	$("#ledAbint").css("fill", black );       
    }else {
	$("#ledAbint").css("fill", blue ); //some unknown state     
    }
}


