<?php

	foreach (glob("*.sql") as $sqlfile) {
		$dbfile = "../".substr($sqlfile,0,-4).".db";
		//$db = new SQLite3($dbfile);
		//shell_exec('db.sh '.$dbfile.' '.$sqlfile);
		echo "test";
	}

?>
