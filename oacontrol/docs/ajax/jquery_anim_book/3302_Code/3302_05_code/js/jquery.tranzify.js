/*
	tranzify jQuery plugin version 1.0
	
	Copyright (c) 2010 Dan Wellman
  
	Dual licensed under the MIT and GPL licenses:
	http://www.opensource.org/licenses/mit-license.php
	http://www.gnu.org/licenses/gpl.html
	
*/

;(function($) {
	
	$.tranzify = {
		
		//set some defaults
		defaults: {
			transitionWidth: 40,
			transitionHeight: "100%",
			containerID: "overlay",
			transitionType: "venetian",
			prevID: "prev",
			nextID: "next",
			visibleClass: "visible"
		}
	};
	
	$.fn.extend({
		tranzify: function(userConfig) {
																
			//use defaults or properties supplied by user
			var config = (userConfig) ? $.extend({}, $.tranzify.defaults, userConfig) : $.tranzify.defaults;
			
			//store current element and get its dimensions
			config.selector = "#" + this.attr("id");
			
			//define multiplyer for transitions
			config.multi = parseInt(this.width()) / config.transitionWidth;
			
			//create prev/next links	
			$.tranzify.createUI(config);
						
			//return the jquery object for chaining
			return this;
		}
	});
	
	$.tranzify.createUI = function(config) {
		
		//create new list element and get number of images
		var imgLength = $(config.selector).find("img").length,
			
			//create prev link
			prevA = $("<a></a>", {
				id: config.prevID,
				href: "#",
				html: "&laquo;",
				click: function(e) {
					e.preventDefault();
					
					//protect transitions from multiple clicks
					$(config.selector).find("a").css("display", "none");
					
					//create transition overlay
					$.tranzify.createOverlay(config);
				
					//show previous image
					var currImg = $("." + config.visibleClass, $(config.selector));
					if(currImg.prev().filter("img").length > 0) {
						currImg.removeClass(config.visibleClass).prev().addClass(config.visibleClass);
					} else {
						currImg.removeClass(config.visibleClass);
						$(config.selector).find("img").eq(imgLength - 1).addClass(config.visibleClass);
					}
					
					//run tranzition
					$.tranzify.runTransition(config);
					
				}
			}).appendTo(config.selector),
			
			//create next link
			nextA = $("<a></a>", {
				id: config.nextID,
				href: "#",
				html: "&raquo;",
				click: function(e) {
					e.preventDefault();
					
					$(config.selector).find("a").css("display", "none");
					
					$.tranzify.createOverlay(config)
					var currImg = $("." + config.visibleClass, $(config.selector));														
					if(currImg.next().filter("img").length > 0) {
						currImg.removeClass(config.visibleClass).next().addClass(config.visibleClass);
					} else {
						currImg.removeClass(config.visibleClass);
						$(config.selector).find("img").eq(0).addClass(config.visibleClass);
					}
					$.tranzify.runTransition(config);
				}
			}).appendTo(config.selector);
	};
	
	//create overlay function
	$.tranzify.createOverlay = function(config) {
		
		//set some vars
		var	posLeftMarker = 0,
			bgHorizMarker = 0
			
			//create overlay element
			overlay = $("<div></div>", {
				id: config.containerID
			});
		
		//create transition elements
		for (var x = 0; x < config.multi; x++) {								
			$("<div></div>", {
				width: config.transitionWidth,
				height: config.transitionHeight,
				css: {
					backgroundImage: "url(" + $("." + config.visibleClass, $(config.selector)).attr("src") + ")",
					backgroundPosition: bgHorizMarker + "px 0",
					left: posLeftMarker,
					top: 0
				}
			}).appendTo(overlay);
			bgHorizMarker -=config.transitionWidth;
			posLeftMarker +=config.transitionWidth; 
			
		}
		overlay.insertBefore("#" + config.prevID);
	};
	
	//master transitions function
	$.tranzify.runTransition = function(config) {
		var transOverlay = $("#" + config.containerID),
			transEls = transOverlay.children(),
			len = transEls.length - 1;
		
		switch(config.transitionType) {
			case "venetian": 
			transEls.each(function(i) {
				transEls.eq(i).animate({
					width: 0
				}, "slow", function() {								
					if (i === len) {
						
						//remove overlay when complete
						transOverlay.remove();
						
						//show link again
						$(config.selector).find("a").css("display", "block");
					}
				});
			});
			break;
			case "strip":
			var counter = 0;
			
			function strip() {
				transEls.eq(counter).animate({
					height: 0
				}, 150, function() {								
					if (counter === len) {
						transOverlay.remove();
						$(config.selector).find("a").css("display", "block");
					} else {
						counter++;
						strip();
					}
				});
			}
			strip();
		}
	};
})(jQuery);