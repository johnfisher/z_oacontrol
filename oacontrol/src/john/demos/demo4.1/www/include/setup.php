<?
/*
	ZiPEC Setup UI

*/
if ($context=="Array") { $selected_context = "No context selected"; } else { $selected_context = $context ; }
?>
<script type='text/javascript'>
function save_settings() {
	localStorage.login=document.getElementById('login').value ;
	localStorage.password=document.getElementById('password').value ;
}
</script>
<div id='setup_page'>
	<h2>Setup</h2>
	<p>ZiPEC v<?=$VERSION?></p>
	<form id='setup' onsubmit='save_settings();'>
	<label for='context'>Context</label><input type='text' id='context' name='context' value='<?=$selected_context?>' readonly />
	<label for='login' >Login</label><input type='text' id='login' name='login' value='' />
	<br/><i>(Used as the owner name in the log)</i>
	<!-- // No authentication is really being done, so we just use login to write the owner name when events are aknowledged
	<label for='password' >Password</label><input type='password' id='password' name='password' value='' />
	-->
	<br/>
	<input type='submit' value='Save' />
</form>
</div>
<script type='text/javascript'>
	// load settings from localStorage
	document.getElementById('login').value=localStorage.login ;
	document.getElementById('password').value=localStorage.password ;
	document.getElementById('setup').src='skins/'+localStorage.skin+'/img/setup_on.png';
</script>
