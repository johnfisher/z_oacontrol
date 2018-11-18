<?PHP


// Default parameters don't need to be edited if runs on the same machine as Zenoss
$cfg = Array(	
	// Zenoss Database Parameters
		"db_host" =>	"127.0.0.1:3307",	// Hostname/IP and TCP port of the Zenoss MySQL service
		"db_base" =>	"events",		// Zenoss Events MySQL Database
		"db_tabl" =>	"status",		// Zenoss events MySQL table name
		"db_user" =>	"zenoss",		// Zenoss MySQL user
		"db_pass" =>	"zenoss",		// Zenoss MySQL password

	// CSS
		"css"     =>    "znyx", 		// Znyx own css

	// Event Filtering - Only displays events that match this filter (SQL syntax - see README.txt for examples)
		"ev_filt" =>	"status.prodState=1000 and status.severity>1 and status.eventstate!=2",


	// Event Ordering - SQL 'Order by' syntax applies
		"ev_ordr" =>	"severity DESC,lasttime DESC",

	// Force iphone stylesheet, whatever device is used
		"cssforc" =>	TRUE,			// TRUE or FALSE : use iphone.css whatever device/browser is used
	// UI Parameters
		"ui_skin" =>	"default",		// Layout Skin (See README.txt)
		"ui_lang" =>	"en_US",		// Available Locales : en_US, fr_FR
		"ui_refr" =>	"60" 			// Page Refresh Time in Seconds
);



?>