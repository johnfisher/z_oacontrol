<?PHP
/*
=========================================================================

                               ZiPEC
                  ( Zenoss iPhone Event Console )

	Copyright 2008-2011 Willy Le Roy
	Released Under GNU GPL License - See LICENSE.txt

	ZiPEC is a 'webapp' allowing the user to display active
	alarms and events of a zenoss server on an iPhone or an iPod
	Touch

	Zenoss is an enterprise grade monitoring system that
	provides Inventory/Configuration, event, Performance and
	Availability management
	
	The Zenoss logo is a registered trademark of Zenoss, Inc.
	Zenoss and Open Enterprise Management are trademarks of 
	Zenoss, Inc. in the U.S. and other countries.

	'iPhone' and 'iPod Touch' are registered Trademarks
	of Apple Computers, Inc.

========================================================================
*/
?>

<!--<html manifest="ZiPEC.manifest.php">-->
<html>
<head>
	<meta HTTP-EQUIV="content-type" CONTENT="text/html; charset=ISO-8859-1"/>
	<meta name='viewport' content='width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;'/>
	<meta name="apple-mobile-web-app-capable" content="yes"/>
	<meta name="apple-mobile-web-app-status-bar-style" content="black"/>
	<meta name="format-detection" content = "telephone=no"/>
	<link  rel="apple-touch-startup-image" href="skins/<?PHP echo $cfg["ui_skin"]."/img/loading.png" ;?>" />
	<link rel='apple-touch-icon' href='skins/<?PHP echo $cfg["ui_skin"];?>/img/apple-touch-icon.png'/>
	<link type='text/css' rel='stylesheet' href='skins/<?PHP echo $cfg["ui_skin"]."/".$css_file ;?>' />
	<title>ZiPEC <?PHP echo $VERSION;?></title>
<script type='text/javascript' src='js/functions.js'></script>
<script type='text/javascript'>
localStorage.skin = "<?=$cfg[ui_skin]?>";
</script>
<script type='text/javascript' src='js/ajax.js'></script>
<script type='text/javascript' src='js/ajax-dynamic-content.js'></script>
<script type='text/javascript' src='js/iscroll.js'></script>
<script type='text/javascript' src='js/test.js'></script>

</head>
<body>
	<div class='container'>
	<form action='index.php' id='events_form' name='event_form'>
		<div class='header'></div>
		<div class='headerOverlay'></div>
		<div class='statusBar'><?PHP echo $page["status"];?></div>
		
			<div id='list_container' >
				<div id='list'>
					<?PHP echo $page["content"]?>
				</div>

			</div>
		<div class='toolbar'><?PHP echo $page["toolbar"];?></div>
		<div class='debug'><?PHP echo $page["debug"];?></div>
	</form>
	</div>
<script type='text/javascript'>
</script>
<script type='text/javascript' >
if ((!window.navigator.standalone)&&((window.navigator.platform=='iPhone')||(window.navigator.platform=='iPod'))) {
	document.getElementById('list').style.display='none';
	document.getElementById('install_warning').style.display='block';
} else { 
	window.onload = ajax_loadContent('list','?mode=update&context=<?=$context?>&show='+localStorage.show);
	window.onload = myScroll = new iScroll('list');
}
</script>
<div class='debug'><?PHP echo $page["debug"];?></div>
</body>
</html>
