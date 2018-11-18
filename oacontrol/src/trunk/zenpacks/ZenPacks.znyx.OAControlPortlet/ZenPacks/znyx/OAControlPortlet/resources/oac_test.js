/* Zmyx Networks OAControl   TEST 
 *  done as a jQuery plugin because a standard module pattern library
 *  did not work in the zenoss/YUI namespace.
 *  This model works well outisde zenoss though,
 *  so its easier to test this way.
 *  http://docs.jquery.com/Plugins/Authoring
 *  http://www.learningjquery.com/2007/10/a-plugin-development-pattern
 */

///////////////////// ZNYX DEVELOPMENT /////////////////////////////
// 	Testing works this way:
// 
// 	1. try to always use the actual code in oac.js except for juggling the data. Try to test by only 
// 	modifying the input data.
// 	2. don't  change the actual xml file to juggle data
// 	3. if the testing var is turned on, data is sucked in a few times at setuppage, but once testing
// 	starts, data is re-routed from a special test data object
// 	4. the data files live in an "oac" subdirectory under resources. When we package the product, we'll leave them out.
// 	5. on the desktop, test by making a link from apacheDocRoot/oac to the oac directory under resources. in the product
// 	that dir is actually real under apacheDocRoot
//////////////////////////////////////////////////////////////////////

