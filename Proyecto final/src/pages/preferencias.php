<?php 

    session_name("login");
    session_start();

    //Mensaje personalizado dependiendo del usuario
    $bienvenida = "";
    if (isset($_SESSION['usuario'])){
        if ($_SESSION['usuario'] == "guest"){
            $bienvenida = "Bienvenido, invitado";
        }
        elseif ($_SESSION['usuario'] == "admin"){
            $bienvenida = "Bienvenido, admin";
        }
    }


?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Jeremi Martin</title>
    <link rel="stylesheet" href="../css/preferencias.css">
</head>
<body>

    <header>
    <div></div>
    <nav>
        <ul>
            <li><a id="tienda" href="../../index.php">Tienda</a></li>
            <li><a id="preferencias" href="preferencias.php">Preferencias</a></li>
            <li><a id="carrito" href="carrito.php">Carrito</a></li>
            <li><a id="deseados" href="deseados.php">Deseados</a></li>
            
            <?php
                //Poner cerrar sesión o iniciar sesion
                if ($bienvenida !== ""){
                    echo "<li><a href='logout.php' id='close_sesion'>Cerrar sesión</a></li>";
                    echo $bienvenida;
                }
                else{
                    echo "<li><a href='login.php' id='ini_sesion'>Iniciar sesión</a></li>";
                }
            
            ?>
        </ul>
    </nav>
    </header>

    <form class="eleccion" method="post">

        <div class="preferencias_imagenes">
            <img src="../img/horda.png" class="img_horda">
            <button class="btn_horda" name="porlahorda" id="horda">¡Por la horda!</button>
        </div>

        <div class="preferencias_imagenes"> 
            <img src="../img/alianza.png">
            <button class="btn_ali" name="porlaalianza" id="alianza">¡Por la alianza!</button>
        </div>

    </form>

    <?php
    
    //Crear la cookie horda o alianza como preferencias
    if (isset($_POST['porlahorda'])){
        setcookie("horda", "horda",  time() + 60*60*24*7);
        header('Location:horda_index.php');
        die();
    }
    elseif(isset($_POST['porlaalianza'])){
        setcookie("alianza", "alianza",  time() + 60*60*24*7);
        header('Location:alianza_index.php');
        die();
    }

    
    ?>

    <script src="../js/preferencias.js"></script>

</body>
</html>