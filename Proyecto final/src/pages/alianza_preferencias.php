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
    <link rel="stylesheet" href="../css/alianza_preferencias.css">
</head>
<body>

    <header>
    <div class="logo"></div>
    <nav>
        <ul>
            <li><a id="tienda" href="alianza_index.php">Tienda</a></li>
            <li><a id="preferencias" href="alianza_preferencias.php">Preferencias</a></li>
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

        <div class="div_raza">
            <h2>Elige tu raza</h2>
            
            <ul>
                <li>
                    <div class="boton-con-imagen">
                        <button class="humano" name="humano" id="humano">Humano</button>
                        <img class="icono" src="../img/razas/Humano.png" alt="Humano">
                    </div>
                </li>
                <li>
                    <div class="boton-con-imagen">
                        <button class="enano" name="enano" id="enano">Enano</button>
                        <img class="icono" src="../img/razas/Enano.png" alt="Enano">
                    </div>
                </li>
                <li>
                    <div class="boton-con-imagen">
                        <button class="draenei" name="draenei" id="draenei">Draenei</button>
                        <img class="icono" src="../img/razas/Draenei.png" alt="Draenei">
                    </div>
                </li>
                <li>
                    <div class="boton-con-imagen">
                        <button class="huargen" name="huargen" id="huargen">Huargen</button>
                        <img class="icono" src="../img/razas/Huargen.png" alt="Huargen">
                    </div>
                </li>
                <li>
                    <div class="boton-con-imagen">
                        <button class="elfo" name="elfo" id="elfo">Elfo de la noche</button>
                        <img class="icono" src="../img/razas/Elfonoche.png" alt="Elfo de la noche">
                    </div>
                </li>
                <li>
                    <div class="boton-con-imagen">
                        <button class="gnomo" name="gnomo" id="gnomo">Gnomo</button>
                        <img class="icono" src="../img/razas/Gnomo.png" alt="Gnomo">
                    </div>
                </li>
            </ul>


        </div>

        <div class="div_raza">  
            <h2>Elige tu idioma</h2>
            <ul>
                <button class="sp" id="sp">Español</button>
                <button class="en" id="en">English</button>
                <button class="it" id="it">Italiano</button>
                <button class="al" id="al">Deutsch</button>
                <button class="fr" id="fr">Français</button>
                <button class="jp" id="jp">日本語</button>
            </ul>
        </div>

    </form>
    <form class="div_abandonar" method="post">
        <button class="abandonar" name="abandonar" id="abandonar">Abandonar alianza</button>
    </form>

    <?php

        //Crear la cookie para asignar el color a los botones de la tienda
        if (isset($_POST['humano'])) {
            setcookie("colorAlianza", "#F5DEB3", time() + 60*60*24*7);
        } 
        elseif (isset($_POST['enano'])) {
            setcookie("colorAlianza", "#D2691E", time() + 60*60*24*7);
        } 
        elseif (isset($_POST['draenei'])) {
            setcookie("colorAlianza", "#5F9EA0", time() + 60*60*24*7);
        } 
        elseif (isset($_POST['huargen'])) {
            setcookie("colorAlianza", "#708090", time() + 60*60*24*7);
        } 
        elseif (isset($_POST['elfo'])) {
            setcookie("colorAlianza", "#191970", time() + 60*60*24*7);
        } 
        elseif (isset($_POST['gnomo'])) {
            setcookie("colorAlianza", "#FFD700", time() + 60*60*24*7);
        }

        


        //Abandonar
        if (isset($_POST['abandonar'])){
            setcookie("alianza", "alianza",  time() - 3600);
            header('Location:preferencias.php');
            die();
        }
    
    ?>

    <script src="../js/alianza_preferencias.js"></script>

</body>
</html>