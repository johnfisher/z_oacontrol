var OACJF = YAHOO.zenoss.Subclass.create(
                YAHOO.zenoss.portlet.Portlet);
            OACJF.prototype = {

                // Define the class name for serialization
                __class__:"YAHOO.zenoss.portlet.OACJF",
		__init__: function(args) {
		    args = args || {};
		    id = 'id' in args? args.id : getUID('sitewindow');
		    //baseLoc = 'baseLoc' in args? args.baseLoc : YAHOO.zenoss.portlet.DEFAULT_SITEWINDOW_URL;
		    baseLoc = 'http://john:8080/zport/html/demo3.html' ;
		    bodyHeight = 'bodyHeight' in args? args.bodyHeight : 800;
		    title = 'title' in args? args.title: "ZX1900 Chassis View";
		    refreshTime = 'refreshTime' in args? args.refreshTime : 600;
		    miscthing = 'miscthing' in args? args.miscthing: "miscthing";
		    this.mapobject = null;
		    var datasource = 'datasource' in args? 
			args.datasource:
			//////////////////////////////////////////////////////
			// YOU CAN HAVE THIS
			new YAHOO.zenoss.portlet.SiteWindowDatasource(
			   {'baseLoc':baseLoc?baseLoc:''});
			/////////////////////////////////////////////////////
			// or YOU CAN HAVE THAT but not both?
			// taken from OACPortlet
			new YAHOO.zenoss.portlet.TableDatasource({
                            // Query string will never be that long, so GET
                            // is appropriate here
                            method:'GET',
  
                            // Here's where you call the back end method
                            url:'/zport/getOACDisplay',

                            // Set up the default queryArguments 
			    queryArguments: {'name':'Kathy'}  
                        });
		    this.superclass.__init__(
			{id:id, title:title, refreshTime:refreshTime, miscthing:miscthing,
			datasource:datasource, bodyHeight:bodyHeight}
		    );
		    //this.buildSettingsPane();
		    setStyle(this.body, {'overflow-y':'hidden'});
		},
		buildSettingsPane: function() {
		    s = this.settingsSlot;
		    /*
		    this.locsearch = YAHOO.zenoss.zenautocomplete.LocationSearch(
			'URL (http://www.zenoss.com)', s);
		    */
		    this.locsearch = INPUT({'value':this.datasource.baseLoc}, []);
		    var container = DIV({
			'class':'autocompleter-container portlet-settings-control'
		    }, [
			DIV({'class':'control-label'}, 'URL (http://www.zenoss.com)'),
			this.locsearch
		      ]
		    );
		    //alert("baseloc is " + baseLoc);
		    s.appendChild(container);
		},
		submitSettings: function(e, settings) {
		    baseLoc = this.locsearch.value;
		    if (baseLoc.length<1) baseLoc = this.datasource.baseLoc;
		    //this.locsearch.value = '';
		    this.superclass.submitSettings(e, {'baseLoc':baseLoc});
		},
		startRefresh: function(firsttime) {
		    if (!firsttime) this.datasource.get(this.fill);
		    if (this.refreshTime>0)
			this.calllater = callLater(this.refreshTime, this.startRefresh);
		}
            }
            YAHOO.zenoss.portlet.OACJF = OACJF;
	 
	    
	    
	    
	    //alert("end of js file");
	    //var ranint = getRandomInteger(5, 10);
	    //alert("random int = " + ranint);
