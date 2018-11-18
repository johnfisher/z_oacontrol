var OACPortlet = YAHOO.zenoss.Subclass.create(
                YAHOO.zenoss.portlet.Portlet);
            OACPortlet.prototype = {

                // Define the class name for serialization
                __class__:"YAHOO.zenoss.portlet.OACPortlet",

                // __init__ is run on instantiation (feature of Class object)
                __init__: function(args) {

                    // args comprises the attributes of this portlet, restored
                    // from serialization. Take them if they're defined,
                    // otherwise provide sensible defaults.
                    args = args || {};
                    id = 'id' in args? args.id : getUID('OAC');
                    title = 'title' in args? args.title: "OAC Portlet";
                    bodyHeight = 'bodyHeight' in args? args.bodyHeight:200;

                    // You don't need a refresh time for this portlet. In case
                    // someone wants one, it's available, but default is 0
                    refreshTime = 'refreshTime' in args? args.refreshTime: 60;

                    // The datasource has already been restored from
                    // serialization, but if not make a new one.
                    datasource = 'datasource' in args? args.datasource :
                        new YAHOO.zenoss.portlet.TableDatasource({

                            // Query string will never be that long, so GET
                            // is appropriate here
                            method:'GET',

                            // Here's where you call the back end method
                            url:'/zport/getOACDisplay',

                            // Set up the default queryArguments 
			    queryArguments: {'name':'Kathy'}  
                        });


                    // Call Portlet's __init__ method with your new args
                    this.superclass.__init__(
                        {id:id, 
                         title:title,
                         datasource:datasource,
                         refreshTime: refreshTime,
                         bodyHeight: bodyHeight
                        }
                    );

                    // Create the settings pane for the portlet
                    //this.buildSettingsPane();
                }
            }
            YAHOO.zenoss.portlet.OACPortlet = OACPortlet;
