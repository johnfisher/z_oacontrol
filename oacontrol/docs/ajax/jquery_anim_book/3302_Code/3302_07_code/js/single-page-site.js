(function($){
				
	//remove page content
	$("#content").empty();
	
	//cache selectors and init variables
	var win = $(window),
		links = $("header nav a"),
		content = $("#content"),
		positions = {},
		
		//get screensize
		screensize = {
			width: win.width(),
			height: win.height()
		},
		
		//create container for pages
		pages = $("<div></div>", {
			id: "pages"
		}).bind("contentLoaded", function() {
		
			var multiplier = Math.ceil(links.length / 2);
			
			//add pages to container
			$(this).appendTo(content).parent().addClass("full");
			
			//set container dimensions based on window size and number of pages
			content.width(screensize.width * multiplier + screensize.width);
			content.height(screensize.height * multiplier);
			
			//add class to header and footer
			content.parent().find("header, footer").addClass("fixed").closest("body").css("padding-top", $("header").outerHeight());
			
			//add handler for nav clicks
			links.add("footer nav a").click(function(e) {
				
				e.preventDefault();
				
				//get id of target 'page'
				var id = (this.href.indexOf("#") != -1) ? this.href.split("#")[1] : "page-" + this.title.split(" ")[1];
					navs = $("header").add("footer");
				
				//hide header and footer
				navs.fadeOut("fast");
				
				//navigate to new 'page'
				$.scrollTo({ top: positions[id].top, left: positions[id].left }, 800, function() {
					navs.slideDown("fast");
				});													
			});						
		});
	
	//process nav links
	links.each(function(i) {
		
		var id = "page-" + (i + 1);
		
		//add positions to object
		positions[id] = {};
		positions[id].left = (i === links.length - 1) ? screensize.width * i - (screensize.width / 2) - (960 / 2) + parseInt(content.css("paddingLeft")) : screensize.width * i;
		positions[id].top = (i % 2) ? screensize.height : 0;				
									
		//create new page area and add to pages
		$("<div></div>", {
			"class": "page",
			
			//get all of the page's content
			load: this.href + " #content > *"
		}).css({
			
			//position each page
			left: positions[id].left,
			top: positions[id].top
		}).appendTo(pages);
						
		//point to new page areas
		this.href = "#" + id;
							
		//tigger custom event when all pages loaded
		if(i == links.length - 1) {	
			
			pages.trigger("contentLoaded");
		}
	});
			
})(jQuery);