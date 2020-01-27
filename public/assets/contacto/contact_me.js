$("#contactForm").submit(function (e){
    e.preventDefault();
    // get values from FORM
    var name = $("input#name").val();
    var email = $("input#email").val();
    var phone = $("input#phone").val();
    var message = $("textarea#message").val();

    $this = $("#sendMessageButton");
    $this.prop("disabled", true); // Disable submit button until AJAX call is complete to prevent duplicate messages
    $.ajax({
        url: "assets/contacto/contact_me.php",
        type: "POST",
        data: {
            name: name,
            phone: phone,
            email: email,
            message: message
        },
        cache: false,
        success: function() {
            // Success message
            alert("Su mensaje ha sido enviado correctamente, recibiras una respuesta prontamente.");
            $this.prop("disabled", false);
        },
        error: function() {
            // Fail message
            alert("Su mensaje no ha sido enviado, por favor intentar más tarde.");
        }
    });
});
