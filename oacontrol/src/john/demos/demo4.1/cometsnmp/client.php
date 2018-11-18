<html>
<head>
	<title>Comet demo</title>
	<style type="text/css">
    	.hiddenIframe {
    		position:absolute;
    		top:0px;
    		left:0px;
    		display:block;
    		z-index:-999;
    		visibility:hidden;
		}
	</style>
</head>
<body>
<div id="debug">debug</div>
<div id="content">The snmp output will be shown here</div>
<script type="text/javascript">
 
	var content = document.getElementById('content');
	var debug = document.getElementById('debug');
	var dumpText = function(text){
		content.innerHTML = content.innerHTML + '<BR>'+ text;
	}
</script>

<iframe src="backend.php" class="hiddenIframe"></iframe>
</body>
</html>