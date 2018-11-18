/* Zmyx Networks OAControl   TEST 
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
		$.fn.oac_test.test  = function (){
			var test_start = window.setTimeout(function() {
				alert("TESTING!");
				// MUST BE TRUE ////		
				oacglobals["test_status"] = true ;
				oacglobals["pem_visible"] = true ;
				//alert("testmstates 0");
				//testMstates("0");
				//alert("testmstates 1");
				//testMstates("1");
				//alert("testmstates 2");
				//testMstates("2");
				//alert("testmstates 3");
				//testMstates("3");
				//alert("testmstates 4");
				//testMstates("4");
				alert("testmstates 5");
				testMstates("5");
				//alert("testmstates 6");
				//testMstates("6");
				//alert("testmstates 7");
				//testMstates("7");
						//alert(" current rfan mstate = " + oacglobals["test_data"][ "chassis"]["rfan"]["mstate"]);

				
				////////////////////
				
				///////// AUTO TEST ////////////
				//runAutoTestsMstate();	
					//runAutoTestsPopslots();
					//run7300LEDTests();

		
					//alert(" testing now oacglobals[test_data][ slot4 ][port1][cnf] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["cnf"] );
					//oacglobals["test_data"][ "slot4"  ]["port1"]["cnf"] = "XXXXX";
					//alert(" testing changed oacglobals[test_data][ slot4 ][port1][cnf] = " + oacglobals["test_data"][ "slot4"  ]["port1"]["cnf"] );
					
					
					
	// 				$('#7300-1group').css("opacity", 0 );
	//  				$('#7300-2group').css("opacity", 0 );
	//  				$('#7300-3group').css("opacity", 0 );
	//  				$('#7300-4group').css("opacity", 0 );
	//  				$('#7300-5group').css("opacity", 0 );
	//  				$('#7300-6group').css("opacity", 0 );
	// 				$('#sbc-1group').css("opacity", 0 );
	// 				$('#sbc-2group').css("opacity", 0 );
	// 				$('#sbc-3group').css("opacity", 0 );
	// 				$('#sbc-4group').css("opacity", 0 );
	// 				$('#sbc-5group').css("opacity", 0 );
	// 				$('#sbc-6group').css("opacity", 0 );
	// 				$('#2010-7group').css("opacity", 0 );
	// 				$('#2010-8group').css("opacity", 0 );	
					//popSlot(7, zx2010name);
					//popSlot(3, zxsbcname);
					//$('#2010-7group').css("visibility", "visible" );
					//$('#2010-7group').animate({svgTransform: 'translate(-130,-45)',svgOpacity: 100}, 2000);	
					//$('#7300-1group').css("visibility", "visible" );
					//$('#7300-2group').animate({svgTransform: 'translate(-243,-125)',svgOpacity: 100}, 2000);
				
					//$('#sbc-4group').css("visibility", "visible" );
					//$('#7300-1group').animate({svgTransform: 'translate(-252, -300)',svgOpacity: 100}, 4000);
					//$("#7300-1-glow").css("stroke", hotorange );
					//$('#7300-1ejectgroup').css("opacity", 0 );
						//$('#sbc-1group' ).css("opacity", 50 );
					
					//$('#sbc-1group').animate({svgTransform: 'translate(-270, 670)', svgOpacity: 100}, 2000);
					//$('#sbc-2group').animate({svgTransform: 'translate(-270, 610)', svgOpacity: 100}, 3000);
					//$('#sbc-3group').animate({svgTransform: 'translate(-270, 550)', svgOpacity: 100}, 2000);
					//$('#sbc-4group').animate({svgTransform: 'translate(-270, 490)', svgOpacity: 100}, 2000);
					//$('#sbc-5group').animate({svgTransform: 'translate(-270, 430)', svgOpacity: 100}, 2000);
					//$('#sbc-6group').animate({svgTransform: 'translate(-270, 370)', svgOpacity: 100}, 2000);
	/*				$('#7300-1group').animate({svgTransform: 'translate(-16, -570)', svgOpacity: 100}, 2000);
					$('#7300-2group').animate({svgTransform: 'translate(-16, -630)', svgOpacity: 100}, 3000);
					$('#7300-3group').animate({svgTransform: 'translate(-16, -690)', svgOpacity: 100}, 2000);
					$('#7300-4group').animate({svgTransform: 'translate(-16, -750)', svgOpacity: 100}, 2000);
					$('#7300-5group').animate({svgTransform: 'translate(-16, -810)', svgOpacity: 100}, 2000);
					$('#7300-6group').animate({svgTransform: 'translate(-16, -870)', svgOpacity: 100}, 2000);	*/			
					//$("#led2010-7-14l").css("fill", red );
					//$("#led2010-7-14r").css("fill", amber );
					//$("#led2010-7-15l").css("fill", blue );
					//$("#led2010-7-15r").css("fill", white );
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
								alert("run7300ledtests for slot "+i+" misc ON");
								modifyTestData("7300ledtests", i, "misc_on");
							}
						}
					break;
					case 12 * addedcnt :
						for (var i=1; i <7; i++){
							if (oacglobals["test_data"][ "slot" + i ]["name"] ==  oacglobals["svg7300name"] ){
								alert("run7300ledtests for slot "+i+" misc OFF");
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
		
		function runAutoTestsPopslots(){
			// try popping all types of board in slots 1-6
//alert("Test: popslots starting 7300name= " + oacglobals["svg7300name"]);
			var count = 0;
			var addedcnt =  5 ;
			alert("Popslots test starting: SBC boards");
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


						alert("Test: popslots slot  board " + oacglobals["svg7300name"]);
					break;
					case 9  * addedcnt :
						 modifyTestData("popslots", 1, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "1" + " board " + oacglobals["svg7300name"]);
						break;					
					case 10  * addedcnt :
						 modifyTestData("popslots", 2, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "2" + " board " + oacglobals["svg7300name"]);
						break;					
					case 11 * addedcnt :
						 modifyTestData("popslots", 3, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "3" + " board " + oacglobals["svg7300name"]);
					break;					
					case 12  * addedcnt:
						 modifyTestData("popslots", 4, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "4" + " board " + oacglobals["svg7300name"]);
					break;
					case 13  * addedcnt:
						modifyTestData("popslots", 5, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "5" + " board " + oacglobals["svg7300name"]);
					break;
					case 14  * addedcnt:
						modifyTestData("popslots", 6, oacglobals["svg7300name"]);
						//$.fn.oac.logDebug( data_src_str);
						alert("Test: popslots slot " + "6" + " board " + oacglobals["svg7300name"]);

					break;					
					case 17  * addedcnt:
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
		
		function runAutoTestsMstate(){
			// runs an animation of data to test mstate events
			// 6 counts between steps is a little too fast to see all the effects, 10 counts is about right but too slow to iterate
//alert("runautotestsmstate slot= " + slot);			
			var count = 0;
			var addedcnt =  5 ;
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
		
		
//
// end of closure
//
})(jQuery);