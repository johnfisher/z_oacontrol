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
		var chassisnet = Object.create( {"shmm" :  {ip : ""	, pswd : "", serialnum : "" } }, {"base" :  {ip : ""	, pswd : "", serialnum : "" } }, {"fab" :  {ip : ""	, pswd : "", serialnum : "" } }, 
			{"slot1" :  {ip : ""	, pswd : "", serialnum : "" } }, {"slot2" :  {ip : ""	, pswd : "", serialnum : "" } }, {"slot3" :  {ip : ""	, pswd : "", serialnum : "" } },
			{"slot4" :  {ip : ""	, pswd : "", serialnum : "" } }, {"slot5" :  {ip : ""	, pswd : "", serialnum : "" } }, {"slot6" :  {ip : ""	, pswd : "", serialnum : "" } },
		{"slot7" :  {ip : ""	, pswd : "", serialnum : "" } }, {"slot8" :  {ip : ""	, pswd : "", serialnum : "" } } );

		var ltblue = "#90B2ED" ; //" or brightblue rgb(15, 247, 240)"; 
		var defaultglow = "rgb(59, 37, 7)";
		var white = "rgb(255, 255, 255)"; 
		var black = "rgb(0, 0, 0)";
		var blue =  "rgb(0, 0, 255)"; // BUG: #0000ff does not work in a === test!!!
		var green = "rgb(0, 255, 0)";
		var red = "rgb(255, 0, 0)";
		var amber =  "rgb(252, 184, 59)";
		var dkglow = "#3B2507" ;
		var ltglow = "#FCB83B" ;
		var hotorange = "#F0730E" ;  // use for over-temp animation
		var coolorange= "#623815";//or "#975118";
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
		var last_menu ;	//for tracking which menu to toggle
		var test_status = false ; // for turning on testing
		var default_data_src_str = "backend.php" ; // leave this set to the standard data src
		var default_data_src_base_url = 'http://' + document.domain + '/oac/' ; //always end in '/' !!
		var data_src_str = default_data_src_base_url + default_data_src_str ; // change this in auto-test code for testing
		var test_auto_dur = 1000 ; // very roughly seconds  for test animation loop
		var test_base_url = default_data_src_base_url + 'works_test/';
  		var test_default_data_src = "test_data.html"; // used for static test
		
		
		/// set up the initial web page  ////////////////////////////////////
		 $.fn.oac.setupPage = function setupPage(){
			
				// hide the 7300's and sbc's ///////////////////////////
				$('#7300-3group').css("opacity", 0 );
				$('#7300-4group').css("opacity", 0 );
				$('#7300-5group').css("opacity", 0 );
				$('#sbc-3group').css("opacity", 0 );
				$('#sbc-4group').css("opacity", 0 );
				$('#sbc-5group').css("opacity", 0 );
				// hide the popups ///////////////////////////
				$('#1900Apopupgroup').css("opacity", 0 );
				
			// grab the ip data for the links
			//// chain lots of stuff behind the var setting because it requires that these vars be set and the get takes quite a lot of time...///////////////////////
				$.get(data_src_str,  function(data){
						var json_data = $.parseJSON(data);
			//alert(JSON.stringify(json_data) );
						baseip = json_data["slot1"]["baseip"] ;
						fabip = json_data["slot1"]["fabip"] ;
						slot3ip = json_data["slot3"]["ip"] ;
						slot4ip = json_data["slot4"]["ip"] ;
						slot5ip = json_data["slot5"]["ip"] ;
						shmcip = json_data["shmc"]["ip"] ;
						//zenip = json_data["zenoss"]["ip"] ;
alert(data_src_str);
						// now set up blinklist
						getOrigLEDState();

						// handle popups ///////////////////////////
						// make popup go away when clicked
						$('#1900Apopupbkg').click(function(){
							//alert("onclick opup"); // note uses background so LEDs remian clickable
							popDown1900A();
						});	

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
										$('#' + id ).css("stroke", ltblue);
									});
									$('#' + id ).mouseleave(function(){
										//logDebug("mouseleave stroke id= " + id + " color " +  blinklist[id].color + "<br>");
										$('#' + id ).css("stroke", white );
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
										$('#' + id ).css("stroke", ltblue);
									});
									$('#' + id ).mouseleave(function(){
										//logDebug("mouseleave stroke id= " + id + " color " +  blinklist[id].color + "<br>");
										$('#' + id ).css("stroke", white );
									});
									$('#' + id ).click(function(){  
										$('#' + id ).attr('target', '_blank');
										window.open(zreurl);
									});
							}
							
						});

			/////////////////////// END of stuff chained inside get backend.php
			} );
			
			// mouseover functions: typ.//////////////////////////////////////////////////////////////////////////
			// WHY DONT WE USE MOUSEOUT? because the hover or mouseout conflicts with the one in superfish menu
			$('#1900Apopupgroup').mouseover(function(){
				invisbleMenus(last_menu);		// make the last menu invisible	 
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
			$('#chassisbkg').mouseover(function(){	//really get rid of the menus
				//alert("pagebkg");
			invisbleMenus(last_menu);
			last_menu = '';
			});

			$("#1900Apopup").click(function (e)  {
					//alert("click1900Apopup");
				popUp1900A();
				e.preventDefault();
			});
			runLoadingMask();
		}
		////////////// END  setup  ///////////////////////////////



		$.fn.oac.blinkLED = function (){
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
		
		
		$.fn.oac.loopGetSNMP = function (){
			//alert("loop getsnmp");

				loop_control = window.setInterval(function() {
	
				$.get(data_src_str,  function(data){
			//alert("loop inside interval");

					var json_data = $.parseJSON(data);
		//alert(JSON.stringify(json_data) );
					//logDebug(json_data);
				process_1900FabricData(json_data);
					process_1900BaseData(json_data);
			//alert("loop after basedata");
							//logDebug(json_data);
					process_7300Data(json_data);
			//alert("loop before process slot");

				processSlotData(json_data);
					} );
			}, snmp_loop_duration );

		}
		
		$.fn.oac.writeToPanel = function (element, text){
			document.getElementById(element).innerHTML = text ;
		}
		// stick tests in here
		$.fn.oac.test  = function (){
			//alert("start test func");
			getChassisXML();
			
		}

  
///////////////// private functions //////////////////////////////////////////////  
		// start or stop testing - false=no testing = default  mode= plain || auto
		function setTest(bool, mode){
			test_status = bool;
			if ( bool === true && mode === "plain" ) {
				data_src_str = test_default_data_src ;
			}else if ( bool === true && mode === "auto" ){
				runAutoTest();
			}else if  ( bool === false ){
				data_src_str = default_data_src_str ;
				test_status = false ;
			}else{
				// reset to defaults
				document.getElementById("debugdiv").innerHTML = " ERROR: bad testing mode: " + mode;
				data_src_str = default_data_src_str ;
				test_status = false ;
			}
		}
		
		function runAutoMTest(){
			// runs an animation of data to test various chassis events
			// set test_data_base_url to 'http://yourserver/.../'
			// to run place $.fn.oac.settest(true, "auto"); in demo.html
			// 6 counts between steps is a little too fast to see all the effects, 10 counts is about right but too slow to iterate
			var count = 0;
			var addedcnt =  8 ;
			var test_anim = window.setInterval(function() {
				// runs about half speed of what you'd expect! so use a repeat ms number twice nominal
				switch(count) {
					case 1 * addedcnt :
						data_src_str = test_base_url + "test_data.html";
						$.fn.oac.logDebug( data_src_str);
						alert("Test: default state");
					break;
					case 2 * addedcnt:
						data_src_str = test_base_url + "test_data_slot4_M5.html";
						$.fn.oac.logDebug( data_src_str);
						alert("Test: M5 state");
					break;
					case 3  * addedcnt :
						data_src_str = test_base_url + "test_data_slot4_M6.html";
						$.fn.oac.logDebug( data_src_str);
						alert("Test: M6 state");
					break;					
					case 4 * addedcnt :
						data_src_str = test_base_url + "test_data_slot4_M7.html";
						$.fn.oac.logDebug(data_src_str);
						alert("Test: M7 state");
					break;					
					case 5  * addedcnt:
						data_src_str = test_base_url + "test_data_slot4_M0.html";
						$.fn.oac.logDebug( data_src_str);
						alert("Test: M0 state");
					break;
					case 6  * addedcnt:
						data_src_str = test_base_url + "test_data_slot4_M1.html";
						$.fn.oac.logDebug(data_src_str);
						alert("Test: M1 state");
					break;
					case 7  * addedcnt:
						data_src_str = test_base_url + "test_data_slot4_M2.html";
						$.fn.oac.logDebug( data_src_str);
						alert("Test: M2 state");
					break;					
					case 8  * addedcnt:
						data_src_str = test_base_url + "test_data_slot4_M3.html";
						$.fn.oac.logDebug( data_src_str);
						alert("Test: M3 state");
					break;					
					case 9  * addedcnt:
						data_src_str = test_base_url + "test_data.html";
						$.fn.oac.logDebug( data_src_str);
						alert("Test: M4 state");
					break;	
				}
				count++;
			}, test_auto_dur );
    
		}
		function getDefaultChassisNet(){
			// once initial data is recieved and validated for syntax
			// try to get all data we need from shelf manager, if not,
			// ask user
			var cdata = null;
			 cdata = getChassisXML();
			if (cdata == null) {
				alert("can't get chassis data");
			}
			// check to see if we have a connection to shelf manager, if not throw error and break
			checkForSHMM(cdata);
			//check to see if we have all necessary data for occupied slots; 
			//what slots are occupied?
			//compare occupied with cdata, accept if marked "incomplete"
			//if not ok or "incomplete" check shelf man and update cdata ;
			//if cdata now complete, write to xml
			//if not, ask for data one by one
			//mark user-asked failed data "incomplete" ; write to xml, and continue
	
		}
		
		function checkForSHMM(sdata){
			if ( chassisnet["fab"]["ip"] = "" ){ // failed validation no write to object
				alert("Check for shmm failed");
			}
		}
			
		

		function getChassisXML(){
			// just get the data and validate if there is data
			// may have to be re-done to get data from daemon eventually
			// now, just reads an xml file
			// this has to be validated every time because we don't know if something has changed or been replaced
			var j_data = null;
			$.get("chassis.xml",  function(data){
				// must run tests inside this function to prevent race conditions
			    j_data = $.xml2json(data);  // (data, true) if extended mode required
				// test for a full set of valid IPs for all slots
				for (var i = 1; i < 9; i++) {
							//alert(" for " + i );
					var msg = "IP address validation error";
					var slt = "slot" + i ;
					var testip = j_data["slot" + i]["ip"] || null ;
					if (testip !== null){
						msg =  validateIP( testip );
						if ( msg !== "good"){
							alert("Bad IP address for slot " + i + " error: " + msg);
						}else {
							alert("good " + testip);
							chassisnet["slot" + i]["ip"] = testip ;
						}
					}else {
						alert("No IP address for slot " + i);
					}

				}
				//special case no slot number for shelf manager
				var shmmip = j_data["shmm"]["ip"] || null ;
				var smsg = "IP address validation error";
				if (shmmip !== null){
						smsg =  validateIP( shmmip );
				}else {
						alert("No IP address for shmm ");
				}				
				if ( smsg !== "good"){
						alert("Bad IP address for shelf manager... error: " + smsg);
				}else{
					chassisnet["shmm"]["ip"] = shmmip ;
				}
				var baseswip = j_data["base"]["ip"] || null ;
				var bmsg = "IP address validation error";
				if ( baseswip !== null){
						bmsg =  validateIP( baseswip );
				}else {
						alert("No IP address for base " );
				}				
				if ( bmsg !== "good"){
						alert("Bad IP address for base switch... error: " + bmsg);
				}else{
					chassisnet["base"]["ip"] = baseswip ;
				}
				var fabswip = j_data["fab"]["ip"] || null ;
				var fmsg = "IP address validation error";
				if (fabswip !== null){
						fmsg =  validateIP( fabswip );
				}else {
						alert("No IP address for fab switch " );
				}				
				if ( fmsg !== "good"){
						alert("Bad IP address for fab switch... error: " + fmsg);
				}else{
					chassisnet["fab"]["ip"] = fabswip ;
				}
				// all done
				return j_data;
			} );
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
				$('#chassisgreymask').animate({svgTransform: 'translate(0,500)'}, 200).fadeOut(20000).slideDown("fast");
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
		// captures original color of leds too except "power" which has a gradiant
			var rtags=document.getElementsByTagName("rect");  // note limited to "rect" for now
			for(var x=0;x<rtags.length;x++){
					var myid = rtags[x].id;
					var date = new Date();
					var addmin = Math.round( blink_duration/3 );
					var newtime = date.getTime() + getRandomInteger( addmin  , blink_duration );
					if( myid.match("led")  && !myid.match("power")){
						// set all rect LEDs to not blink by default
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
						case "ledApopbclk":
						blinklist[ myid ].blink = true ;
						break;
						case "ledApopfclk":
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
						case "ledApopfok":
						$("#" + myid).css("fill", green) ;//placeholder until we can get this status
						break;
						case "ledApopbok":
						$("#" + myid).css("fill", green)  ;//placeholder until we can get this status
						break;	      
						case "ledApopfe1":
						$("#" + myid).css("fill", black);  //placeholder until we can get this status
						break;
						case "ledApopbe1":
						$("#" + myid).css("fill", black);   //placeholder until we can get this status
						break;	   
						case "ledApopsys":
						$("#" + myid).css("fill", green);   //placeholder until we can get this status
						break;	
						case "ledApophealthy":
						$("#" + myid).css("fill", green);   //placeholder until we can get this status
						break;	
						case "ledApopsvc":
						$("#" + myid).css("fill", green);   //placeholder until we can get this status
						break;
						default:
						break;
					}
			}
			// NOW CIRCLES so not picked up by "rect" above
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
		//alert("processfabdata");
			for (var zre in json["slot1"]["fabric ports"] ) {
				//logDebug(zre) ;
				if ( json["slot1"]["fabric ports"][zre] == "down" ) {
						$("#ledAf" + zre ).css("fill", amber );
						$("#ledApopfz" + zre ).css("fill", amber );	//popup
				//logDebug("down: #ledAf" + zre );
				}else if ( json["slot1"]["fabric ports"][zre] == "up" ) {
						$("#ledAf" + zre ).css("fill", green );
						$("#ledApopfz" + zre ).css("fill", green );	//popup
						//logDebug("up: #ledAf" + zre );
				}else {
						$("#ledAf" + zre ).css("fill", black ); //some unknown state
						$("#ledApopfz" + zre ).css("fill", black );	//popup
						//logDebug("unkniown: #ledAf" + zre );
				}
			}
			if ( json["slot1"]["fabric ext"] == "on" ) {
					$("#ledAfext").css("fill", red );
					$("#ledApopfext" + zre ).css("fill", amber );	//popup
			}else if ( json["slot1"]["fabric ext"] == "off" ) {
					$("#ledAfext").css("fill", black );
					$("#ledApopfext" ).css("fill", black );	//popup
			}else {
					$("#ledAfext").css("fill", blue ); //some unknown state
					$("#ledApopfext"  ).css("fill", blue );	//popup
			}
			if ( json["slot1"]["fabric int"] == "on" ) {
					$("#ledAfint").css("fill", red );
					$("#ledApopfint"  ).css("fill", red );	//popup
			}else if ( json["slot1"]["fabric int"] == "off" ) {
					$("#ledAfint").css("fill", black ); 
					$("#ledApopfint"  ).css("fill", black );	//popup
			}else {
					$("#ledAfint").css("fill", blue ); //some unknown state
					$("#ledApopfint"  ).css("fill", blue );	//popup
			}
		}

		function process_1900BaseData(json){
		// taking in json data from snmpget done by backend php via ajax
		//alert("processbasedata");
			for (var zre in json["slot1"]["base ports"] ) {
				//logDebug(zre) ;
				if ( json["slot1"]["base ports"][zre] == "down" ) {
						$("#ledAb" + zre ).css("fill", amber );
						$("#ledApopbz" + zre ).css("fill", amber );	//popup
				}else if ( json["slot1"]["base ports"][zre] == "up" ) {
						$("#ledAb" + zre ).css("fill", green );
						$("#ledApopbz" + zre ).css("fill", green );	//popup				
				}else {
						$("#ledAb" + zre ).css("fill", black ); //some unknown state
						$("#ledApopbz" + zre ).css("fill", blue );	//popup				
				}
			}
			if ( json["slot1"]["base ext"] == "on" ) {
					$("#ledAbext").css("fill", red );
					$("#ledApopbext").css("fill", red );	//popup			
			}else if ( json["slot1"]["base ext"] == "off" ) {
					$("#ledAbext").css("fill", black );
					$("#ledApopbext").css("fill", black );	//popup			
			}else {
					$("#ledAbext").css("fill", blue ); //some unknown state 
					$("#ledApopbext").css("fill", blue );	//popup			
			}
			if ( json["slot1"]["base int"] == "on" ) {
					$("#ledAbint").css("fill", red );
					$("#ledApopbint").css("fill", red );	//popup			
			}else if ( json["slot1"]["base int"] == "off" ) {
					$("#ledAbint").css("fill", black );
					$("#ledApopbint").css("fill", black );	//popup			
			}else {
					$("#ledAbint").css("fill", ltgrey ); //some unknown state
					$("#ledApopbint").css("fill", ltgrey );	//popup
			}
		}


		function process_7300Data(json){
		// taking in json data from snmpget done by backend php via ajax
		//alert("process7300data");
		//logDebug(json);
			//for ( var item in json ) {
				//logDebug(item);
				//if ( json[ item ][ "name" ] == "ZX7300") {
					var item = "slot3";
								var slotnum = "3";
					for (var zre in json[ item ]["7300 ports"] ) {
						//var slotnum = item.replace('slot', ''); 

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
				//}
			//}
		}


		function processSlotData(json){
		//alert("processslotdata sl1 "  );
		//logDebug(json);
		//var sl3 =  json["slot3"]["name"] ;
		//logDebug(sl3);
		//alert("sl3 name = " . sl3);
		//alert("processslotdata sl3 "  );
		// take in json SNMP for slots 3,4,5
		//  just to see whats registered in the slot by the shmc
		// the board may actually be gone, or in an intermediate state
		// first display correct board by slot
		//alert("processslotdata jsonslot3name" . json["slot3"]["name"]); 
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
		//alert("just vefore prcesslsot3");
			if ( json["slot3"]["name"] === "ZX7300"){
		//alert( json["slot3"]["name"]);
			popSlot3_ZX7300();
			setBoardState( json["slot3"]["M"], "7300", 3 );	
			}else if ( json["slot3"]["name"] === "SBC" ) {
			popSlot3_Sbc();
			setBoardState( json["slot3"]["M"], "sbc", 3 ); //note case
			}else if ( json["slot3"]["name"] === 'N/A' ) {
			// means we are physically in ejector open state but already passed to M1
			setBoardEjectState( 3 ); 
			} else{
		//alert("popslot3 empty");
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
		//alert("popslot4 empty");

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
		//alert("popslot5 empty");
			popSlot5_Empty();
			}  
			
				//document.getElementById("tempnotify").innerHTML = ("") ;
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
					if ( slot === 3 ) {
						popSlot3_Empty();
					}else if ( slot === 4 ){
						popSlot4_Empty();
					}else if (slot === 5 ) {
						popSlot5_Empty();
					}
					if ( board !== "empty" ) {
						document.getElementById("slot" + slot + "notify").innerHTML = (board + " M0(0): Board removed!") ;
						document.getElementById("tempnotify").innerHTML = ("Slot " + slot + " now empty." ) ;
					}else{
						document.getElementById("slot" + slot + "notify").innerHTML = ("") ;
						document.getElementById("tempnotify").innerHTML = (" " ) ;
					}
					break;	  
				case "M1(1)":	// blue LED on
					$("#led" + board + "-" + slot + "hot").css("fill", blue) ;
					$("#" + board + "-" + slot + "glow").css("stroke", ltblue)
					blinklist [ "led" + board + "-" + slot + "hot" ].blink = true ;
					document.getElementById("slot" + slot + "notify").innerHTML = ( " M1(1): No communication.") ;
					document.getElementById("tempnotify").innerHTML = ("An unknown board is in slot " + slot + "."  ) ;
					break;	  
				case "M2(2)":	// blue LED blink
					boardStartingUp(board, slot, mstate);				
					break;	  
				case "M3(3)":	// blue LED off
					boardStartingUp(board, slot, mstate);
					break;	  
				case "M4(4)":	// blue LED off // ejectboard states off
					// we think the slot was occupied before ( eventually we'll know for sure with hardware history )
					var glowcolor = $("#" + board + "-" + slot + "glow").css("stroke");
					if (  blinklist [  board + "-" + slot + "glow" ].blink === true ) {   // if there is a blinking glow
						boardInService(board,slot);
						break;
					}else if (  glowcolor !== defaultglow){ // if glow is a color
						boardInService(board,slot);	    
					//}//else if ( typeof window.blinklist[ "#" + board + "-" + slot + "glow"] !== object ) {
							// we think this is just a page refresh or a startup
							//alert( "not an object ");
						break;
					}else {
						break;
					}
				case "M5(5)":	// blue LED blink
					setBoardEjectState( board, slot, mstate );
					$("#led" + board + "-" + slot + "hot").css("fill", blue) ;
					blinklist [ "led" + board + "-" + slot + "hot" ].blink = true ;
					break;	  
				case "M6(6)": // blue LED blink
					boardOutOfService(board, slot, mstate);
					$("#led" + board + "-" + slot + "hot").css("fill", blue) ;	  
					blinklist [ "led" + board + "-" + slot + "hot" ].blink = true ;
					break;	  
				case "M7(7)": // blue LED no change // sometimes reached if board is yanked without waiting
					//alert("m7  board " + board + "  slot " + slot);
					setBoardUnknownState(board,  slot, mstate);
					break;	  
				default : //error condition
					$("#led" + board + "-" + slot + "hot").css("fill", red) ;
					blinklist [ "led" + board + "-" + slot + "hot" ].blink = false ;
					break;	  
			}
		
		}


		function setBoardEjectState( board, slot, mstate ) {
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
				document.getElementById("slot3notify").innerHTML = (board + " " + mstate + ": Ejector lever opened!") ;
				break;      
				case 4 : 
				popSlot4_Sbc();
				$('#sbc-4ejectgroup').css("opacity", 0 );
				blinklist [ "sbc-4glow" ].blink = true;
				document.getElementById("slot4notify").innerHTML = (board + " " + mstate + ": Ejector lever opened!") ;
				break;      
				case 5 :
				popSlot5_Sbc();
				$('#sbc-5ejectgroup').css("opacity", 0 );
				blinklist [ "sbc-5glow" ].blink = true; 
				document.getElementById("slot5notify").innerHTML = (board + " " + mstate + ": Ejector lever opened!") ;
				break;      
			}
				document.getElementById("tempnotify").innerHTML = (board + " going out of service!" ) ;
		}

		function setBoardUnknownState( board,  slot, mstate ) {
			// use sbc graphic to repesent any board and turn off lettering to make it generic
			// then set LEDs to indicate unknown, bad state and blinking glow
				//alert("set unknown state" );  
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
				$("#" + board + "-" + slot + "glow").css("stroke", red) ;
				blinklist [ "sbc-3glow" ].blink = false;
				document.getElementById("slot3notify").innerHTML = (mstate + ": Unknown condition!") ;
				break;      
				case 4 : 
				popSlot4_Sbc();
				$('#sbc-4ejectgroup').css("opacity", 0 );
				$("#" + board + "-" + slot + "glow").css("stroke", red) ;
				blinklist [ "sbc-4glow" ].blink = false;
				document.getElementById("slot4notify").innerHTML = (mstate + ": Unknown condition!") ;
				break;      
				case 5 :
				popSlot5_Sbc();
				$('#sbc-5ejectgroup').css("opacity", 0 );
				$("#sbc-5glow").css("stroke", red) ;
				blinklist [ "sbc-5glow" ].blink = false;
				document.getElementById("slot5notify").innerHTML = (mstate + ": Unknown condition!") ;
				break;      
			}
			document.getElementById("tempnotify").innerHTML = ( "board unknown!" ) ;		
		}

		function boardOutOfService(board, slot, mstate){
		// LEDs are named led7300-2nnnn ledsbc-1nnnn where 1 & 2 or 3 are slot numbers and nnnn is unique
		document.getElementById("tempnotify").innerHTML = ("Board out of service!" ) ;
		document.getElementById("slot" + slot + "notify").innerHTML = ( board + ": " + mstate + " deactivation." ) ;
		//alert("board out of  board " + board + "  slot " + slot);
			setBoardBlack( board, slot);
		}
		
		function boardStartingUp(board, slot, mstate){
			// use for M states 2,3
			var elem = "#" + board + "-" + slot + "glow" ;
			$( elem ).css("stroke", ltblue) ;
			if ( mstate === "M2(2)" ) {					
				$("#led" + board + "-" + slot + "hot").css("fill", blue) ;
				blinklist [ "led" + board + "-" + slot + "hot" ].blink = true ;
				document.getElementById("slot" + slot + "notify").innerHTML = (board + " M2(2): Fru present") ;
				document.getElementById("tempnotify").innerHTML = ("Board starting.");					
			}else if ( mstate === "M3(3)" ) {
				$("#led" + board + "-" + slot + "hot").css("fill", black) ;
				blinklist [ "led" + board + "-" + slot + "hot" ].blink = false ;
				document.getElementById("slot" + slot + "notify").innerHTML = (board + " M3(3): Board activation") ;				
				document.getElementById("tempnotify").innerHTML = ("Board starting.");
			}
		}

		function boardInService(board,slot){
			// used when we think a transition has happened to a board
			// LEDs are named led7300-2nnnn ledsbc-1nnnn where 1 & 2 or 3 are slot numbers and nnnn is unique
			for( var name in blinklist){
				if ( name.match("led") && name.match(board) ){
				$("#" + name).css("fill", blinklist[ name ].color) ;   // return to default color
				} else if ( name.match("glow") && name.match(board) ){
				$("#" + name).css("stroke", blinklist[ name ].color) ; // return to default color
				}
			}
			$("#led" + board + "-" + slot + "hot").css("fill", black) ;
			$( "#" + board + "-" + slot + "ejectgroup").css("opacity", 100 );
			blinklist [ "led" + board + "-" + slot + "hot" ].blink = false ;
			blinklist [  board + "-" + slot + "glow" ].blink = false ;
			document.getElementById("tempnotify").innerHTML = ("" ) ;
			document.getElementById("slot" + slot + "notify").innerHTML = (" ") ;				

		}

		function setBoardBlack(board,slot){
		// sets all SVG leds to light grey
			var tags=document.getElementsByTagName("rect");  // note limited to "rect" for now
			for(var x=0;x<tags.length;x++){
			var myid = tags[x].id;
			if( myid.match("led" + board + "-" + slot) &&  !myid.match("hot")){
		//alert("setting led black: " + 	  "led" + board + "-" + slot );
				$("#" + myid).css("fill", ltgrey) ;
			}
			}
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
			$('#7300-3group').animate({svgTransform: 'translate(-16,-288)',svgOpacity: 100}, 2000);
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
			$('#sbc-4group').animate({svgTransform: 'translate(-123,281)',svgOpacity: 100}, 2000);// Y+ = up the screen X+ = right of screen
		}
		function popSlot5_Sbc(){
			popSlot5_Empty(); // reset for the seond time you push "SBC"
			$('#sbc-5group').css("visibility", "visible" );
			$('#sbc-5group').animate({svgTransform: 'translate(-56,390)',svgOpacity: 100}, 2000);
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

  
//
// end of closure
//
})(jQuery);