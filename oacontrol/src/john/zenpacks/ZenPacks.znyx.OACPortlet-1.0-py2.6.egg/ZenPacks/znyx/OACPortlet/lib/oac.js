/* Zmyx Networks OAControl
    */


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
    document.getElementById("debug").innerHTML += (".... " + newtext) ;
}

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

