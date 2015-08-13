<?php

	error_reporting(E_ALL);

  $root = "../";
  ini_set("date.timezone","America/Los_Angeles");

	require_once("classes.php");
	require_once("search.php");

	$db = [
		"people" => new DataBase($root."data/people.db"),
		"archives" => new DataBase($root."data/archives.db")
	];

	$current_year = 1516;

  if (isset($_GET["wwuid"],$_GET["token"]) && $_GET["wwuid"] != "" && $_GET["token"] != "") {
  	$user = new loggedInUser(json_decode(json_encode(["wwuid"=>$_GET["wwuid"],"token"=>$_GET["token"]])));
  	if (!$user->verify())
			$errors[] = "invalid login";
		if (isset($_GET["verify"])) {
			echo (!isset($errors) ? json_encode($user) : "{}");
			die;
		}
  }

  if (isset($_GET["q"])) {
		if (isset($_GET["limits"])) $limits = explode(",",$_GET["limits"]);
		else $limits = [];
    $s = new Search($_GET["q"],$limits);
    $data["results"] = $s->fetch();
    unset($s);
  } else if (isset($_GET['cmd']) && !isset($errors))
		include_once($_GET['cmd'].".php");
	else if (!isset($data) && count($_GET) == 0)
		$errors[] = "no command specified";

	foreach ($db as $d)
		$d->close();

	if (!isset($data) && !isset($errors)) $errors[] = "no valid response";
	if (isset($errors)) $data["errors"] = $errors;

	echo json_encode($data);

?>
