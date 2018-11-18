<?PHP



// DB	
// Opens a SQL connection to the DB server specified in include/config.php 

function DB_Connect() {
	global $cfg ;
	$c = @mysql_connect($cfg[db_host],$cfg[db_user],$cfg[db_pass]) ;
	return $c ;
}


// Closes a given SQL connection /*{{{*/
// in : SQL resource ; out : bool
function DB_Close($r) {
	$o = @mysql_close($r);
	return $o ;
}



?>
