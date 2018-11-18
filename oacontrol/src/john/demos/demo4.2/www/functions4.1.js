

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

var cometfeed = 'backend4.2.php' ;

function main(){

  //var comet = new Comet();
  //comet.connect();

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
////////// COMET //////////////////////////////////////////////////
  //var Comet = Class.create();
//   Comet.prototype = {
//  
//     timestamp: 0,
//     url: './'. cometfeed  ,
//     noerror: true,
//  
//     initialize: function() { },
//  
//     connect: function()
//     {
//       this.ajax = new Ajax.Request(this.url, {
//         method: 'get',
//         parameters: { 'timestamp' : this.timestamp },
//         onSuccess: function(transport) {
//           // handle the server response
//           var response = transport.responseText.evalJSON();
//           this.comet.timestamp = response['timestamp'];
//           this.comet.handleResponse(response);
//           this.comet.noerror = true;
//         },
//         onComplete: function(transport) {
//           // send a new ajax request when this request is finished
//           if (!this.comet.noerror)
//             // if a connection problem occurs, try to reconnect each 5 seconds
//             setTimeout(function(){ comet.connect() }, 5000); 
//           else
//             this.comet.connect();
//           this.comet.noerror = false;
//         }
//       });
//       this.ajax.comet = this;
//     },
//  
//     disconnect: function()
//     {
//     },
//  
//     handleResponse: function(response)
//     {
//       //$('content').innerHTML += '<div>' + response['msg'] + '</div>';
//        logDebug(response['msg']);
//     },
//  
//     doRequest: function(request)
//     {
//       new Ajax.Request(this.url, {
//         method: 'get',
//         parameters: { 'msg' : request }
// 	});
//       }
//   }

////////// COMET end//////////////////////////////////////////////////

function overTempAnim(){
// turning off event handlers for animation
//???????? what to do ????????
    // this popslotting takes 2100 ms:
    $('#slot3notify').css("background", ltnotify);
    document.getElementById("slot3notify").innerHTML = ("Load ZX7300") ;
    $('#slot4notify').css("background", ltnotify);
    document.getElementById("slot4notify").innerHTML = ("Load SBC") ;
    popSlot3_ZX7300();
    popSlot4_Sbc();



    var count = 0;
    var short_interval = window.setInterval(function() {
    // runs about half speed of what you'd expect! so use a repeat ms number twice nominal
     switch(count) {
	case 4:
	    $('#slot3notify').css("background", idlenotify);
	    document.getElementById("slot3notify").innerHTML = ("") ;
	    $('#slot4notify').css("background", idlenotify);
	    document.getElementById("slot4notify").innerHTML = ("") ;
	    $('#tempnotify').css("background", ltnotify);
	    document.getElementById("tempnotify").innerHTML = ("Main Fan- over 40C threshold: 42C") ;
	    pulse('#fan-lglow');
	break;
	case 13:
	    pulse('#fan-lglow');
	break;
	case 21:
	    pulse('#fan-lglow');
	break;
	case 28:
	    document.getElementById("tempnotify").innerHTML = ("") ;
	    $('#tempnotify').css("background", idlenotify);
	break;
	case 29:
	    $('#tempnotify').css("background", ltnotify);
	    document.getElementById("tempnotify").innerHTML = ("Right Fan- over 40C threshold: 45C") ;
	    pulse('#sidefan-rglow');
	break;
	case 37:
	    pulse('#sidefan-rglow');
	break;
	case 44:
	    document.getElementById("tempnotify").innerHTML = ("") ;
	    $('#tempnotify').css("background", idlenotify);
	break;
	case 45:
	    $('#tempnotify').css("background", ltnotify);
	    document.getElementById("tempnotify").innerHTML = ("Left Fan- over 40C threshold: 44C") ;
	    pulse('#sidefan-lglow');
	break;
	case 53:
	    pulse('#sidefan-lglow');
	break;
	case 60:
	    document.getElementById("tempnotify").innerHTML = ("") ;
	    $('#tempnotify').css("background", idlenotify);
	break;
 	case 61:
	    $('#tempnotify').css("background", ltnotify);
	    document.getElementById("tempnotify").innerHTML = ("ZX1900A- over 40C threshold: 43C") ;
	    pulse('#1900aglow');
 	break;
 	case 69:
	    pulse('#1900aglow');
 	break;
	case 76:
	    document.getElementById("tempnotify").innerHTML = ("") ;
	    $('#tempnotify').css("background", idlenotify);
	break;
 	case 77:
	    $('#tempnotify').css("background", ltnotify);
	    document.getElementById("tempnotify").innerHTML = ("ZX1900B- over 40C threshold: 45C") ;
	    pulse('#1900bglow');
	break;
	case 85:
	    pulse('#1900bglow');
	break;
	case 92:
	    document.getElementById("tempnotify").innerHTML = ("") ;
	    $('#tempnotify').css("background", idlenotify);
	break;
	case 93:
	    $('#tempnotify').css("background", ltnotify);
	    document.getElementById("tempnotify").innerHTML = ("Slot3 ZX7300- over 40C threshold: 45C") ;
	    pulse('#7300-3glow');
	break;
	case 101:
	    pulse('#7300-3glow');
	break;
	case 108:
	    document.getElementById("tempnotify").innerHTML = ("") ;
	    $('#tempnotify').css("background", idlenotify);
	break;
	case 109:
	    $('#tempnotify').css("background", ltnotify);
	    document.getElementById("tempnotify").innerHTML = ("Slot4 SBC- over 35C threshold: 36C") ;
	    pulse('#sbc-4glow');
	break;
	case 117:
	    pulse('#sbc-4glow');
	break;
	case 124:
	    document.getElementById("tempnotify").innerHTML = ("") ;
	    $('#tempnotify').css("background", idlenotify);
	break;
	case 125:
	    $('#tempnotify').css("background", ltnotify);
	    document.getElementById("tempnotify").innerHTML = ("Shelf manager- over 30C threshold: 34C") ;
	    pulse('#shmcglow');
	break;
	case 133:
	    pulse('#shmcglow');

	break;
	case 141:
	    document.getElementById("tempnotify").innerHTML = ("") ;
	    $('#tempnotify').css("background", idlenotify);
	break;
 	case 142:
	    location.reload();
	    return "";
 	break;

      }
      count++;
    }, 700 );
    
}
function pulse(myselector){
      var mycolor = $(myselector).css("stroke");
      $(myselector).animate({svgStroke: coolorange }, 400, 
	  function(){ $(myselector).animate({svgStroke: hotorange}, 2000, 
	  function(){ $(myselector).animate({svgStroke: coolorange}, 800);});});
      $(myselector).css("stroke", mycolor).delay(3200);
}


function pulsing(myselector){
    var count = 0;
    var mycolor = $(myselector).css("stroke");
    var short_interval = window.setInterval(function() {
      if ( count > 3 ) {
	  $(myselector).css("stroke", coolorange);
	  short_interval.clear(); 
      }
      $(myselector).animate({svgStroke: coolorange }, 800);
      $(myselector).delay(1200).animate({svgStroke: hotorange}, 2000);
      count++;
    }, 3800 );
    $(myselector).css("stroke", mycolor);
}