// create closure
//
(function($) {
  //
  // plugin definition ... claim the name oac
  // invoke as $('#myDiv').oac_test();
  //
  $.fn.oac_test = function(options) {
		debug(this);
		// build main options before element iteration
// 		var opts = $.extend({}, $.fn.oac.defaults, options);
 		// iterate and reformat each matched element
 		return this.each(function() {
 				$this = $(this);
		});
  };
		var test_auto_dur = 1000 ; //   for test animation loop



		// stick tests in here
		// set up as a delay so that the default setuppage can be finished before we start
		$.fn.oac_test.test  = function (){
			var test_start = window.setTimeout(function() {
				alert("debug: TESTING!");
				// MUST BE TRUE ////		
				oacglobals["test_status"] = true ;
				oacglobals["pem_visible"] = true ;


				
				///////// AUTO TEST ////////////
				//runAutoTestsMstate();	
					// runAutoTestsPopslotsSBC();
					 // runAutoTestsPopslots7300();
					//run7300LEDTests();
				//run2010LEDTests();
					//runAutoTestsPopslots2010();
				//runAutoTestsPem();
		//modifyTestData("2010ledtests", 8, "downdown");
		//modifyTestData("2010ledtests", 7, "downdown");
				modifyTestData("2010ledtests", 7, "misc_on");
				modifyTestData("2010ledtests", 8, "misc_on");

				}, 8000 );
		}

/////////////////////////////////////////////////////////////////////////////////////////////////////////  
///////////////// private functions /////////////////////////////////////////////////////////////////////

		// start or stop testing - false=no testing = default  mode= plain || auto
// 		function setTest(bool, mode){
// 			test_status = bool;
// 			if ( bool === true && mode === "plain" ) {
// 				data_src_str = test_default_data_src ;
// 			}else if ( bool === true && mode === "auto" ){
// 				runAutoTest();
// 			}else if  ( bool === false ){
// 				data_src_str = default_data_src_str ;
// 				test_status = false ;
// 			}else{
// 				// reset to defaults
// 				document.getElementById("debugdiv").innerHTML = " ERROR: bad testing mode: " + mode;
// 				data_src_str = default_data_src_str ;
// 				test_status = false ;
// 			}
// 		}
		function modifyTestData(mode, slot, data){
			// pass in mode and tweak the stored data in test_data
			// modes = mstate 
					//alert("modifytestData mode,slot,data  = " + mode + " " + slot + " " + data);	
			switch(mode) {
				
				case "mstate":
					oacglobals["test_data"][ "slot" + slot ]["mstate"] = data ;	
						//alert("modifytestdata mstatedata = " + 	oacglobals["test_data"][ "slot" + slot ]["mstate"]);				
				break;	
				case "popslots":
					oacglobals["test_data"][ "slot" + slot ]["name"] = data ;
					if ( data == "" ) {
//alert("popslots data is nada");						
						oacglobals["test_data"][ "slot" + slot ]["mstate"] = "0" ; // make sure slot goes to blank plate
					}else{
//alert("popslots data is good " + data);							
						oacglobals["test_data"][ "slot" + slot ]["mstate"] = "4" ;						
					}
				break;	
				case "7300ledtests":
					if ( data == "upup" ){
						for (var i =0 ; i <28; i++){
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["link"] = "up";
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["cnf"] = "up";
						}
						oacglobals["test_data"][ "slot" + slot ]["eth0"]["link"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["eth0"]["cnf"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["eth1"]["link"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["eth1"]["cnf"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["eth2"]["link"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["eth2"]["cnf"] = "up";							
						oacglobals["test_data"][ "slot" + slot ]["console"]["link"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["console"]["cnf"] = "up";	
						
					}else if (data == "downdown"){
						for (var i =0 ; i <28; i++){
							//alert("downdown");
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["link"] = "down";
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["cnf"] = "down";						
						}	
						oacglobals["test_data"][ "slot" + slot ]["eth0"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["eth0"]["cnf"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["eth1"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["eth1"]["cnf"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["eth2"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["eth2"]["cnf"] = "down";								
						oacglobals["test_data"][ "slot" + slot ]["console"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["console"]["cnf"] = "down";
						
					}else if ( data == "downup") {
						for (var i =0 ; i <28; i++){
							//alert("downup");
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["link"] = "down";
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["cnf"] = "up";						
						}
						oacglobals["test_data"][ "slot" + slot ]["eth0"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["eth0"]["cnf"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["eth1"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["eth1"]["cnf"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["eth2"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["eth2"]["cnf"] = "up";							
						oacglobals["test_data"][ "slot" + slot ]["console"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["console"]["cnf"] = "up";	
						
					}else if ( data == "misc_on") {
						oacglobals["test_data"][ "slot" + slot ]["ext"] = "on";
						oacglobals["test_data"][ "slot" + slot ]["int"] = "on";
						oacglobals["test_data"][ "slot" + slot ]["svc"] = "on";
						oacglobals["test_data"][ "slot" + slot ]["sys"] = "on";							
						// leave clk out and hot
						oacglobals["test_data"][ "slot" + slot ]["healthy"] = "on";							
						oacglobals["test_data"][ "slot" + slot ]["ok"] = "on";							
						
					}else if ( data == "misc_off") {
						oacglobals["test_data"][ "slot" + slot ]["ext"] = "off";
						oacglobals["test_data"][ "slot" + slot ]["int"] = "off";
						oacglobals["test_data"][ "slot" + slot ]["svc"] = "off";
						oacglobals["test_data"][ "slot" + slot ]["sys"] = "off";							
						// leave clk out and hot
						oacglobals["test_data"][ "slot" + slot ]["healthy"] = "off";							
						oacglobals["test_data"][ "slot" + slot ]["ok"] = "off";							
					}
				break;	
				case "2010ledtests":
					if ( data == "upup" ){
						for (var i =14 ; i <20; i++){
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["link"] = "up";
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["cnf"] = "up";
						}
						oacglobals["test_data"][ "slot" + slot ]["sweth0"]["link"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["sweth0"]["cnf"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["shmmeth0"]["link"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["shmmeth0"]["cnf"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["swserial"]["link"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["swserial"]["cnf"] = "up";							
						oacglobals["test_data"][ "slot" + slot ]["shmmserial"]["link"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["shmmserial"]["cnf"] = "up";	
						
					}else if (data == "downdown"){
						for (var i =14 ; i <20; i++){
							//alert("downdown");
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["link"] = "down";
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["cnf"] = "down";						
						}	
						oacglobals["test_data"][ "slot" + slot ]["sweth0"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["sweth0"]["cnf"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["shmmeth0"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["shmmeth0"]["cnf"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["swserial"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["swserial"]["cnf"] = "down";							
						oacglobals["test_data"][ "slot" + slot ]["shmmserial"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["shmmserial"]["cnf"] = "down";	
						
					}else if ( data == "downup") {
						for (var i =14 ; i <20; i++){
							//alert("downup");
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["link"] = "down";
							oacglobals["test_data"][ "slot" + slot ]["port" + i]["cnf"] = "up";						
						}
						oacglobals["test_data"][ "slot" + slot ]["sweth0"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["sweth0"]["cnf"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["shmmeth0"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["shmmeth0"]["cnf"] = "up";
						oacglobals["test_data"][ "slot" + slot ]["swserial"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["swserial"]["cnf"] = "up";							
						oacglobals["test_data"][ "slot" + slot ]["shmmserial"]["link"] = "down";
						oacglobals["test_data"][ "slot" + slot ]["shmmserial"]["cnf"] = "up";	
						
					}else if ( data == "misc_on") {
						
						oacglobals["test_data"][ "slot" + slot ]["oaa"] = "on";
						oacglobals["test_data"][ "slot" + slot ]["shmm"] = "on";
						oacglobals["test_data"][ "slot" + slot ]["oafault"] = "on";	
						oacglobals["test_data"][ "slot" + slot ]["oos"] = "on";						
						
						
					}else if ( data == "misc_off") {
						
						oacglobals["test_data"][ "slot" + slot ]["oaa"] = "off";
						oacglobals["test_data"][ "slot" + slot ]["shmm"] = "off";
						oacglobals["test_data"][ "slot" + slot ]["oafault"] = "off";
						oacglobals["test_data"][ "slot" + slot ]["oos"] = "on";		
						
					}
				break;	
				case "fanstate":	
					oacglobals["test_data"][ "chassis"]["lfan"]["mstate"] = data ;
					oacglobals["test_data"][ "chassis"]["rfan"]["mstate"] = data ;
				break;
				case "pemstate":	
					oacglobals["test_data"][ "chassis"]["lpem"]["mstate"] = data ;
					oacglobals["test_data"][ "chassis"]["rpem"]["mstate"] = data ;
				break;
			}
			return true;
		}
		function run2010LEDTests(){

			var count =0;
			var addedcnt = 3;	
			alert("run2010ledtests starting");
			var test_anim = window.setInterval(function() {
				// runs about half speed of what you'd expect! so use a repeat ms number twice nominal
				switch(count) {
					case 1 * addedcnt :
									//alert(" data name = " + oacglobals["test_data"][ "slot4"  ]["name"] );
							alert( "run2010LEDTests  link up config up" );
							if (oacglobals["test_data"][ "slot7"  ]["name"] ==  oacglobals["svg2010name"] ){
								modifyTestData("2010ledtests", 7, "upup");
							}
							if (oacglobals["test_data"][ "slot8"  ]["name"] ==  oacglobals["svg2010name"] ){
								modifyTestData("2010ledtests", 8, "upup");
							}
	
						//alert(" upup oacglobals[test_data][ slot4 ][port1][cnf] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["cnf"] );
						//alert(" upup oacglobals[test_data][ slot4 ][port1][link] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["link"] );
					break;
					case 3 * addedcnt :
							alert( "run2010LEDTests  link down config down" );
							if (oacglobals["test_data"][ "slot7"  ]["name"] ==  oacglobals["svg2010name"] ){
								modifyTestData("2010ledtests", 7, "downdown");
							}
							if (oacglobals["test_data"][ "slot8"  ]["name"] ==  oacglobals["svg2010name"] ){
								modifyTestData("2010ledtests", 8, "downdown");
							}
						//alert(" downdown oacglobals[test_data][ slot4 ][port1][cnf] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["cnf"] );
						//alert(" downdown oacglobals[test_data][ slot4 ][port1][link] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["link"] );
					break;
					case 6 * addedcnt :
							alert( "run2010LEDTests  link down config up" );
							if (oacglobals["test_data"][ "slot7"  ]["name"] ==  oacglobals["svg2010name"] ){
								modifyTestData("2010ledtests", 7, "downup");
							}
							if (oacglobals["test_data"][ "slot8"  ]["name"] ==  oacglobals["svg2010name"] ){
								modifyTestData("2010ledtests", 8, "downup");
							}
						//alert(" downup oacglobals[test_data][ slot4 ][port1][cnf] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["cnf"] );
						//alert(" downup oacglobals[test_data][ slot4 ][port1][link] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["link"] );
					break;
					case 9 * addedcnt :
							alert( "run2010LEDTests misc ON non-port LEDs" );
							if (oacglobals["test_data"][ "slot7"  ]["name"] ==  oacglobals["svg2010name"] ){
								modifyTestData("2010ledtests", 7, "misc_on");
							}
							if (oacglobals["test_data"][ "slot8"  ]["name"] ==  oacglobals["svg2010name"] ){
								modifyTestData("2010ledtests", 8, "misc_on");
							}						
					break;
					case 12 * addedcnt :
							alert( "run2010LEDTests misc OFF non-port LEDs" );
							if (oacglobals["test_data"][ "slot7"  ]["name"] ==  oacglobals["svg2010name"] ){
								modifyTestData("2010ledtests", 7, "misc_off");
							}
							if (oacglobals["test_data"][ "slot8"  ]["name"] ==  oacglobals["svg2010name"] ){
								modifyTestData("2010ledtests", 8, "misc_off");
							}	
					break;
					case 18 * addedcnt :
						alert("run2010ledtests all done.");
					break;
				}
				count++;
			}, test_auto_dur );
		}
		function run7300LEDTests(){

			var count =0;
			var addedcnt = 3;	
			alert("run7300ledtests starting");
			var test_anim = window.setInterval(function() {
				// runs about half speed of what you'd expect! so use a repeat ms number twice nominal
				switch(count) {
					case 1 * addedcnt :
									//alert(" data name = " + oacglobals["test_data"][ "slot4"  ]["name"] );
//alert("run7300ledtests test_data" + JSON.stringify(oacglobals["test_data"]) );
						for (var i=1; i <7; i++){
							if (oacglobals["test_data"][ "slot" + i ]["name"] ==  oacglobals["svg7300name"] ){
								alert( "run7300LEDTests for slot "+i+" link up config up ");
								modifyTestData("7300ledtests", i, "upup");
							}
						}	
						//alert(" upup oacglobals[test_data][ slot4 ][port1][cnf] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["cnf"] );
						//alert(" upup oacglobals[test_data][ slot4 ][port1][link] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["link"] );
					break;
					case 3 * addedcnt :
						for (var i=1; i <7; i++){
							if (oacglobals["test_data"][ "slot" + i ]["name"] ==  oacglobals["svg7300name"] ){
								alert( "run7300ledtests for slot "+i+" link down config down");
								modifyTestData("7300ledtests", i, "downdown");
							}
						}
						//alert(" downdown oacglobals[test_data][ slot4 ][port1][cnf] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["cnf"] );
						//alert(" downdown oacglobals[test_data][ slot4 ][port1][link] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["link"] );
					break;
					case 6 * addedcnt :
						for (var i=1; i <7; i++){
							if (oacglobals["test_data"][ "slot" + i ]["name"] ==  oacglobals["svg7300name"] ){
								alert( "run7300ledtests for slot "+i+"  link down config up");
								modifyTestData("7300ledtests", i, "downup");
							}
						}
						//alert(" downup oacglobals[test_data][ slot4 ][port1][cnf] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["cnf"] );
						//alert(" downup oacglobals[test_data][ slot4 ][port1][link] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["link"] );
					break;
					case 9 * addedcnt :
						for (var i=1; i <7; i++){
							if (oacglobals["test_data"][ "slot" + i ]["name"] ==  oacglobals["svg7300name"] ){
								alert("run7300ledtests for slot "+i+" misc ON non-port LEDs");
								modifyTestData("7300ledtests", i, "misc_on");
							}
						}
					break;
					case 12 * addedcnt :
						for (var i=1; i <7; i++){
							if (oacglobals["test_data"][ "slot" + i ]["name"] ==  oacglobals["svg7300name"] ){
								alert("run7300ledtests for slot "+i+" misc OFF non-port LEDs ");
								modifyTestData("7300ledtests", i, "misc_off");
							}
						}
					break;
					case 18 * addedcnt :
						alert("run7300ledtests all done.");
					break;
				}
				count++;
			}, test_auto_dur );
		}
		
		function runAutoTestsPopslotsSBC(){
			// try popping all types of board in slots 1-6
//alert("Test: popslots starting 7300name= " + oacglobals["svg7300name"]);
			var count = 0;
			var addedcnt =  5 ;
			alert("Popslots test starting: SBC boards testing to see if the SBCs land in all six slots...");
			var test_anim = window.setInterval(function() {
				// runs about half speed of what you'd expect! so use a repeat ms number twice nominal

				switch(count) {
					case 1 * addedcnt :
						// set all slots to blank plate to start
						modifyTestData("popslots", 1, "");
						modifyTestData("popslots", 2, "");
						modifyTestData("popslots", 3, "");
						modifyTestData("popslots", 4, "");												
						modifyTestData("popslots", 5, "");												
						modifyTestData("popslots", 6, "");												
											
												
						//$.fn.oac.logDebug( data_src_str);
						
					break;
					case 2 * addedcnt:
						modifyTestData("popslots", 1, oacglobals["svgsbcname"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "1" + " board " + oacglobals["svgsbcname"]);
					break;
					case 3  * addedcnt :
						 modifyTestData("popslots", 2, oacglobals["svgsbcname"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "2" + " board " + oacglobals["svgsbcname"]);
						break;					
					case 4 * addedcnt :
						 modifyTestData("popslots", 3, oacglobals["svgsbcname"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "3" + " board " + oacglobals["svgsbcname"]);
					break;					
					case 5  * addedcnt:
						 modifyTestData("popslots", 4, oacglobals["svgsbcname"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "4" + " board " + oacglobals["svgsbcname"]);
					break;
					case 6  * addedcnt:
						modifyTestData("popslots", 5, oacglobals["svgsbcname"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "5" + " board " + oacglobals["svgsbcname"]);
					break;
					case 7  * addedcnt:
						modifyTestData("popslots", 6, oacglobals["svgsbcname"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "6" + " board " + oacglobals["svgsbcname"]);

					break;
					case 8 * addedcnt:
						modifyTestData("popslots", 1, "");
						modifyTestData("popslots", 2, "");
						modifyTestData("popslots", 3, "");
						modifyTestData("popslots", 4, "");												
						modifyTestData("popslots", 5, "");												
						modifyTestData("popslots", 6, "");	
						alert("Test SBC popslots All Done.");
				}
				count++;
			}, test_auto_dur );
			
		}

		function runAutoTestsPopslots7300(){
			// try popping all types of board in slots 1-6
//alert("Test: popslots starting 7300name= " + oacglobals["svg7300name"]);
			alert("Popslots test starting: 7300 boards testing to see if the 7300s land in all six slots...");
			var count = 0;
			var addedcnt =  5 ;
			var test_data_start_file_url = oacglobals["test_data_src_base_url"] + 'test_runAutoTestsPopslots7300.xml';
			$.get( test_data_start_file_url,  function(x_data){
			//var json_data = $.parseJSON(data);		
				oacglobals["test_data"] = resetBoardNames(x_data) ; // translates to json and validates ip address
				//var j_data = $.xml2json(x_data);				 	
			});
			var test_anim = window.setInterval(function() {
				// runs about half speed of what you'd expect! so use a repeat ms number twice nominal

				switch(count) {						
					case 1 :
								alert("Test: popslots slot  board " + oacglobals["svg7300name"] + " testing to see that 7300s land in each of six slots...");
						modifyTestData("popslots", 1, "");
						modifyTestData("popslots", 2, "");
						modifyTestData("popslots", 3, "");
						modifyTestData("popslots", 4, "");												
						modifyTestData("popslots", 5, "");												
						modifyTestData("popslots", 6, "");	
					break;
					case 1  * addedcnt :
						 modifyTestData("popslots", 1, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "1" + " board " + oacglobals["svg7300name"]);
						break;					
					case 2  * addedcnt :
						 modifyTestData("popslots", 2, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "2" + " board " + oacglobals["svg7300name"]);
						break;					
					case 3 * addedcnt :
						 modifyTestData("popslots", 3, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "3" + " board " + oacglobals["svg7300name"]);
					break;					
					case 4  * addedcnt:
						 modifyTestData("popslots", 4, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "4" + " board " + oacglobals["svg7300name"]);
					break;
					case 5  * addedcnt:
						modifyTestData("popslots", 5, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "5" + " board " + oacglobals["svg7300name"]);
					break;
					case 6  * addedcnt:
						modifyTestData("popslots", 6, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "6" + " board " + oacglobals["svg7300name"]);

					break;					
					case 7  * addedcnt:
						modifyTestData("popslots", 1, "");
						modifyTestData("popslots", 2, "");
						modifyTestData("popslots", 3, "");
						modifyTestData("popslots", 4, "");												
						modifyTestData("popslots", 5, "");												
						modifyTestData("popslots", 6, "");		
						alert("Popslots test done");
					break;					
				}
				count++;
			}, test_auto_dur );
			
		}

		function runAutoTestsPopslots2010(){
			// try popping all types of board in slots 1-6
//alert("Test: popslots starting 2010 name= " + oacglobals["svg2010name"]);
			alert("Popslots test starting: 2010 boards testing to see if the 2010s land in  slots...");
			var count = 0;
			var addedcnt =  5 ;
			var test_data_start_file_url = oacglobals["test_data_src_base_url"] + 'test_runAutoTestsPopslots2010.xml';
			$.get( test_data_start_file_url,  function(x_data){
			//var json_data = $.parseJSON(data);		
				oacglobals["test_data"] = resetBoardNames(x_data) ; // translates to json and validates ip address
				//var j_data = $.xml2json(x_data);				 	
			});
			var test_anim = window.setInterval(function() {
				// runs about half speed of what you'd expect! so use a repeat ms number twice nominal

				switch(count) {						
					case 1 :
						modifyTestData("popslots", 7, "");
						modifyTestData("popslots", 8, "");
					break;
					case 1  * addedcnt :
						 modifyTestData("popslots", 7, oacglobals["svg2010name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "7" + " board " + oacglobals["svg2010name"]);
						break;					
					case 2  * addedcnt :
						 modifyTestData("popslots", 8, oacglobals["svg2010name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "8" + " board " + oacglobals["svg2010name"]);
						break;							
					case 3  * addedcnt:
						modifyTestData("popslots", 7, "");
						modifyTestData("popslots", 8, "");	
						alert("Popslots test done");
					break;					
				}
				count++;
			}, test_auto_dur );		
		}

		function runAutoTestsPem(){
			// test pem visibility
			alert("Pem visibility test starting...");
			var count = 0;
			var addedcnt =  5 ;
			oacglobals["pem_visible"] = true ;
			var test_anim = window.setInterval(function() {
				// runs about half speed of what you'd expect! so use a repeat ms number twice nominal

				switch(count) {						
					case 1 :
						$('#2000-lpemgroup').css("visibility", "hidden" );
						$('#2000-rpemgroup').css("visibility", "hidden" );
					break;
					case 1  * addedcnt :
						$('#2000-lpemgroup').css("visibility", "visible" );
						$('#2000-rpemgroup').css("visibility", "visible" );
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: pems visible?");
						break;					
					case 2  * addedcnt :
						$('#2000-lpemgroup').css("visibility", "hidden" );
						$('#2000-rpemgroup').css("visibility", "hidden" );
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: pems hidden?");
						break;							
					case 3  * addedcnt:
						alert("Pem visibility test done");
					break;					
				}
				count++;
			}, test_auto_dur );		
		}

		function runAutoTestsMstate(){
			// runs an animation of data to test mstate events
			// 6 counts between steps is a little too fast to see all the effects, 10 counts is about right but too slow to iterate
//alert("runautotestsmstate slot= " + slot);			
			var count = 0;
			var addedcnt =  3 ;
			var test_anim = window.setInterval(function() {
				// runs about half speed of what you'd expect! so use a repeat ms number twice nominal
				switch(count) {
					case 1 * addedcnt :
						
						//$.fn.oac.logDebug( data_src_str);
						alert("Test:  this is default mstate");
					break;
					case 4 * addedcnt:
						testMstates("5");
							// NOTE mstate must be char!!!
						//$.fn.oac.logDebug( data_src_str);
						alert("Test:   this is  M5 state");
					break;
					case 8  * addedcnt :
						testMstates("6");						

						//$.fn.oac.logDebug( data_src_str);
						alert("Test:   this is   M6 state");
					break;					
					case 12 * addedcnt :
						testMstates("7");						
						
						//$.fn.oac.logDebug( data_src_str);
						alert("Test:    this is   M7 state");
					break;					
					case 16  * addedcnt:
						testMstates("0");						
						
						//$.fn.oac.logDebug( data_src_str);
						alert("Test:    this is   M0 state");
					break;
					case 20  * addedcnt:
						testMstates("1");						
						
						//$.fn.oac.logDebug( data_src_str);
						alert("Test:   this is   M1 state");
					break;
					case 24  * addedcnt:
						testMstates("2");						
						
						//$.fn.oac.logDebug( data_src_str);
						alert("Test:    this is   M2 state");
					break;					
					case 28  * addedcnt:
						testMstates("3");
						 
						//$.fn.oac.logDebug( data_src_str);
						alert("Test:   this is  M3 state");
					break;					
					case 32  * addedcnt:
						testMstates("4");						
						
						//$.fn.oac.logDebug( data_src_str);
						alert("Test:   this is  M4 state");
					break;	
				}
				count++;
			}, test_auto_dur );
		}
	//////////// helper functions ///////////////////////////////////	
		function testMstates(mstate){
			// sending mode, slot, mstate for boards
			modifyTestData("mstate", 1, mstate);
			modifyTestData("mstate", 2, mstate);			
			modifyTestData("mstate", 3, mstate);
			modifyTestData("mstate", 4, mstate);
			modifyTestData("mstate", 5, mstate);				 
			modifyTestData("mstate", 6, mstate);				 
			modifyTestData("mstate", 7, mstate);				 
			modifyTestData("mstate", 8, mstate);				
			// sending mode, slot, mstate for fans & pems
			modifyTestData("fanstate", 1, mstate); // slot ignored
			modifyTestData("pemstate", 1, mstate); // slot ignored			 
				 
				 
		}// end func
		
		function resetBoardNames(xmldata){
			for (var i = 1; i < 9; i++) {
							//alert(" for " + i );
				var j_data = null;
			    j_data = $.xml2json(xmldata); 
				// now switch from SNMP board name like "ZX7300" to hard-coded SVG name like "7300"
				var test_board  = j_data["slot" + i]["name"] || null ;
				if (test_board !== null) {
					if ( test_board === oacglobals["zx7300name"] ) {
						j_data["slot" + i]["name"] = oacglobals["svg7300name"];
					}else if ( test_board === oacglobals["zxsbcname"] ) {
						j_data["slot" + i]["name"] = oacglobals["svgsbcname"];
					}else if ( test_board === oacglobals["zx2010name"] ) {
						j_data["slot" + i]["name"] = oacglobals["svg2010name"];
					}
				}
			}
			return j_data;
		}
//
// end of closure
//
})(jQuery);