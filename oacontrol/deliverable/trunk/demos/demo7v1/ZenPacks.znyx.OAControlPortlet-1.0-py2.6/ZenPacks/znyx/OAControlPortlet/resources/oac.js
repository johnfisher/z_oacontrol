/* Zmyx Networks OAControl    
 *  done as a jQuery plugin because a standard module pattern library
 *  did not work in the zenoss/YUI namespace.
 *  This model works well outisde zenoss though,
 *  so its easier to test this way.
 *  http://docs.jquery.com/Plugins/Authoring
 *  http://www.learningjquery.com/2007/10/a-plugin-development-pattern
 */

// create closure
//
(function($) {
  //
  // plugin definition ... claim the name oac
  // invoke as $('#myDiv').oac();
  //
  $.fn.oac = function(options) {
		debug(this);
		// build main options before element iteration
// 		var opts = $.extend({}, $.fn.oac.defaults, options);
 		// iterate and reformat each matched element
 		return this.each(function() {
 				$this = $(this);
 				// build element specific options see "metadata"
// 				var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
 				// update element styles
//  				$this.css({
//  					backgroundColor: o.background,
//  					color: o.foreground
//  				});
 //				var markup = $this.html();
 				// call our format function
 //				markup = $.fn.oac.format(markup);
// 				$this.html(markup);
		});
  };
  //
  // private function for debugging using FireBug console
  //
  function debug($obj) {
		if (window.console && window.console.log)
		window.console.log('oac selection count: ' + $obj.size());
  };

    
  // define and expose our logDebug function
  //
  $.fn.oac.logDebug = function( txt) {
		document.getElementById("debugdiv").innerHTML += (".... " + JSON.stringify(txt)) ;
  };
  //
  // plugin defaults
  //
  // sample to use to add  changeable defaults later....
//   $.fn.oac.defaults = {
// 		foreground: 'red',
// 		background: 'yellow'
// 		
//   };
  		// ip addresses for various boards; get these from backend process

		var chassisnet =   {shmm :  {ip : "", pswd : "", serialnum : "" } ,  slot1 :  {ip : "", pswd : "", serialnum : "" }  ,
		 slot2 :  {ip : ""	, pswd : "", serialnum : "" } , slot3 :  {ip : ""	, pswd : "", serialnum : "" } ,	slot4 :  {ip : ""	, pswd : "", serialnum : "" } ,
		slot5 :  {ip : ""	, pswd : "", serialnum : "" } , slot6 :  {ip : ""	, pswd : "", serialnum : "" } ,		slot7 :  {ip : ""	, pswd : "", serialnum : "" } , 
		slot8 :  {ip : ""	, pswd : "", serialnum : "" } }  ;

		
		var default_data_src_str = "zxchassis2000_2switch.xml" ; // leave this set to the standard data src
		var	default_data_src_base_url = 'http://' + document.domain + '/oac/' ; //always end in '/' !!
		oacglobals = 
			{ ltblue : "#90B2ED" , 		//" or brightblue rgb(15, 247, 240)"
			  defaultglow : "rgb(59, 37, 7)",
			  white : "rgb(255, 255, 255)", 
			  black : "rgb(0, 0, 0)",
			  blue :  "rgb(0, 0, 255)", // BUG: #0000ff does not work in a ::: test!!! //changed later to radialGradient in GetOrigLED
			  green : "rgb(0, 255, 0)",	//changed later to radialGradient in GetOrigLED
			  red : "rgb(255, 0, 0)",
			  amber :  "#FCB83B" ,		//changed later to radialGradient in GetOrigLED
			  dkglow : "#3B2507" ,
			  ltglow : "#FCB83B" ,
			  hotorange : "#F0730E" ,  	// use for over-temp animation
			  coolorange: "#623815",	//or "#975118"
			  dknotify : "#B18D75",
			  ltnotify : "#F2DAC9",
			  idlenotify : "#F2EAE3",
			  ltgrey : "#E0E0E0",
			  mdgrey : "rgb(143, 140, 152)",			
			  stop_short_interval : false , // used for flag to stop blinking
			  blink_duration : 600 , 	// blink loop interval 600
			  snmp_loop_duration : 5000 , 	// loop for snmpgets 5000
			  fly_duration : 2000 ,		// animate fly-in of boards
			  last_menu : "" ,			//for tracking which menu to toggle
			  test_status : false , 	// for turning on testing
			  data_src_str : default_data_src_base_url + default_data_src_str , // change this in auto-test code for testing
			  test_data : null,			// used for testing instead of reading xml files
			  zx7300name : "ZX7300" , 	// board name as reported by snmp
			  zx2010name : "ZX2010" ,	// board name as reported by snmp
			  zxsbcname : "sbc" , 		// board name as reported by snmp
			  svg7300name : "7300" , 	// board name in svg
			  svg2010name : "2010" , 	// board name in svg
			  svgsbcname : "sbc" , 		// board name in svg2010name
			  pem_visible : false };		// whether we see Mstate4 PEMs or not

		// create the blink object. We don't know any leds yet, so just pass ob.proto
		// it may not matter here, but the books aren't sanguine about new() or var x = {};
		var blinklist = {  } ;
		
		var idarray = [];

/// set up the initial web page  ////////////////////////////////////
	$.fn.oac.setupPage = function setupPage(){		
		// hide the 7300's and sbc's ///////////////////////////
		$('#7300-1group').css("opacity", 0 );
		$('#7300-2group').css("opacity", 0 );
		$('#7300-3group').css("opacity", 0 );
		$('#7300-4group').css("opacity", 0 );
		$('#7300-5group').css("opacity", 0 );
		$('#7300-6group').css("opacity", 0 );
		$('#sbc-1group').css("opacity", 0 );
		$('#sbc-2group').css("opacity", 0 );
		$('#sbc-3group').css("opacity", 0 );
		$('#sbc-4group').css("opacity", 0 );
		$('#sbc-5group').css("opacity", 0 );
		$('#sbc-6group').css("opacity", 0 );
		$('#2010-7group').css("opacity", 0 );
		$('#2010-8group').css("opacity", 0 );	
		
		// hide the PEMs if set
		if ( oacglobals["pem_visible"] == false ){
			$('#2000-lpemgroup').css("visibility", "hidden" );
			$('#2000-rpemgroup').css("visibility", "hidden" );
		}
		// hide the popups ///////////////////////////
		//$('#1900Apopupgroup').css("opacity", 0 );
		// black out fan leds to make startup illusion that chassis is dead
		// NOTE: this has to be done AFTER blinklist is created so we
		// can preserve the opriginal colors
// 				$('#led2000-rfan-ok' ).css("fill", oacglobals["black"]);
// 				$('#led2000-lfan-ok' ).css("fill", oacglobals["black"]);
// 				$('#led2000-rfan-warn' ).css("fill", oacglobals["black"]);
// 				$('#led2000-lfan-warn' ).css("fill", oacglobals["black"]);
// 				$('#led2000-rfan-hot' ).css("fill", oacglobals["black"]);
// 				$('#led2000-lfan-hot' ).css("fill", oacglobals["black"]);

	// grab the ip data for the links
//alert("starting.... datasrstr " + oacglobals["data_src_str"]);
	//// chain lots of stuff behind the var setting because it requires that these vars be set and the get takes quite a lot of time...///////////////////////
		$.get(oacglobals["data_src_str"],  function(x_data){
			//var json_data = $.parseJSON(data);
			var json_data = processChassisXML(x_data) ; // translates to json and validates ip address
			oacglobals["test_data"] =  json_data;	// used for starting a test with real data, but running on test data
//alert("test_data" + JSON.stringify(oacglobals["test_data"]) );
			baseip = json_data["slot1"]["baseip"] ;
			fabip = json_data["slot1"]["fabip"] ;
			slot3ip = json_data["slot3"]["ip"] ;
			slot4ip = json_data["slot4"]["ip"] ;
			slot5ip = json_data["slot5"]["ip"] ;
			//shmcip = json_data["shmc"]["ip"] ;
			//zenip = json_data["zenoss"]["ip"] ;

			// now set up blinklist
			getOrigLEDState();

			// handle popups ///////////////////////////
			// make popup go away when clicked
			/*	$('#1900Apopupbkg').click(function(){
				//alert("onclick opup"); // note uses background so LEDs remian clickable
				popDown1900A();
			})*/;	

			// >>>>>   "for ( var id in blinklist ) {" <<<<<< did NOT work because of scoping
			// see http://encosia.com/using-jquery-1-6-to-find-an-array-of-an-objects-keys/
			// and heres the explanation http://stackoverflow.com/questions/7530678/javascript-variable-scope-issue-with-jquery-click-event
			$.map(blinklist, function(value, key) {
		// // // 		 						logDebug(key);
				var id = key ;
				if ( id.match("ledApopbz") ) {  // one of the 1900A base popup leds
				//logDebug(" id ledApopbz " + id + "<br>");
					// http://10.2.0.233:8080/zport/dmd/Devices/Network/OASwitch/ZX1900BaseDevice/devices/10.2.0.155/devicedetail#deviceDetailNav:IpInterface:/zport/dmd/Devices/Network/OASwitch/ZX1900BaseDevice/devices/10.2.0.155/os/interfaces/zre1
						var zrenum = id.substr(9);
				//logDebug("ip vars: "  + baseip + " " + fabip + " " + slot3ip + " " + slot4ip + " " + slot5ip + " " + shmcip );

						var zreurl = 'http://' + zenip + ':8080/zport/dmd/Devices/Network/OASwitch/ZX1900BaseDevice/devices/' + baseip + '/devicedetail#deviceDetailNav:IpInterface:/zport/dmd/Devices/Network/OASwitch/ZX1900BaseDevice/devices/' + baseip + '/os/interfaces/zre' + zrenum
					//logDebug("zre url " + zreurl);
						$('#' + id ).mouseenter(function(){
							//logDebug("mouseover stroke id= " + id + "<br>");
							$('#' + id ).css("stroke", oacglobals["ltblue"]);
						});
						$('#' + id ).mouseleave(function(){
							//logDebug("mouseleave stroke id= " + id + " color " +  blinklist[id].color + "<br>");
							$('#' + id ).css("stroke", oacglobals["white"] );
						});
						$('#' + id ).click(function(){  
							$('#' + id ).attr('target', '_blank');
							window.open(zreurl);
						});

				}else if ( id.match("ledApopfz") ) {  // one of the 1900A fabric popup leds								
						//alert("fabriczre num = " + zrenum + " id = " + id);
						// http://10.2.0.233:8080/zport/dmd/Devices/Network/OASwitch/ZX1900FabricDevice/devices/10.2.0.215/devicedetail#deviceDetailNav:IpInterface:/zport/dmd/Devices/Network/OASwitch/ZX1900FabricDevice/devices/10.2.0.215/os/interfaces/eth0
						var zrenum = id.substr(9);
						var zreurl = 'http://' + zenip + ':8080/zport/dmd/Devices/Network/OASwitch/ZX1900FabricDevice/devices/' + fabip + '/devicedetail#deviceDetailNav:IpInterface:/zport/dmd/Devices/Network/OASwitch/ZX1900FabricDevice/devices/' + fabip + '/os/interfaces/zre' + zrenum
						$('#' + id ).mouseenter(function(){
							//logDebug("mouseover stroke id= " + id + "<br>");
							$('#' + id ).css("stroke", oacglobals["ltblue"]);
						});
						$('#' + id ).mouseleave(function(){
							//logDebug("mouseleave stroke id= " + id + " color " +  blinklist[id].color + "<br>");
							$('#' + id ).css("stroke", oacglobals["white"] );
						});
						$('#' + id ).click(function(){  
							$('#' + id ).attr('target', '_blank');
							window.open(zreurl);
						});
				}							
			});
			processSlotData(json_data);
			process_2010Data(json_data);
			process_7300Data(json_data);
			processChassisData(json_data);
	/////////////////////// END of stuff chained inside get data
		} );
			
		// mouseover functions: typ.//////////////////////////////////////////////////////////////////////////
		// WHY DONT WE USE MOUSEOUT? because the hover or mouseout conflicts with the one in superfish menu
		$('#1900Apopupgroup').mouseover(function(){
			invisbleMenus(oacglobals["last_menu"]);		// make the last menu invisible	 
		});
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
		invisbleMenus(oacglobals["last_menu"]);		// make the last menu invisible
		oacglobals["last_menu"] = '';			// reset last menu to ''
		});
		$('#empty-4').mouseover(function(){
				//alert("empty3");
		invisbleMenus(oacglobals["last_menu"]);
		oacglobals["last_menu"] = '';
		});
		$('#empty-5').mouseover(function(){
				//alert("empty3");
		invisbleMenus(oacglobals["last_menu"]);
		oacglobals["last_menu"] = '';
		});
		$('#chassisgroup').mouseover(function(){
				//alert("chassis");
		invisbleMenus(oacglobals["last_menu"]);
		oacglobals["last_menu"] = '';
		});
		$('#chassisbkg').mouseover(function(){	//really get rid of the menus
				//alert("pagebkg");
		invisbleMenus(oacglobals["last_menu"]);
		oacglobals["last_menu"] = '';
		});

		$("#1900Apopup").click(function (e)  {
				//alert("click1900Apopup");
			popUp1900A();
			e.preventDefault();
		});
		runLoadingMask();
	}// end func
		////////////// END  setup  ///////////////////////////////



		$.fn.oac.blinkLED = function (){
//alert( "start blinlistled");
			var blink_loop = window.setInterval(function() {
			for( var name in blinklist){
				if ( blinklist[ name ].blink === true ){
					var date = new Date();
					var time = date.getTime() ;  // getTime translates to total milliseconds
					var delay = time - blinklist[ name ].timestamp ;
					// we are adding some randomized number of ms to the timestamps
					// to prevent a pulsing effect as all LEDs blink together
					var newtime =  time += getRandomInteger( 100  , oacglobals["blink_duration"]   );
					var col = blinklist[ name ].color ;

					if ( delay > oacglobals["blink_duration"] ) {
	//alert("blinklistled delay, blinkdurastion " + delay + " " + oacglobals["blink_duration"] );
						if ( name.match("led") ) {
							if ( $("#" + name).css("fill") === oacglobals["mdgrey"] ) {
								$("#" + name).css("fill", col );
	//alert("blinklist  mdgrey is " + mdgrey);
							}else{
								$("#" + name).css("fill", oacglobals["mdgrey"] );
	//alert("blinklist fill is " + col + " mdgrey is " + oacglobals["mdgrey"]);
							}
							blinklist[ name ].timestamp  = newtime ;
						} else if ( name.match("glow")) {
							if ( $("#" + name).css("stroke") === blinklist[name].color ) {	// if standard color
								$("#" + name).css("stroke", blinklist[name].blinkcolor );	// set to blink color
							}else{
								$("#" + name).css("stroke", blinklist[name].color );	// else set to standard color
							}
							blinklist[ name ].timestamp  = newtime ;			
						}
					}
				}
				// for future use as a second way to stop the loop
				if (oacglobals["stop_short_interval"] === true) {
					clearInterval(short_interval);
				}
			}
			}, oacglobals["blink_duration"] ); 
		}
		
		
		$.fn.oac.loopGetSNMP = function (){
						//alert("loop getsnmp");

			loop_control = window.setInterval(function() {
				var json_data = {};
				$.get(oacglobals["data_src_str"],  function(data){
						//alert("loop inside interval");
					// when testing is turned on, we get one slice of real data
					// and ever after we get only the processed data that
					// test modifies
	//alert( "loopgetsnmp test_ststus = " + oacglobals["test_status"]);
					if ( oacglobals["test_status"] == true ) {
						json_data = oacglobals["test_data"] ;
					}else {
						//alert( "loopgetsnmp data from XML!");
						json_data = processChassisXML(data) ;
					}
	//alert("loopGetSNMP test_data = " + JSON.stringify(oacglobals["test_data"]) );
	//alert("loopGetSNMP json_data = " + JSON.stringify(json_data) );
						//logDebug(json_data);
					process_2010Data(json_data);
						//logDebug(json_data);
					process_7300Data(json_data);
					processChassisData(json_data);
					processSlotData(json_data);
					} );
				}, oacglobals["snmp_loop_duration"] );

		}
		
		$.fn.oac.writeToPanel = function (element, text){
			document.getElementById(element).innerHTML = text ;
		}


		function processChassisXML(x_data){
			// just validate if there is data
			// may have to be re-done to get data from daemon eventually
			// now, just reads an xml file
			// this has to be validated every time because we don't know if something has changed or been replaced
			var j_data = null;
				// must run these tests inside this function to prevent race conditions
			    j_data = $.xml2json(x_data);  // (data, true) if extended mode required
//alert("process j_data " + JSON.stringify(j_data)) ;
//$("#mybody").oac.logDebug( JSON.stringify(j_data) );
							//alert( "Chnet2 " + JSON.stringify(chassisnet) );
				// test for a full set of valid IPs for all slots, slot by slot
				for (var i = 1; i < 9; i++) {
							//alert(" for " + i );
					var msg = "IP address validation error";
					var slt = "slot" + i ;
					var testip = j_data[slt]["ip"] || null ;
							//alert("testip " + testip);
					if (testip !== null){
						msg =  validateIP( testip );
						if ( msg !== "good"){
							alert("Bad IP address for " + slt + " error: " + msg);
						}else {
							//alert("good " + testip);
							chassisnet[slt]["ip"] = testip ;
						}
					}else {
						//alert("No IP address for slot " + i);
						chassisnet[slt]["ip"] = "none" ;
					}
					// now switch from SNMP board name like "ZX7300" to hard-coded SVG name like "7300"
					var test_board  = j_data[slt]["name"] || null ;
					if (test_board !== null) {
						if ( test_board === oacglobals["zx7300name"] ) {
							j_data[slt]["name"] = oacglobals["svg7300name"];
						}else if ( test_board === oacglobals["zxsbcname"] ) {
							j_data[slt]["name"] = oacglobals["svgsbcname"];
						}else if ( test_board === oacglobals["zx2010name"] ) {
							j_data[slt]["name"] = oacglobals["svg2010name"];
						}
					}
				}
				// all done
						//alert( "retn j_data " + j_data);
				return j_data;	
		}

		function validateIP(ip){	// return "good" if valid, error msg if not
			error = ip + " is not a valid IP address";
			var ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
			var ipArray = ip.match(ipPattern);
						//alert("validateip ip " + ip);
						//alert("validateip iparrayfullresult " + ipArray[0]); // specially here for match() 0 is full result see Flanigan p.261
						//alert("validateip iparray1 " + ipArray[1]); and on to ipArray[4]
			if (ip == "0.0.0.0"){
				return error;
			}else if (ip == "255.255.255.255"){
				return error;
			}
			if (ipArray === null){
				return error;
			}else {
				for (var i = 0; i < 5; i++) {
					var octet = ipArray[i];
					if (octet > 255) {
						return error;
						i = 4;
					}
					if ((i == 0) && (octet > 255)) {
						return error;
						i = 4;
					}
				}
			}
			return "good" ;
		}
  
		// functions to make a "loading..." mask at page opening
		function runLoadingMask(){
				// the svg has a grey mask offstage; bring it on, then fade it out, then remove it so it doesn't interfere with the mouseovers
				$('#chassisgreymask').animate({svgTransform: 'translate(0,0)'}, 20).fadeOut(20000).slideDown("fast");
				setTimeout( 'document.getElementById("tempnotify").innerHTML =  "" ', 15000);  // empty the details panel
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


		function getOrigLEDState(){
		// note: this populates the blinklist object
		// captures original color of leds too 
		// NOTE this get ALL the leds from ALL graphics, even when not physically present
			var rtags=document.getElementsByTagName("rect");  
			for(var x=0;x<rtags.length;x++){
					var myid = rtags[x].id;
					var date = new Date();
					var addmin = Math.round( oacglobals["blink_duration"]/3 );
					var newtime = date.getTime() + getRandomInteger( addmin  , oacglobals["blink_duration"] );
					if( myid.match("led")  && !myid.match("power")){
						// set all rect LEDs to not blink by default
						blinklist[ myid ] = { blink : false, color : $("#" + myid).css("fill"), blinkcolor: "", shape : "rect", timestamp : newtime	 } ;
					}else if ( myid.match("glow") && !myid.match("power") ){
						// set all glows to not blink by default // "glows" are rect with no fill used for alarms
						blinklist[ myid ] = { blink : false, color : $("#" + myid).css("stroke"), blinkcolor: "", shape : "rect", timestamp : newtime	 } ;
							//alert("glow...myid " + myid);
					}
					// now that we have recorded the led set clk to blink
					if( myid.match("clk")){
						blinklist[ myid ].blink = true ;
					}
				
				}
			// NOW CIRCLES 
			var ctags=document.getElementsByTagName("circle");  
			for(var x=0;x<ctags.length;x++){
				var myid = ctags[x].id;
				var date = new Date();
				var addmin = Math.round( oacglobals["blink_duration"]/3 );
				var newtime = date.getTime() + getRandomInteger( addmin  , oacglobals["blink_duration"] );
				if( myid.match("led")  && !myid.match("power")){
					// set all LEDs to not blink by default
					blinklist[ myid ] = { blink : false, color : $("#" + myid).css("fill"), blinkcolor: "", shape : "circle", timestamp : newtime	 } ;
// 					if( myid.match("led")){
// 						blinklist[ myid ].blink = true ;
// 					}
				}else if ( myid.match("glow") && !myid.match("power") ){
					// set all glows to not blink by default // "glows" are rect with no fill used for alarms
					blinklist[ myid ] = { blink : false, color : $("#" + myid).css("stroke"), blinkcolor: "", shape : "circle", timestamp : newtime	 } ;
			//alert("myid " + myid);
				}
				// now that we have recorded the led set clk to blink
				if( myid.match("clk")){
					blinklist[ myid ].blink = true ;
				}				
			}
			// NOW ELLIPSES
			var etags=document.getElementsByTagName("ellipse");  
			for(var x=0;x<etags.length;x++){
				var myid = etags[x].id;
				var date = new Date();
				var addmin = Math.round( oacglobals["blink_duration"]/3 );
				var newtime = date.getTime() + getRandomInteger( addmin  , oacglobals["blink_duration"] );
				if( myid.match("led") ){
				// set all LEDs to not blink by default
					blinklist[ myid ] = { blink : false, color : $("#" + myid).css("fill"), blinkcolor: "", shape : "ellipse", timestamp : newtime	 } ;
					// now that we have recorded the led set clk to blink
					if( myid.match("clk")){
						blinklist[ myid ].blink = true ;
					}
				}

			}
			// NOW PATHS  ( used in sys svc healthy on 7300)
			var ptags=document.getElementsByTagName("path");  
			for(var x=0;x<ptags.length;x++){
				var myid = ptags[x].id;
				var date = new Date();
				var addmin = Math.round( oacglobals["blink_duration"]/3 );
				var newtime = date.getTime() + getRandomInteger( addmin  , oacglobals["blink_duration"] );
				if( myid.match("led") ){
				// set all LEDs to not blink by default
					blinklist[ myid ] = { blink : false, color : $("#" + myid).css("fill"), blinkcolor: "", shape : "path", timestamp : newtime	 } ;
					// now that we have recorded the led set clk to blink
				}

			}
			//grab fan glows and hots
			//blinklist[ '2000-lfan-glow' ] = { blink : false, color : $('#2000-lfan-glow').css("stroke"), blinkcolor: "", shape : "rect", timestamp : newtime	 } ;
			//blinklist[ '2000-rfan-glow' ] = { blink : false, color : $('#2000-lfan-glow').css("stroke"), blinkcolor: "", shape : "rect", timestamp : newtime	 } ;
			//blinklist[ '2000-lfan-hot' ] = { blink : false, color : $('#2000-lfan-hot').css("fill"), blinkcolor: "", shape : "ellipse", timestamp : newtime	 } ;
			//blinklist[ '2000-rfan-hot' ] = { blink : false, color : $('#2000-lfan-hot').css("fill"), blinkcolor: "", shape : "ellipse", timestamp : newtime	 } ;	
			
			//blinklist[ '2010-7-glow' ] = { blink : false, color : $('#2010-7-glow').css("stroke"), blinkcolor: "", shape : "rect", timestamp : newtime	 } ;
			//blinklist[ '2010-8-glow' ] = { blink : false, color : $('#2010-8-glow').css("stroke"), blinkcolor: "", shape : "rect", timestamp : newtime	 } ;


//$("#mybody").oac.logDebug( blinklist );				
		} //function close



		function process_2010Data(json){
		// hot led state handled by boardstate(). clk led by blinklist 
		// RULES as of January 2012:
		// ETH Ports: both off = not connected/not configed, L-green R-off = active, L-greenblnk R-off = busy, L-off R-amber = configed down
		// (we don;t do busy LEDs)
		// NOTE: add popup ports later
//alert("processswdata name- " + json["slot7"]["name"]) ;
//alert("process2010data new amber gradiant = " + oacglobals["amber"] );
//alert("process2010data new green gradiant = " + oacglobals["green"] );

			for each (var x in [ 7, 8 ]) {	// loop through for slot 7 and slot8
				if ( json["slot" + x]["name"] == oacglobals["svg2010name"] ) {  	// if there is a switch in slot x
				// do ports......
					for (var i=1; i < 20; i++ ) {
//alert("process2010data");
//alert("Co_left, col_rght = " + col_left + ", " + col_rght);						
						if ( json["slot" + x]["port" + i]["link"] == "down" ){
							if ( json["slot" + x]["port" + i]["cnf"] == "down" ){						
								if ( i > 13 ){			// sfp ports on front
									$("#led2010-" + x + "-"+ i + "l").css("fill", oacglobals["mdgrey"] );
									$("#led2010-" + x + "-"+ i + "r").css("fill", oacglobals["mdgrey"] );
								}
								// add popup here later
							}else {	//cnf must be up
								if ( i > 13 ){			// sfp ports on front
									$("#led2010-" + x + "-"+ i + "l").css("fill", oacglobals["mdgrey"] );
									$("#led2010-" + x + "-"+ i + "r").css("fill", blinklist["led2010-" + x + "-"+ i + "r"].color);     //amber
								}
								// add popup here later
							}							
						}else {	//link must be up
							if ( json["slot" + x]["port" + i]["cnf"] == "down" ){ // link up cnf down is invalid
								if ( i > 13 ){			// sfp ports on front
									alert( "process2010Data invalid port state, slot" + x + " port=" + i +  " link=up cnf=down")
								}
								// add popup here later
							}else {	//cnf must be up
								if ( i > 13 ){			// sfp ports on front
									$("#led2010-" + x + "-"+ i + "l").css("fill", blinklist["led2010-" + x + "-"+ i + "l"].color);     //green
									$("#led2010-" + x + "-"+ i + "r").css("fill", blinklist["led2010-" + x + "-"+ i + "r"].color);     //amber
								}
								// add popup here later
							}
						}
					}// end for loop
					// do rj45 ports 
					for each (var rj45 in ["shmmeth0", "sweth0", "shmmserial", "swserial"]) {
							
						if (  json["slot" + x][rj45]["link"] == "down" ){
							if ( json["slot" + x][rj45]["cnf"] == "down" ){														
									$("#led2010-" + x + "-" + rj45 + "-l").css("fill", oacglobals["mdgrey"] );
									$("#led2010-" + x + "-" + rj45 + "-r").css("fill", oacglobals["mdgrey"] );							
								// add popup here later
							}else {	//cnf must be up							
									$("#led2010-" + x + "-"+ rj45 + "-l").css("fill", oacglobals["mdgrey"] );
									$("#led2010-" + x + "-"+ rj45 + "-r").css("fill", blinklist["led2010-" + x + "-" + rj45 + "-r"].color);     //amber							
								// add popup here later
							}						
						}else if (	 json["slot" + x][rj45]["link"] == "up" ){
							if ( json["slot" + x][ rj45]["cnf"] == "down" ){ // link up cnf down is invalid								
									alert( "process2010Data invalid port state, slot= " + x + " port= " + rj45 +  " link= " + json["slot" + x][rj45]["link"]+ " cnf= " + json["slot" + x][rj45]["cnf"]);								
								// add popup here later
							}else {	//cnf must be up							
									$("#led2010-" + x + "-"+ rj45 + "-l").css("fill", blinklist["led2010-" + x + "-" + rj45 + "-l"].color);     //green
									$("#led2010-" + x + "-"+ rj45 + "-r").css("fill", blinklist["led2010-" + x + "-" + rj45 + "-r"].color);     //amber								
								// add popup here later
							}
						}else { 
								alert( "Process2010data: bad port info link= " +  json["slot" + x][rj45]["link"] + " cnf= " + json["slot" + x][rj45]["cnf"] )
						}
				
					}// for loop
				// do misc leds..........
					if ( json["slot" + x]["oaa"] == "on" ) { 
						$("#led2010-" + x + "-oaa").css("fill",  blinklist["led2010-" + x + "-oaa"].color)  ;	
					}else if ( json["slot" + x]["oaa"] == "off" ) {
						$("#led2010-" + x + "-oaa").css("fill", oacglobals["mdgrey"] );
					}else {
						//undefined
					}
					if ( json["slot" + x]["shmm"] == "on" ) { 
						$("#led2010-" + x + "-shmm").css("fill", blinklist["led2010-" + x + "-shmm"].color)  ;	
					}else if ( json["slot" + x]["shmm"] == "off" ) {
						$("#led2010-" + x + "-shmm").css("fill", oacglobals["mdgrey"] );
					}else {
						//undefined
					}
					if ( json["slot" + x]["oafault"] == "on" ) { 
						$("#led2010-" + x + "-oafault").css("fill", blinklist["led2010-" + x + "-oafault"].color)  ;	
					}else if ( json["slot" + x]["oafault"] == "off" ) {
						$("#led2010-" + x + "-oafault").css("fill", oacglobals["mdgrey"]  );
					}else {
						//undefined
					}
					if ( json["slot" + x]["oos"] == "on" ) { 
						$("#led2010-" + x + "-oos").css("fill", blinklist["led2010-" + x + "-oos"].color)  ;	
					}else if ( json["slot" + x]["oos"] == "off" ) {
						$("#led2010-" + x + "-oos").css("fill", oacglobals["mdgrey"] );
					}else {
						//undefined
					}					
				}// if 2010
			}// for loop
		}// end function

		


		function process_7300Data(json){
		// taking in json data from snmpget done by backend php via ajax
//alert("process7300data");
		//logDebug(json);
		for ( var slot in json ) {
			//logDebug(item);
//alert("porc7300data slot= " + slot );
			if ( json[ slot ][ "name" ] === oacglobals["svg7300name"]) {
//alert("porc7300data name= " + oacglobals["svg7300name"] );

// 	amber = right green = left!!!	amber= off green=  off 	No link is established, and management software has configured service on this link.
// 							amber= off green=  on 	A physical link might be available, but management software has taken this port out of service.
// 							amber= on green=  off 	A link has been configured and established, and no traffic is present.
// 							amber= on green=  on 		Not defined.
				for (var i=0; i < 28; i++ ) {
					// loop through inband ports
					var slotnum = slot.replace('slot', ''); 
//alert("looping i = " + i);
					//logDebug("item " + item + "   slotnum " + slotnum) ;
					// NOTE: these 26 and 27 are bicolor LEDs - for now using flat colors on screen as there is only one original color
					if ( i >= 26 ) {  // ports 26 and 27 behave just like an led on the 1900A - only 1 led
						if ( json[ slot ]["port" + i ]["link"] == "down" && json[ slot ]["port" + i ]["cnf"] == "down") {
							$("#led7300-" + slotnum + "-" + i ).css("fill", oacglobals["mdgrey"] );
						}else if ( json[ slot ]["port" + i ]["link"] == "up" &&  json[ slot ]["port" + i ]["cnf"] == "up" ) {
							$("#led7300-" + slotnum + "-" + i ).css("fill", oacglobals["green"] );
						}else if ( json[ slot ]["port" + i ]["link"] == "down" &&  json[ slot ]["port" + i ]["cnf"] == "up" ) {
							$("#led7300-" + slotnum + "-" + i ).css("fill", oacglobals["amber"] ); 
						}else {
							$("#led7300-" + slotnum + "-" + i ).css("fill", oacglobals["white"] ); 
							alert(" process7300data:slot " + slotnum + " bad port " + i + " state, link = " + json[ slot ]["port" + i ]["link"] + " config = " + json[ slot ]["port" + i ]["cnf"] );
						}
					} else {  // RJ45 link lights
						if ( json[ slot ]["port" + i ]["link"] == "down" && json[ slot ]["port" + i ]["cnf"] == "down" ) {
							$("#led7300-" + slotnum + "-" + i + "l" ).css("fill", oacglobals["mdgrey"] );
							$("#led7300-" + slotnum + "-" + i + "r" ).css("fill", oacglobals["mdgrey"] );
						}else if ( json[ slot ]["port" + i ]["link"] == "up" &&  json[ slot ]["port" + i ]["cnf"] == "up" ) {
							$("#led7300-" + slotnum + "-" + i + "l" ).css("fill", blinklist["led7300-" + slotnum + "-" + i + "l" ].color ); // green
							$("#led7300-" + slotnum + "-" + i + "r" ).css("fill", blinklist["led7300-" + slotnum + "-" + i + "r" ].color ); // amber
						}else if (json[ slot ]["port" + i ]["link"] == "down" &&  json[ slot ]["port" + i ]["cnf"] == "up"){
							$("#led7300-" + slotnum + "-" + i + "l" ).css("fill", oacglobals["mdgrey"] );	// some unknown state
							$("#led7300-" + slotnum + "-" + i + "r" ).css("fill", blinklist["led7300-" + slotnum + "-" + i + "r" ].color ); // amber
						}else{
							$("#led7300-" + slotnum + "-" + i + "l" ).css("fill", oacglobals["white"] );	// some unknown state
							$("#led7300-" + slotnum + "-" + i + "r" ).css("fill", oacglobals["white"] );	
							alert(" process7300data:slot " + slotnum + " bad port " + i + " state, link = " + json[ slot ]["port" + i ]["link"] + " config = " + json[ slot ]["port" + i ]["cnf"] );
						}
					}
				}// for loop
				// eth0  "led7300-6-oobl"
				if ( json[ slot ]["eth0"]["link"] == "down" && json[ slot ]["eth0"]["cnf"] == "down" ) {
					$("#led7300-" + slotnum + "-oobl" ).css("fill", oacglobals["mdgrey"] );
					$("#led7300-" + slotnum + "-oobr" ).css("fill", oacglobals["mdgrey"] );
				}else if ( json[ slot ]["eth0"]["link"] == "up" &&  json[ slot ]["eth0"]["cnf"] == "up" ) {
					$("#led7300-" + slotnum + "-oobl"  ).css("fill", blinklist["led7300-" + slotnum + "-oobl" ].color ); // green
					$("#led7300-" + slotnum + "-oobr"  ).css("fill", blinklist["led7300-" + slotnum + "-oobr" ].color ); // amber
				}else if (json[ slot ]["eth0"]["link"] == "down" &&  json[ slot ]["eth0"]["cnf"] == "up"){
					$("#led7300-" + slotnum + "-oobl"  ).css("fill", oacglobals["mdgrey"] );	// some unknown state
					$("#led7300-" + slotnum + "-oobr" ).css("fill", blinklist["led7300-" + slotnum + "-oobr" ].color ); // amber
				}else{
					$("#led7300-" + slotnum + "-oobl"  ).css("fill", oacglobals["white"] );	// some unknown state
					$("#led7300-" + slotnum + "-oobr"  ).css("fill", oacglobals["white"] );	
alert(" process7300data:slot " + slotnum + " bad port eth0  state, link = " + json[ slot ]["eth0" ]["link"] + " config = " + json[ slot ]["eth0" ]["cnf"] );
				}
				// eth1  "led7300-6-oobl"
				if ( json[ slot ]["eth1"]["link"] == "down" && json[ slot ]["eth1"]["cnf"] == "down" ) {
					$("#led7300-" + slotnum + "-e1" ).css("fill", oacglobals["mdgrey"] );
				}else if ( json[ slot ]["eth1"]["link"] == "up" &&  json[ slot ]["eth1"]["cnf"] == "up" ) {
					$("#led7300-" + slotnum + "-e1"  ).css("fill", blinklist["led7300-" + slotnum + "-e1"  ].color ); // green
				}else if (json[ slot ]["eth1"]["link"] == "down" &&  json[ slot ]["eth1"]["cnf"] == "up"){
					$("#led7300-" + slotnum + "-e1"  ).css("fill", oacglobals["amber"] );	// some unknown state
				}else{
					$("#led7300-" + slotnum + "-e1"  ).css("fill", oacglobals["red"] );	// some unknown state
alert(" process7300data:slot " + slotnum + " bad port eth1  state, link = " + json[ slot ]["eth1" ]["link"] + " config = " + json[ slot ]["eth1" ]["cnf"] );
				}
				// eth2  "led7300-6-oobl"
				if ( json[ slot ]["eth2"]["link"] == "down" && json[ slot ]["eth2"]["cnf"] == "down" ) {
					$("#led7300-" + slotnum + "-e2" ).css("fill", oacglobals["mdgrey"] );
				}else if ( json[ slot ]["eth2"]["link"] == "up" &&  json[ slot ]["eth2"]["cnf"] == "up" ) {
					$("#led7300-" + slotnum + "-e2"  ).css("fill", blinklist["led7300-" + slotnum + "-e2"   ].color ); // green
				}else if (json[ slot ]["eth2"]["link"] == "down" &&  json[ slot ]["eth2"]["cnf"] == "up"){
					$("#led7300-" + slotnum + "-e2"  ).css("fill", oacglobals["amber"] );	// some unknown state
				}else{
					$("#led7300-" + slotnum + "-e2"  ).css("fill", oacglobals["red"] );	// some unknown state
alert(" process7300data:slot " + slotnum + " bad port eth2  state, link = " + json[ slot ]["eth2" ]["link"] + " config = " + json[ slot ]["eth2" ]["cnf"] );
				}
				// console
				if ( json[ slot ]["console"]["link"] == "down" && json[ slot ]["console"]["cnf"] == "down" ) {
					$("#led7300-" + slotnum + "-consolel" ).css("fill", oacglobals["mdgrey"] );
					$("#led7300-" + slotnum + "-consoler" ).css("fill", oacglobals["mdgrey"] );
				}else if ( json[ slot ]["console"]["link"] == "up" &&  json[ slot ]["console"]["cnf"] == "up" ) {
					$("#led7300-" + slotnum + "-consolel"  ).css("fill", blinklist["led7300-" + slotnum + "-consolel"].color ); // green
					$("#led7300-" + slotnum + "-consoler"  ).css("fill", oacglobals["amber"] );
				}else if (json[ slot ]["console"]["link"] == "down" &&  json[ slot ]["console"]["cnf"] == "up"){
					$("#led7300-" + slotnum + "-consolel"  ).css("fill", oacglobals["mdgrey"] );	// some unknown state
					$("#led7300-" + slotnum + "-consoler" ).css("fill", oacglobals["amber"] );
				}else{
					$("#led7300-" + slotnum + "-consolel"  ).css("fill", oacglobals["red"] );	// some unknown state
					$("#led7300-" + slotnum + "-consoler"  ).css("fill", oacglobals["red"] );	
alert(" process7300data:slot " + slotnum + " bad port console  state, link = " + json[ slot ]["console" ]["link"] + " config = " + json[ slot ]["console" ]["cnf"] );
				}
				
				
				
				if ( json[ slot ]["ext"] == "on" ) {
					$("#led7300-" + slotnum + "-ext").css("fill", blinklist["led7300-" + slotnum + "-ext"].color );      
				}else if ( json[ slot ]["ext"] == "off" ) {
					$("#led7300-" + slotnum + "-ext").css("fill", oacglobals["mdgrey"] );       
				}else {
					$("#led7300-" + slotnum + "-ext").css("fill", oacglobals["white"] ); //some unknown state     
				}
				if ( json[ slot ]["int"] == "on" ) {
					$("#led7300-" + slotnum + "-int").css("fill", blinklist["led7300-" + slotnum + "-int"].color );   
				}else if ( json[ slot ]["int"] == "off" ) {
					$("#led7300-" + slotnum + "-int").css("fill", oacglobals["mdgrey"] );       
				}else {
					$("#led7300-" + slotnum + "-int").css("fill", oacglobals["white"] ); //some unknown state     
				}  
				if ( json[ slot ]["svc"] == "on" ) {
					$("#led7300-" + slotnum + "-svc").css("fill", blinklist["led7300-" + slotnum + "-svc"].color );      
				}else if ( json[ slot ]["svc"] == "off" ) {
					$("#led7300-" + slotnum + "-svc").css("fill", oacglobals["mdgrey"] );       
				}else {
					$("#led7300-" + slotnum + "-svc").css("fill", oacglobals["white"] ); //some unknown state     
				} 
				if ( json[ slot ]["sys"] == "on" ) {
					$("#led7300-" + slotnum + "-sys").css("fill", blinklist["led7300-" + slotnum + "-sys"].color );      
				}else if ( json[ slot ]["sys"] == "off" ) {
					$("#led7300-" + slotnum + "-sys").css("fill", oacglobals["mdgrey"] );       
				}else {
					$("#led7300-" + slotnum + "-sys").css("fill", oacglobals["white"] ); //some unknown state     
				} 
//alert(" process7300 sys colr is " + 	blinklist["led7300-" + slotnum + "-sys"].color );			
				if ( json[ slot ]["healthy"] == "on" ) {
					$("#led7300-" + slotnum + "-healthy").css("fill", blinklist["led7300-" + slotnum + "-healthy"].color );      
				}else if ( json[ slot ]["healthy"] == "off" ) {
					$("#led7300-" + slotnum + "-healthy").css("fill", oacglobals["mdgrey"] );       
				}else {
					$("#led7300-" + slotnum + "-healthy").css("fill", oacglobals["white"] ); //some unknown state     
				} 
				if ( json[ slot ]["ok"] == "on" ) {
					$("#led7300-" + slotnum + "-ok").css("fill", blinklist["led7300-" + slotnum + "-ok"].color );     
				}else if ( json[ slot ]["ok"] == "off" ) {
					$("#led7300-" + slotnum + "-ok").css("fill", oacglobals["mdgrey"] );       
				}else {
					$("#led7300-" + slotnum + "-ok").css("fill", oacglobals["white"] ); //some unknown state     
				} 
				// leave clk and hot alone to be handled elsewhere
			}
		}
	}


		function processSlotData(json){
		// take in json 
		//  just to see whats registered in the slot by the shmc
		// the board may actually be gone, or in an intermediate state
		// first display correct board by slot
//alert("processlotdata slot8 name " + json["slot8"]["name"] );
//alert("processlotdata rfan mstate " + json["chassis"]["rfan"]['mstate'] );
//document.getElementById("debugdiv").innerHTML += (".... " + JSON.stringify(json)) ;
			for (var i = 1; i < 9; i++) {
			
				var slot = "slot" + i ;
				//  check for totally out of bounds data or empty xml elements
				var boardname = json[slot]["name"] || null;
				//alert("procslotdata slot = " + slot + " board = " + boardname);	
				if ( boardname == null ) {
	//alert("bdname null slot: " + slot);
					popSlotEmpty( i, "none" );  //no board
					continue;
				}
				var mstate = json[slot]["mstate"] || null;
				if ( mstate == null ) {
					alert("mstate is null slot: " + slot);
					popSlotEmpty( i, "none" );  //no board
					continue;
				}
				// now go to work with proper data
//alert("processesslotdata: slot, board, mstate " + slot + " " + boardname + " " + mstate);				
				if ( validateBoardName( boardname ) == true ){
//if (slot == 7 || slot == 8) {alert("procslotdata slot = " + slot + " board = " + boardname);	}
						setBoardState( i, boardname, mstate );						
//alert("processslotdata json slot,mstate= "+ slot + " " + json[slot]["mstate"] );				
					continue;
				}else if( boardname === 'N/A' ) { 	//special M state	
//alert("processslotdata board ejct");			
					setBoardEjectState( i ); 
					continue;
				}else if ( mstate < 8 ){
//alert("processslotdata board unknown baord: " + boardname);
//alert("processslotdata bad bioardname " + boardname);
					setBoardState( i, "unknown: " + boardname, mstate );  //name out of bounds, but there is an mstate
					continue;
				}else{
//alert("processslotdata  popslot empty");
					popSlotEmpty( i, boardname  );  //last resort
					continue;
				}
			}// for loop
			// do chassis fans
//alert("processlotdata rfan mstate " + json["chassis"]["rfan"]['mstate']  + "lfan mstate " + json["chassis"]["lfan"]['mstate']);
			if ( json["chassis"]["rfan"]["serial"] !== null ) { 
				setFanMstate("rfan", json["chassis"]["rfan"]["mstate"] );
			}
			//alert("called setfanstate for rfan");
			if ( json["chassis"]["lfan"]["serial"] !== null ) { 
				setFanMstate("lfan", json["chassis"]["lfan"]["mstate"] );
			}
				//alert("called setfanstate for lfan");	

				//alert("called setpemstate for lpem");	
			if ( json["chassis"]["lpem"]["serial"] !== null ) { //
				setPemMstate("lpem", json["chassis"]["lpem"]["mstate"] );
				
			}
			if ( json["chassis"]["rpem"]["serial"] !== null ) {
				setPemMstate("rpem", json["chassis"]["rpem"]["mstate"] );
				
			}
			
			//alert("called setfanstate for rfan");
			
			return true;
		}

		function setFanMstate(fan, mstate){
		/*M0 No power and hot swap handle open
			M1 No communications. (Wait in M1 until hot swap ejector is closed)
			M2 FRU announces its presence to the ShMC and awaits activation permission
			M3 Activation
			M4 Operational state (command issued to enable backend power)
			M5 Deactivation request (e.g. hot swap ejector opened)
			M6 Deactivation granted by ShMC
			M7 Unexpected loss of communication between FRU and ShMC */  
			// animate fans pulled out or not present
//alert("processFanMstate fan = " + fan + " mstate = " + mstate);	
			switch( mstate) {	
				case "0":   // blue LED off, no glow, eject on
					//alert("processFanMstate fan = " + fan + " mstate = " + mstate);
					$("#2000-" + fan + "-ejectgroup").css("opacity", 0 );
					$("#2000-" + fan + "-glow").css("stroke", blinklist["2000-" + fan + "-glow"].color );
					blinklist["2000-" + fan + "-glow"].blinkcolor =  blinklist["2000-" + fan + "-glow"].color ; 	// reset to default						
					blinklist ["2000-" + fan + "-glow"].blink = false;
					$("#led2000-" + fan + "-hot").css("fill", blinklist["led2000-" + fan + "-hot"].color ) ;
				break;
				case "1":   // blue LED on, ltblue glow on, eject on
					$("#2000-" + fan + "-ejectgroup").css("opacity", 0.5 );
					$("#2000-" + fan + "-glow").css("stroke", oacglobals["ltblue"]);
					blinklist["2000-" + fan + "-glow"].blinkcolor =  blinklist["2000-" + fan + "-glow"].color; 	// reset to default						
					blinklist ["2000-" + fan + "-glow"].blink = false;					
					$("#led2000-" + fan + "-hot").css("fill", blinklist["led2000-" + fan + "-hot"].color) ;
					blinklist ["led2000-" + fan + "-hot"].blink = false;
					//alert("processFanMstate fan = " + fan + " mstate = " + mstate);	
				break;
				case "2":   // blue LED blink, ltblue glow blinks, fully visible
					$("#2000-" + fan + "-ejectgroup").css("opacity", 0.5 );
					$("#2000-" + fan + "-glow").css("stroke", oacglobals["ltblue"]);
					blinklist ["2000-" + fan + "-glow"].blinkcolor = oacglobals["ltblue"];
					blinklist ["2000-" + fan + "-glow"].blink = true;					
					$("#led2000-" + fan + "-hot").css("fill", blinklist["led2000-" + fan + "-hot"].color );
					blinklist ["led2000-" + fan + "-hot"].blink = true;					
					//alert("processFanMstate fan = " + fan + " mstate = " + mstate);	
				break;
				case "3":   // blue LED off, ltblue glow blinks
					$("#2000-" + fan + "-ejectgroup").css("opacity", 0.5 );
					$("#2000-" + fan + "-glow").css("stroke", oacglobals["ltblue"]);
					blinklist ["2000-" + fan + "-glow"].blinkcolor = oacglobals["ltblue"];
					blinklist ["2000-" + fan + "-glow"].blink = true;					
					//alert("processFanMstate fan = " + fan + " mstate = " + mstate);	
				break;
				case "4":   // blue LED off, no glow
					$("#2000-" + fan + "-ejectgroup").css("opacity", 1 );
					$("#2000-" + fan + "-glow").css("stroke", blinklist["2000-" + fan + "-glow"].color );
					blinklist["2000-" + fan + "-glow"].blinkcolor =  blinklist["2000-" + fan + "-glow"].color ; 	// reset to default						
					blinklist ["2000-" + fan + "-glow"].blink = false;	
					$("#led2000-" + fan + "-hot").css("fill", oacglobals["mdgrey"]) ;
					blinklist ["led2000-" + fan + "-hot"].blink = false;		
					//alert("processFanMstate fan = " + fan + " mstate = " + mstate);	
				break;
				case "5":   // blue LED blink, blue glow blink, eject state on
//alert("processFanMstate fan = " + fan + " mstate = " + mstate);	
					$("#2000-" + fan + "-ejectgroup").css("opacity", 0.5 );	
					$("#2000-" + fan + "-glow").css("stroke", oacglobals["blue"]);
					blinklist ["2000-" + fan + "-glow"].blinkcolor = oacglobals["blue"];
					blinklist ["2000-" + fan + "-glow"].blink = true;					
					$("#led2000-" + fan + "-hot").css("fill", blinklist["led2000-" + fan + "-hot"].color );
					blinklist ["led2000-" + fan + "-hot"].blink = true;		
//alert("processFanMstate fan = " + fan + " mstate = " + mstate);	
				break;
				case "6":   // blue LED blink, blue glow blink, set eject on
					$("#2000-" + fan + "-ejectgroup").css("opacity", 0.5 );
					$("#2000-" + fan + "-glow").css("stroke", oacglobals["blue"]);
					blinklist ["2000-" + fan + "-glow"].blinkcolor = oacglobals["blue"];
					blinklist ["2000-" + fan + "-glow"].blink = true;					
					$("#led2000-" + fan + "-hot").css("fill", blinklist["led2000-" + fan + "-hot"].color );
					blinklist ["led2000-" + fan + "-hot"].blink = true;	
					//alert("processFanMstate fan = " + fan + " mstate = " + mstate);	
				break;
				case "7":   //  red glow. no hot led blink, set eject on
					$("#2000-" + fan + "-ejectgroup").css("opacity", 0 );
					$("#2000-" + fan + "group").css("opacity", 0 );
					$("#2000-" + fan + "-glow").css("stroke", oacglobals["red"]);
					blinklist["2000-" + fan + "-glow"].blinkcolor =  blinklist["2000-" + fan + "-glow"].color ; 	// reset to default					
					blinklist ["2000-" + fan + "-glow"].blink = false;					
					$("#led2000-" + fan + "-hot").css("fill", blinklist["led2000-" + fan + "-hot"].color );
					blinklist ["led2000-" + fan + "-hot"].blink = false;
					//alert("processFanMstate fan = " + fan + " mstate = " + mstate);	
				break;		
			}
			return true;
		} //end func
		
		
		function setPemMstate(pem, mstate){
			// animate pems pulled out or not present
			// NOTE: ejectgroups on PEMs are just a rect, not really a group, and they are just a shade
			//       when the pem is going down the shade is drawn at 50% to grey out pem
			//       when going up the shade is 0%
			// NOTE: PEMs may be invisible by default and only appear if out of Mstate4	
//alert("setpemstate Mstate= " + mstate + " pem = " + pem );
			switch( mstate) {	
				case "0":   // blue LED off, no glow, eject on
					$("#2000-" + pem + "group").css("visibility", "hidden" );
					$("#2000-" + pem + "-ejectgroup").css("opacity", 0 );
					$("#2000-" + pem + "-glow").css("stroke", blinklist["2000-" + pem + "-glow"].color );
					blinklist["2000-" + pem + "-glow"].blinkcolor =  blinklist["2000-" + pem + "-glow"].color ; 	// reset to default						
					blinklist ["2000-" + pem + "-glow"].blink = false;
					$("#led2000-" + pem + "-hot").css("fill", blinklist["led2000-" + pem + "-hot"].color ) ;
				break;
				case "1":   // blue LED on, ltblue glow on, eject on
					$("#2000-" + pem + "group").css("visibility", "visible" );
					$("#2000-" + pem + "-ejectgroup").css("opacity", 0.5 );
					$("#2000-" + pem + "-glow").css("stroke", oacglobals["ltblue"]);
					blinklist["2000-" + pem + "-glow"].blinkcolor =  blinklist["2000-" + pem + "-glow"].color; 	// reset to default						
					blinklist ["2000-" + pem + "-glow"].blink = false;					
					$("#led2000-" + pem + "-hot").css("fill", blinklist["led2000-" + pem + "-hot"].color) ;
					blinklist ["led2000-" + pem + "-hot"].blink = false;
				break;
				case "2":   // blue LED blink, ltblue glow blinks, fully visible
					$("#2000-" + pem + "group").css("visibility", "visible" );
					$("#2000-" + pem + "-ejectgroup").css("opacity", 0.5 );
					$("#2000-" + pem + "-glow").css("stroke", oacglobals["ltblue"]);
					blinklist ["2000-" + pem + "-glow"].blinkcolor = oacglobals["ltblue"];
					blinklist ["2000-" + pem + "-glow"].blink = true;					
					$("#led2000-" + pem + "-hot").css("fill", blinklist["led2000-" + pem + "-hot"].color );
					blinklist ["led2000-" + pem + "-hot"].blink = true;					
				break;
				case "3":   // blue LED off, ltblue glow blinks
					$("#2000-" + pem + "group").css("visibility", "visible" );
					$("#2000-" + pem + "-ejectgroup").css("opacity", 0.5 );
					$("#2000-" + pem + "-glow").css("stroke", oacglobals["ltblue"]);
					blinklist ["2000-" + pem + "-glow"].blinkcolor = oacglobals["ltblue"];
					blinklist ["2000-" + pem + "-glow"].blink = true;					
				break;
				case "4":   // blue LED off, no glow
					if ( oacglobals["pem_visible"] == false ) {				
						$("#2000-" + pem + "group").css("visibiilty", "hidden" );
					}else {
						$("#2000-" + pem + "group").css("visibiilty", "visible" );						
					}
					$("#2000-" + pem + "-ejectgroup").css("opacity", 0 );
					$("#2000-" + pem + "-glow").css("stroke", blinklist["2000-" + pem + "-glow"].color );
					blinklist["2000-" + pem + "-glow"].blinkcolor =  blinklist["2000-" + pem + "-glow"].color ; 	// reset to default						
					blinklist ["2000-" + pem + "-glow"].blink = false;	
					$("#led2000-" + pem + "-hot").css("fill", oacglobals["mdgrey"]) ;
					blinklist ["led2000-" + pem + "-hot"].blink = false;		
					//alert("processpemMstate pem = " + pem + " mstate = " + mstate);	
				break;
				case "5":   // blue LED blink, blue glow blink, eject state on
					$("#2000-" + pem + "group").css("visibility", "visible" );
					$("#2000-" + pem + "-ejectgroup").css("opacity", 0.5 );	// 
					$("#2000-" + pem + "-glow").css("stroke", oacglobals["blue"]);
					blinklist ["2000-" + pem + "-glow"].blinkcolor = oacglobals["blue"];
					blinklist ["2000-" + pem + "-glow"].blink = true;					
					$("#led2000-" + pem + "-hot").css("fill", blinklist["led2000-" + pem + "-hot"].color );
					blinklist ["led2000-" + pem + "-hot"].blink = true;		
				break;
				case "6":   // blue LED blink, blue glow blink, set eject on
					$("#2000-" + pem + "group").css("visibility", "visible" );
					$("#2000-" + pem + "-ejectgroup").css("opacity", 0.5 );
					$("#2000-" + pem + "-glow").css("stroke", oacglobals["blue"]);
					blinklist ["2000-" + pem + "-glow"].blinkcolor = oacglobals["blue"];
					blinklist ["2000-" + pem + "-glow"].blink = true;					
					$("#led2000-" + pem + "-hot").css("fill", blinklist["led2000-" + pem + "-hot"].color );
					blinklist ["led2000-" + pem + "-hot"].blink = true;	
					//alert("processpemMstate pem = " + pem + " mstate = " + mstate);	
				break;
				case "7":   //  red glow. no hot led blink, set eject on
					$("#2000-" + pem + "group").css("visibility", "visible" ); //so we can see glow only
					$("#2000-" + pem + "-ejectgroup").css("opacity", 0 );
					$("#2000-" + pem + "group").css("opacity", 0 );
					$("#2000-" + pem + "-glow").css("stroke", oacglobals["red"]);
					blinklist["2000-" + pem + "-glow"].blinkcolor =  blinklist["2000-" + pem + "-glow"].color ; 	// reset to default					
					blinklist ["2000-" + pem + "-glow"].blink = false;					
					$("#led2000-" + pem + "-hot").css("fill", blinklist["led2000-" + pem + "-hot"].color );
					blinklist ["led2000-" + pem + "-hot"].blink = false;
					//alert("processpemMstate pem = " + pem + " mstate = " + mstate);	
				break;		
			}
			return true;
		} //end func		
		

		function processChassisData(json){
			// take care of six fan LEDs
			if ( json[ "chassis" ]["lfan"]["hot"] == "on" ) {
				$("#led2000-lfan-hot").css("fill", blinklist["led2000-lfan-hot"].color );      
			}else if  ( json[ "chassis" ]["lfan"]["hot"] == "off" ){
				$("#led2000-lfan-hot").css("fill", oacglobals["mdgrey"]);	
			}
			if ( json[ "chassis" ]["rfan"]["hot"] == "on" ) {
				$("#led2000-rfan-hot").css("fill", blinklist["led2000-rfan-hot"].color );      
			}else if  ( json[ "chassis" ]["rfan"]["hot"] == "off" ){
				$("#led2000-rfan-hot").css("fill", oacglobals["mdgrey"]);	
			}
			if ( json[ "chassis" ]["lfan"]["warn"] == "on" ) {
				$("#led2000-lfan-warn").css("fill", blinklist["led2000-lfan-warn"].color );      
			}else if  ( json[ "chassis" ]["lfan"]["warn"] == "off" ){
				$("#led2000-lfan-warn").css("fill", oacglobals["mdgrey"]);	
			}
			if ( json[ "chassis" ]["rfan"]["warn"] == "on" ) {
				$("#led2000-rfan-warn").css("fill", blinklist["led2000-rfan-warn"].color );      
			}else if  ( json[ "chassis" ]["rfan"]["warn"] == "off" ){
				$("#led2000-rfan-warn").css("fill", oacglobals["mdgrey"]);	
			}
			if ( json[ "chassis" ]["lfan"]["ok"] == "on" ) {
				$("#led2000-lfan-ok").css("fill", blinklist["led2000-lfan-ok"].color );      
			}else if  ( json[ "chassis" ]["lfan"]["ok"] == "off" ){
				$("#led2000-lfan-ok").css("fill", oacglobals["mdgrey"]);	
			}
			if ( json[ "chassis" ]["rfan"]["ok"] == "on" ) {
				$("#led2000-rfan-ok").css("fill", blinklist["led2000-rfan-ok"].color );      
			}else if  ( json[ "chassis" ]["rfan"]["ok"] == "off" ){
				$("#led2000-rfan-ok").css("fill", oacglobals["mdgrey"]);	
			}
			
		}// end func
		
		function validateBoardName(name){
			// check name to see if its valid
//alert("validateboardname");
			if ( name === oacglobals["svg2010name"] || name === oacglobals["svg7300name"] || name === oacglobals["svgsbcname"]  ){
				return true;
			}else{
				return name ;
			}
		}
		


		function setBoardState(slot, board, mstate){
			/*M0 No power and hot swap handle open
			M1 No communications. (Wait in M1 until hot swap ejector is closed)
			M2 FRU announces its presence to the ShMC and awaits activation permission
			M3 Activation
			M4 Operational state (command issued to enable backend power)
			M5 Deactivation request (e.g. hot swap ejector opened)
			M6 Deactivation granted by ShMC
			M7 Unexpected loss of communication between FRU and ShMC */   
//alert("setboardstate start");			
//if (slot == 7 || slot ==8){alert("setboardstate " + board + " mstate " + mstate + " slot "  + slot);}
			if ( isNaN( mstate ) ){
				alert( "setBoardState NaN error mstate = " + mstate);
			}
			switch( mstate) {	// change LED colors and hot swap LED color see ATCA spec
				case "0":   // blue LED off empty slot
					popSlotEmpty( slot, board  );
					if (  validateBoardName(board) == true ){
						document.getElementById("slot" + slot + "notify").innerHTML = (board + " M0(0): Board removed!") ;
					}else{
						document.getElementById("tempnotify").innerHTML = ("Slot " + slot + " now empty." ) ;
					}
					break;	  
				case "1":	// blue LED on, glow = ltblue + no blink
							//alert("case 1: slot,board,mstate: " + slot + " " + board + " " + mstate);
					if (  validateBoardName(board) == true ){
						if ( board === oacglobals["svg2010name"] ) {
							$("#" + board + "-" + slot + "group").css("visibility", "hidden"  ) ;	// well we know it has to be a switch
							//$("#led" + board + "-" + slot + "group").css("opacity", 1  ) ;				// reset
							$("#" + board + "-" + slot + "-ejectgroup").css("opacity", 0.5  ) ;		// we want to see it greyed out

						}else {
							$("#" + board + "-" + slot + "-ejectgroup").css("opacity", 0  ) ;
						}

						$("#led" + board + "-" + slot + "-hot").css("fill", blinklist["led" + board + "-" + slot + "-hot"].color   ) ;
						$("#" + board + "-" + slot + "-glow").css("stroke", oacglobals["ltblue"])
						blinklist [ "led" + board + "-" + slot + "-hot" ].blink = false ;
						blinklist [  board + "-" + slot + "-glow" ].blink = false ;
						document.getElementById("slot" + slot + "notify").innerHTML = ( " M1(1): No communication.") ;
						document.getElementById("tempnotify").innerHTML = ("A board " + board + " appears to be in slot " + slot + "."  ) ;
						popSlot(slot, board);
					}else {
						// error?
					}
					break;	  
				case "2":	// blue LED blink ltblue glow blinks
					if (  validateBoardName(board) == true ){
						boardStartingUp(board, slot, mstate);	
						popSlot(slot, board);
					}else {
						// error?
					}
					break;	  
				case "3":	// blue LED off ltblue glow blinks
					if (  validateBoardName(board) == true ){
						boardStartingUp(board, slot, mstate);
						popSlot(slot, board);
					}else {
						// error?
					}
					break;	  
				case "4":	// blue LED off // ejectboard states off ... no glow
					// we think the slot was occupied before ( eventually we'll know for sure with hardware history )
//alert("start case4 " + board + " slot: " + slot );
					if (  validateBoardName(board) == true ){
						var glowcolor = $("#" + board + "-" + slot + "-glow").css("stroke") ;
//alert(board + " slot " + slot +" glowcolor " + glowcolor );
						if (  blinklist [  board + "-" + slot + "-glow" ].blink === true ) {   // if there is a blinking glow
//alert("blinking glow");
							boardInService(board,slot);
							popSlot(slot, board);
							break;
						}else if (  glowcolor !== oacglobals["defaultglow"]){ // if glow is a color
	//alert("glowcolor has been changed");
							boardInService(board,slot);
							popSlot(slot, board);
							break;
						}else { 	// this is just a board continuing to work correctly
							popSlot(slot, board);
							$("#led" + board + "-" + slot + "-hot").css("fill", oacglobals["mdgrey"]) ;
	//alert("normal case4 popslot " + board + " slot: " + slot);
							break;
						}
					}else {
						alert("setboardstate case4 Error: bad board name: " + board);
						// error?
					}
				break;
				case "5":	// blue LED blink  blue glow blink
//if(slot == 7 || slot == 8){alert("setboardstate case 5 board = " + board + " slot " + slot);}
					if (  validateBoardName(board) == true ){
//if(slot == 7 || slot == 8){alert("setboardstate case 5 board after validation= " + board + " slot " + slot);}						
						setBoardEjectState( board, slot, mstate );
						$("#led" + board + "-" + slot + "-hot").css("fill", blinklist [ "led" + board + "-" + slot + "-hot" ].color ) ;
						blinklist [ "led" + board + "-" + slot + "-hot" ].blink = true ;
						popSlot(slot, board);
					}else {
						// error?
					}
				break;	  
				case "6": // blue LED blink but setboardblack blue glow blinks
					if (  validateBoardName(board) == true ){
						boardOutOfService(board, slot, mstate);
						$("#led" + board + "-" + slot + "-hot").css("fill", blinklist [ "led" + board + "-" + slot + "-hot" ].color ) ;	  
						blinklist [ "led" + board + "-" + slot + "-hot" ].blink = true ;
					}else {
						// error?
					}
				break;	  
				case "7": // blue LED no change // sometimes reached if board is yanked without waiting
						// red glow
					//alert("m7  board " + board + "  slot " + slot);
					if (  validateBoardName(board) == true ){
						setBoardUnknownState(board,  slot, mstate);
						popSlot(slot, board);
					}else {
						// error?
					}
				break;	  
				default : //error condition
					alert("setBoardsState: mstate not in bounds = " + mstate);
					document.getElementById("tempnotify").innerHTML = ("Slot " + slot + " has error." ) ;
				break;	  
			}
//alert("retn true");
			return true;
		}


		function setBoardEjectState( board, slot, mstate ) {
			//  turn off lettering to make it generic
			// then set LEDs to indicate ejector open
//alert("setbrdejstate board,slot,mstate " + board + " " + slot + " " + mstate);
				$('#' + board + "-" + slot + "-ejectgroup").css("opacity", 0.5 );
				 $("#" + board + "-" + slot + "-glow").css("stroke", oacglobals["blue"]);	
				 blinklist [ board + "-" + slot + "-glow" ].blinkcolor = oacglobals["blue"];
				blinklist [ board + "-" + slot + "-glow" ].blink = true;
				document.getElementById("tempnotify").innerHTML = (board + "in slot "+ slot + " mstate " + mstate + ": Ejector lever opened!") ;
		}

		function setBoardUnknownState( board,  slot, mstate ) {
			// use sbc graphic to repesent any board and turn off lettering to make it generic
			// then set LEDs to indicate unknown, bad state and blinking glow
				//alert("set unknown state" );  

		
			$('#' + board + '-' + slot + '-ejectgroup').css("opacity", 0 );
			$("#" + board + "-" + slot + "-glow").css("stroke", oacglobals["red"]) ;
			blinklist [ board + "-" + slot + "-glow" ].blink = false;
			document.getElementById("slot" + slot + "notify").innerHTML = ("mstate " + mstate + ": Unknown condition!") ;
			document.getElementById("tempnotify").innerHTML = ( "board unknown!" ) ;		
		}

		function boardOutOfService(board, slot, mstate){
		// LEDs are named led7300-2nnnn ledsbc-1nnnn where 1 & 2 or 3 are slot numbers and nnnn is unique
//alert("brdoutofservc start");
			document.getElementById("tempnotify").innerHTML = ("Board out of service!" ) ;
			document.getElementById("slot" + slot + "notify").innerHTML = ( board + ": " + mstate + " deactivation." ) ;
			blinklist [ board + "-" + slot + "-glow" ].blinkcolor = oacglobals["blue"];
			blinklist [ board + "-" + slot + "-glow" ].blink = true;
			//alert("board out of  board " + board + "  slot " + slot);
			
		}
		
		function boardStartingUp(board, slot, mstate){
			// use for M states 2,3
			
			// add blinking glow so M4 can tell when its the special case of incoming board
			//$( "#" + board + "-" + slot + "-glow" ).css("stroke", oacglobals["ltblue"]) ;
			blinklist [ board + "-" + slot + "-glow" ].blinkcolor = oacglobals["ltblue"];
			blinklist [ board + "-" + slot + "-glow" ].blink = true ;
			if (  validateBoardName(board) == true ){
				$('#' + board + '-' + slot + '-ejectgroup').css("opacity", 0.5 );	
			}
			if ( mstate === "2" ) {					
				$("#led" + board + "-" + slot + "-hot").css("fill", blinklist["led" + board + "-" + slot + "-hot"].color  ) ;
				blinklist [ "led" + board + "-" + slot + "-hot" ].blink = true ;
				document.getElementById("slot" + slot + "notify").innerHTML = (board + " M2(2): Fru present") ;
				document.getElementById("tempnotify").innerHTML = (board + " starting.");					
			}else if ( mstate === "3" ) {
				$("#led" + board + "-" + slot + "-hot").css("fill", oacglobals["mdgrey"]) ;
				blinklist [ "led" + board + "-" + slot + "-hot" ].blink = false ;
				document.getElementById("slot" + slot + "notify").innerHTML = (board + " M3(3): Board activation") ;				
				document.getElementById("tempnotify").innerHTML = (board + " starting.");
			}else{
					alert("boardStartingUp bad mstate = " + mstate);
			}
		}

		function boardInService(board,slot){
			// used when we think a transition has happened to a board
			// LEDs are named led7300-2nnnn ledsbc-1nnnn where 1 & 2 or 3 are slot numbers and nnnn is unique
//alert("start boardinservice");
			for( var name in blinklist){
				if ( name.match("led") && name.match(board) ){
					$("#" + name).css("fill", blinklist[ name ].color) ;   // return led to default color
				} else if ( name.match("glow") && name.match(board) ){
					$("#" + name).css("stroke", blinklist[ name ].color) ; // return glow to default color
				}
			}
			$("#led" + board + "-" + slot + "-hot").css("fill", oacglobals["mdgrey"]) ;
			$( "#" + board + "-" + slot + "-ejectgroup").css("opacity", 1 );
			blinklist [ "led" + board + "-" + slot + "-hot" ].blink = false ;
			blinklist [  board + "-" + slot + "-glow" ].blink = false ;
			document.getElementById("tempnotify").innerHTML = ("" ) ;
			document.getElementById("slot" + slot + "notify").innerHTML = (" ") ;	
		
//alert("end boardinservice");
			return true;
		}


		function popUp1900A(){
			//alert("popup1900a");
			//$('#1900Apopupgroup').css("opacity", 100 );
			$('#1900Apopupgroup').animate({svgTransform: 'translate(175,-800)',svgOpacity: 100}, 1000);
		}
		function popDown1900A(){
			//alert("popdown1900a");
			$('#1900Apopupgroup').css("opacity", 0 );

		}
		function floatMenu(menu, svg, topy, leftx  ) {
			invisbleMenus(oacglobals["last_menu"]);		// make the last menu invisible
			oacglobals["last_menu"] = menu ;	// reset the last_menu var to this menu
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
		function popSlot(slot, name){
		//alert("popslot start slot,name " + slot + " " + name);
			popSlotEmpty(slot, name); // reset maybe unecessary now?
			var xaxis = 0;
			var yaxis = 0 ;
			if (name === oacglobals["svg7300name"] ) {
				// NOTE:  the graphic is labeled upside down order compared to the sbc's
				$('#' + oacglobals["svg7300name"] + '-' + slot + 'group').css("visibility", "visible" );
				xaxis = -244 ;
				yaxis = -64 - (slot * 60) ;
		//alert("popslot 7300 - x,y " + xaxis + " " + yaxis);
				$('#' + oacglobals["svg7300name"] + '-' + slot + 'group').animate({svgTransform: 'translate(' + xaxis + ', ' +  yaxis + ')',svgOpacity: 1},  oacglobals["fly_duration"] + 4000);
			}else if ( name === oacglobals["svgsbcname"] ) {
				$('#' + oacglobals["svgsbcname"] + '-' + slot + 'group').css("visibility", "visible" );
				xaxis = -270;
				yaxis = 730 - (slot * 60) ;
				$('#' + oacglobals["svgsbcname"] + '-' + slot + 'group').animate({svgTransform: 'translate(' + xaxis + ', ' +  yaxis + ')',svgOpacity: 1},  oacglobals["fly_duration"] + 2000);
			}else if ( name === oacglobals["svg2010name"] ) {
				$('#' + oacglobals["svg2010name"] + '-' + slot + 'group').css("visibility", "visible" );
				if ( slot === 7 ){
					$('#' + oacglobals["svg2010name"] + '-7group').animate({svgTransform: 'translate(-58,-401)',svgOpacity: 1},  oacglobals["fly_duration"]);	
				}else if ( slot === 8 ){
					$('#' + oacglobals["svg2010name"] + '-8group').animate({svgTransform: 'translate(2,-495)',svgOpacity: 1},  oacglobals["fly_duration"]);			
				}else{
					//error
				}					
			}else {
				//later
			}
			return true;
		}
		

		
		function popSlotEmpty(slot, name){
//alert("popslotempty start slot,name " + slot + " " + name);			
			//$('#empty-3').css("visibility", "visible" );
			if (  validateBoardName(name) == true )	 {
				$('#' + name + '-' + slot + 'group').css("visibility", "hidden" );	
			}else {
				// in case of "N/A" or other bad name just make the slot look empty for all possibilities
				if (slot <7 ) {
					$('#sbc-' + slot + 'group').css("visibility", "hidden" );
					$('#7300-' + slot + 'group').css("visibility", "hidden" );				
				}else{
					$('#2010-' + slot + 'group').css("visibility", "hidden" );					
				}
			}
		}



		// Returns a random number between min and max
		function getRandomInteger(min, max){
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

  
//
// end of closure
//
})(jQuery);