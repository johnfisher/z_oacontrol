
YAHOO.zenoss.portlet.StaticDatasource.Table = Subclass.create(
     YAHOO.zenoss.portlet.StaticDatasource);
YAHOO.zenoss.portlet.StaticDatasource.Table.prototype = {
     __class__: "YAHOO.zenoss.portlet.StaticDatasource.Table",
     __init__: function(settings) {
	  this.postContent = settings.postContent;
	  this.superclass.__init__(
	       {settings:settings,
	        html:settings.html
	       });
     }
}
YAHOO.register('staticdatasourcetable', YAHOO.zenoss.portlet.StaticDatasource.Table,{});

var OAC2Portlet = YAHOO.zenoss.Subclass.create(
                YAHOO.zenoss.portlet.Portlet);
            OAC2Portlet.prototype = {

                // Define the class name for serialization
                __class__:"YAHOO.zenoss.portlet.OAC2Portlet",

                // __init__ is run on instantiation (feature of Class object)
                __init__: function(args) {

                    // args comprises the attributes of this portlet, restored
                    // from serialization. Take them if they're defined,
                    // otherwise provide sensible defaults.
                    args = args || {};
                    id = 'id' in args? args.id : getUID('OAC2'); 		    
                    title = 'title' in args? args.title: "OAC2 Portlet";
                    bodyHeight = 'bodyHeight' in args? args.bodyHeight:200;

                    // You don't need a refresh time for this portlet. In case
                    // someone wants one, it's available, but default is 0
                    refreshTime = 'refreshTime' in args? args.refreshTime: 60;

                    // The datasource has already been restored from
                    // serialization, but if not make a new one.
                    //datasource = 'datasource' in args? args.datasource :
                        //new YAHOO.zenoss.portlet.TableDatasource({

                            // Query string will never be that long, so GET
                            // is appropriate here
                            //method:'GET',

                            // Here's where you call the back end method
                            //url:'/zport/getOACDisplay',

                            // Set up the default queryArguments 
			    //queryArguments: {'name':'Kathy'}  
                       // });
		    datasource = 'datasource' in args? args.datasource : new
		    YAHOO.zenoss.portlet.StaticDatasource.Table (
			 {html:'', postContent: [] }
			 );

                    // Call Portlet's __init__ method with your new args
                    this.superclass.__init__(
                        {id:id, 
                         title:title,
                         datasource:datasource,
                         refreshTime: refreshTime,
                         bodyHeight: bodyHeight
                        }
                    );
		    //var path = "/usr/local/zenoss/zenoss/ZenPacks/ZenPacks.znyx.OAC2Portlet-1.0-py2.6.egg/ZenPacks/zny/OAC2Portlet/lib";		    
                    //this.includeJavaScript(path + '/'+ 'jquery.js');
                    //this.includeJavaScript(path + '/'+ 'jquery.svg.js');
                    //this.includeJavaScript(path + '/'+ 'jquery.svganim.js');
		    
                    // Create the settings pane for the portlet
                    //this.buildSettingsPane();
                },
		fill: function(contents) {
		    if (this.body) {
			if (contents.responseText) {
			    contents = contents.responseText;
			}
		    var oConfigs = {};
		    addElementClass(this.body, 'yui-skin-sam');
		    var columnDefs = [ {key:"name", label:"TEST"}, ];
		    var data=Array();

		    // Fill the array with something
		    //url="file:///home/kathyr/Downloads/kathy-sample/kathy_sm.html";
		    //data[0] = Array ("<a class=\"prettylink\" href=\""+url+"\" title=\""+this.datasource.postContent[0]+"\"></a>");
		    data[0] = Array("<div style=&quotWIDTH: 100%; OVERFLOW: auto&quot><table>Hello World, Here Is The First Line of Display</table></div>");
		    //data[1] = Array("<script type = 'text/javascript' src= '/++resource++OAC2Portlet/jquery-1.6.2.js'></script>");
		    //data[2] = Array("<script type = 'text/javascript' src= '/++resource++OAC2Portlet/jquery.svg.js'></script>");
		    //data[3] = Array("<script type = 'text/javascript' src= '/++resource++OAC2Portlet/jquery.svganim.js'></script>");		    
		    //data[4] = Array("<a href='/++resource++OAC2Portlet/kathy_sm.html'>View HTML file<a>");
		    //data[4] = Array("<embed src='/++resource++OAC2Portlet/grouptest1.svg' type='image/svg+xml'>");
		    data[1] = Array("<iframe src='/++resource++OAC2Portlet/kathy_sm.html'>/iframe>");
		    data[2] = Array("<div style=&quotWIDTH: 100%; OVERFLOW: auto&quot><table>Hello World, Here Is The Second Line of Display</table></div>");
		    
		    if ('dataSource' in this) {
			 this.dataSource.liveData = data;
		    } else {
			 var dataSource = new YAHOO.util.DataSource(data);
			 dataSource.responseSchema = {fields:["name"]}; 
			 dataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
			 this.dataSource = dataSource;
		    }
		    
		    var myDataTable = new YAHOO.widget.DataTable(this.body, columnDefs, this.dataSource, oConfigs);
		    this.dataTable = myDataTable;
		    
		    
		    }
		},
		includeJavaScript: function(jsFile) {
		     document.write('<script type = "text/javascript" src="' + jsFile + '"></script>');
		}
		
            }
            YAHOO.zenoss.portlet.OAC2Portlet = OAC2Portlet;
