<?php
header('Content-Type: text/html; charset=utf-8');

function sendFeedback($feedback_email, $feedback_msg, $feedback_name, $feedback_subject) {


	/* EDIT THIS */
	$admin_email = "test@test.com";
	if ($feedback_subject == "Subject" || empty($feedback_subject) ) {
		$subj = "Email from your site";
	} else {
		$subj = $feedback_subject;
	}
	
	
	/* //EDIT THIS */
	
	
	$message = "
	<html>
	<head>
	  <title>Email from your site</title>
	</head>
	<body>
		<p><a href='mailto:".$feedback_email."'>".$feedback_name."</a> send this message:</p>
		<p>".$feedback_msg."</p>
		<p>".$subject."</p>
	</body>
	</html>
	";
	$headers  = 'MIME-Version: 1.0' . "\r\n";
	$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
	
	if ($feedback_name!=="Name" && $feedback_email!=="Email" && !empty($feedback_email) && !empty($feedback_msg) && !empty($feedback_name) ) {
		if ($feedback_email == "mail_error") {
			echo "<span class='ajaxok'>Invalid email address.</span>";
		} else {			
			mail($admin_email, $subj, $message, $headers);
			echo "<span class='ajaxok'>Thank You! Your message has been sent.</span>";	
		}
	} else {
		echo "<span class='ajaxalert'>Please fill the required field.</span>";		
	}
	
	
}

sendFeedback($_POST['email'], $_POST['message'], $_POST['name'], $_POST['subject']);
?>