<?php

    //Iniciamos la sesion y destruimos los valores
    session_name("login");
    session_start();
    session_destroy();

    header('Location:../../index.php');
    die();

?>

<body>



</body>