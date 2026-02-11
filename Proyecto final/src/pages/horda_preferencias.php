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
    <link rel="stylesheet" href="../css/horda_preferencias.css">
</head>
<body>

    <header>
    <div class="logo"></div>
    <nav>
        <ul>
            <li><a href="horda_index.php" id="tienda">Tienda</a></li>
            <li><a href="horda_preferencias.php" id="preferencias">Preferencias</a></li>
            <li><a href="carrito.php" id="carrito">Carrito</a></li>
            <li><a href="deseados.php" id="deseados">Deseados</a></li>
                        
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
                        <button class="orco" name="orco" id="orco">Orco</button>
                        <img class="icono" src="../img/razas/Orco.png" alt="Orco">
                    </div>
                </li>
                <li>
                    <div class="boton-con-imagen">
                        <button class="tauren" name="tauren" id="tauren">Tauren</button>
                        <img class="icono" src="../img/razas/Tauren.png" alt="Tauren">
                    </div>
                </li>
                <li>
                    <div class="boton-con-imagen">
                        <button class="trol" name="trol" id="trol">Trol</button>
                        <img class="icono" src="../img/razas/Trol.png" alt="Trol">
                    </div>
                </li>
                <li>
                    <div class="boton-con-imagen">
                        <button class="nomuerto" name="nomuerto" id="nomuerto">No-muerto</button>
                        <img class="icono" src="../img/razas/Nomuerto.png" alt="No-muerto">
                    </div>
                </li>
                <li>
                    <div class="boton-con-imagen">
                        <button class="elfo" name="elfo" id="elfo">Elfo de sangre</button>
                        <img class="icono" src="../img/razas/Elfosangre.png" alt="Elfo de sangre">
                    </div>
                </li>
                <li>
                    <div class="boton-con-imagen">
                        <button class="goblin" name="goblin" id="goblin">Goblin</button>
                        <img class="icono" src="../img/razas/Goblin.png" alt="Goblin">
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
        <button class="abandonar" name="abandonar" id="abandonar">Abandonar horda</button>
    </form>

    <?php

        //Crear la cookie para asignar el color a los botones de la tienda
        if (isset($_POST['orco'])) {
            setcookie("colorHorda", "green", time() + 60*60*24*7);
        } 
        elseif (isset($_POST['tauren'])) {
            setcookie("colorHorda", "#814826", time() + 60*60*24*7);
        } 
        elseif (isset($_POST['trol'])) {
            setcookie("colorHorda", "#73BDC4", time() + 60*60*24*7);
        } 
        elseif (isset($_POST['nomuerto'])) {
            setcookie("colorHorda", "#DFE5D7", time() + 60*60*24*7);
        } 
        elseif (isset($_POST['elfo'])) {
            setcookie("colorHorda", "#FFDA83", time() + 60*60*24*7);
        } 
        elseif (isset($_POST['goblin'])) {
            setcookie("colorHorda", "#B3EF6B", time() + 60*60*24*7);
        }

        

        //Borrar cookie
        if (isset($_POST['abandonar'])){
            setcookie("horda", "horda",  time() - 3600);
            header('Location:preferencias.php');
            die();
        }


    ?>


    <script src="../js/horda_preferencias.js"></script>

</body>
</html>