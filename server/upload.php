<?php

	$target_dir = $root."uploads/".$user->id."/";
	if (!file_exists($target_dir))
		mkdir($target_dir);

	$target_file = $target_dir.intTime()."_".basename($_FILES["uFile"]["name"]);
	$imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);

	// Check if image file is a actual image or fake image
	if(isset($_POST["submit"])) {
	    $check = getimagesize($_FILES["uFile"]["tmp_name"]);
	    if ($check !== false) {
    	} else {
	        $errors[] = "File is not an image.";
	    }
	}

	// Check file size
	if ($_FILES["uFile"]["size"] > 5000000) {
	    $errors[] = "Sorry, your file is too large.";
	}

	// Allow certain file formats
	if (!in_array($imageFileType,["jpg","png","jpeg"])) {
	    $errors[] = "Sorry, only JPG, JPEG, & PNG files are allowed.";
	}

	if (isset($errors)) {
	    $errors[] = "Sorry, your file was not uploaded.";
	} else {
	    if (move_uploaded_file($_FILES["uFile"]["tmp_name"], $target_file)) {
	        $data = "The file ". basename( $_FILES["uFile"]["name"]). " has been uploaded.";
	    } else {
	        $errors[] = "Sorry, there was an error uploading your file.";
	    }
	}

?>