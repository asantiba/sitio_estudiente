<?php
	// Check for empty fields
	if(!empty($_POST['name']) &&
		!empty($_POST['email']) &&
	   	!empty($_POST['message'])){
	   	return false;
	}
	   
	$name = $_POST['name'];
	$email_address = $_POST['email'];
	$phone = $_POST['phone'];
	$message = $_POST['message'];
	
	$to = 'pyramidwks@gmail.com'; //Agregue su dirección de correo electrónico, aquí es donde el formulario enviará un mensaje.

	$email_subject = "Mensaje de $name";
	$email_body = "Se han contactado mediante el sitio web de EsTuDiente.\n\n"."Nombre: $name\n\nMail: $email_address\n\nCelular: $phone\n\nMensaje:\n$message";
	$headers = "From: canespfam@gmail.com"."\r\n"; // Esta es la dirección de correo electrónico del mensaje generado será. Recomendamos usar algo como noreply@yourdomain.com
	$headers .= "Reply-To: canespfam@gmail.com"."\r\n";   
	mail($to, $email_subject, $email_body, $headers);
	return true;         
?>