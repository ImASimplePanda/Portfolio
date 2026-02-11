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

    
    //Cambiar entre alianza, horda o mixto
    $fondo = "../img/mixto.webp";
    $tienda = "../../index.php";
    $preferencias ="preferencias.php";
    
    if (isset($_COOKIE['horda'])){
        $fondo = "../img/orgrimmar.jpeg";
        $tienda = "horda_index.php";
        $preferencias ="horda_preferencias.php";
    }
        
    elseif (isset($_COOKIE['alianza'])){
        $fondo = "../img/ventormenta.webp";
        $tienda = "alianza_index.php";
        $preferencias ="alianza_preferencias.php";
    }


    //Estan en oculto, si la cookie existe les cambio el estado a visibles
    $estado_onyxia = "none";
    $estado_sañosa = "none";
    $estado_invencible = "none";
    $estado_cenizas = "none";
    $estado_millagazor = "none";
    $estado_tempestad = "none";
    $estado_dracoarenisca = "none";
    $estado_aeonaxx = "none";

    if (isset($_COOKIE['fav_onyxia'])){
        $estado_onyxia = "block";
    }
        
    if (isset($_COOKIE['fav_sañosa'])){
        $estado_sañosa = "block";
    }
            
    if (isset($_COOKIE['fav_invencible'])){
        $estado_invencible = "block";
    }
            
    if (isset($_COOKIE['fav_cenizas'])){
        $estado_cenizas = "block";
    }
            
    if (isset($_COOKIE['fav_millagazor'])){
        $estado_millagazor = "block";
    }
            
    if (isset($_COOKIE['fav_tempestad'])){
        $estado_tempestad = "block";
    }
            
    if (isset($_COOKIE['fav_dracoarenisca'])){
        $estado_dracoarenisca = "block";
    }
            
    if (isset($_COOKIE['fav_aeonaxx'])){
        $estado_aeonaxx = "block";
    }



    //Eliminar de la lista 
    if (isset($_POST['del_onyxia'])){
        setcookie("fav_onyxia", "", time() - 3600, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    }
    elseif (isset($_POST['del_sañosa'])) {
        setcookie("fav_sañosa", "", time() - 3600, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    } 
    elseif (isset($_POST['del_invencible'])) {
        setcookie("fav_invencible", "", time() - 3600, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    } 
    elseif (isset($_POST['del_cenizas'])) {
        setcookie("fav_cenizas", "", time() - 3600, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    } 
    elseif (isset($_POST['del_millagazor'])) {
        setcookie("fav_millagazor", "", time() - 3600, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    } 
    elseif (isset($_POST['del_tempestad'])) {
        setcookie("fav_tempestad", "", time() - 3600, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    } 
    elseif (isset($_POST['del_dracoarenisca'])) {
        setcookie("fav_dracoarenisca", "", time() - 3600, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    } 
    elseif (isset($_POST['del_aeonaxx'])) {
        setcookie("fav_aeonaxx", "", time() - 3600, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    }
    
?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Jeremi Martin</title>
    <link rel="stylesheet" href="../css/deseados.css">
</head>
<body style="background-image: url('<?php echo $fondo;?>');">

    <header>
        <div class="logo"></div>
        <nav>
            <ul>
                <li><a id="tienda" href="<?php echo $tienda?>">Tienda</a></li>
                <li><a id ="preferencias" href="<?php echo $preferencias?>" >Preferencias</a></li>
                <li><a id ="carrito" href="carrito.php">Carrito</a></li>
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

    <div class="contenedor_principal">
        <form method="post">
            <ul>

                <li style="display:<?php echo $estado_onyxia; ?>;">
                    <div>
                        <img src="../img/compras/dracoonyxia.png">
                        <p id="onyxia">Draco de onyxia</p>
                        <div class="acciones">
                            <button type="submit" name="del_onyxia" id="del_onyxia"><img class="carrito" src="../img/carrito.png"></button>
                            <button type="submit" name="del_onyxia"><img class="fav" src="../img/basura.png"></button>
                        </div>  
                    </div>
                </li>
        
                <li style="display:<?php echo $estado_sañosa; ?>;">
                    <div>
                        <img src="../img/compras/sañosa.png" style="height: 61px;">
                        <p id="sañosa">Montura sañosa</p>
                        <div class="acciones">
                            <button type="submit" name="del_sañosa" id="del_sañosa"><img class="carrito" src="../img/carrito.png"></button>
                            <button type="submit" name="del_sañosa"><img class="fav" src="../img/basura.png"></button>
                        </div>  
                    </div>
                </li>
                
                <li style="display:<?php echo $estado_invencible; ?>;">
                    <div>
                        <img src="../img/compras/elinvencible.png" style="height: 61px;">
                        <p id="invencible">El invencible</p>
                        <div class="acciones">
                            <button type="submit" name="del_invencible" id="del_invencible"><img class="carrito" src="../img/carrito.png"></button>
                            <button type="submit" name="del_invencible"><img class="fav" src="../img/basura.png"></button>
                        </div>  
                    </div>
                </li>
                
                <li style="display:<?php echo $estado_cenizas; ?>;">
                    <div>
                        <img src="../img/compras/cenizas.png" style="height: 61px;">
                        <p id="cenizas">Cenizas de Al'ar</p>
                        <div class="acciones">
                            <button type="submit" name="del_cenizas" id="del_cenizas"><img class="carrito" src="../img/carrito.png"></button>
                            <button type="submit" name="del_cenizas"><img class="fav" src="../img/basura.png"></button>
                        </div>  
                    </div>
                </li>
                
                <li style="display:<?php echo $estado_millagazor; ?>;">
                    <div>
                        <img src="../img/compras/millagazor.png" style="height: 61px;">
                        <p id="millagazor">Huevo humeante de millagazor</p>
                        <div class="acciones">
                            <button type="submit" name="del_millagazor" id="del_millagazor"><img class="carrito" src="../img/carrito.png"></button>
                            <button type="submit" name="del_millagazor"><img class="fav" src="../img/basura.png"></button>
                        </div>  
                    </div>
                </li>
                
                <li style="display:<?php echo $estado_tempestad; ?>;">
                    <div>
                        <img src="../img/compras/tempestaddellamafria.png">
                        <p id="tempestad">Tempestad de llama fría</p>
                        <div class="acciones">
                            <button type="submit" name="del_tempestad" id="del_tempestad"><img class="carrito" src="../img/carrito.png"></button>
                            <button type="submit" name="del_tempestad"><img class="fav" src="../img/basura.png"></button>
                        </div>  
                    </div>
                </li>
                
                <li style="display:<?php echo $estado_dracoarenisca; ?>;">
                    <div>
                        <img src="../img/compras/dracoarenisca.png" style="height: 61px;">
                        <p id="arenisca">Draco de arenisca</p>
                        <div class="acciones">
                            <button type="submit" name="del_dracoarenisca" id="del_dracoarenisca"><img class="carrito" src="../img/carrito.png"></button>
                            <button type="submit" name="del_dracoarenisca"><img class="fav" src="../img/basura.png"></button>
                        </div>  
                    </div>
                </li>
                
                <li style="display:<?php echo $estado_aeonaxx; ?>;">
                    <div>
                        <img src="../img/compras/aeonaxx.png" style="height: 61px;">
                        <p id="aeonaxx">Aeonaxx</p>
                        <div class="acciones">
                            <button type="submit" name="del_aeonaxx" id="del_aeonaxx"><img class="carrito" src="../img/carrito.png"></button>
                            <button type="submit" name="del_aeonaxx"><img class="fav" src="../img/basura.png"></button>
                        </div>  
                    </div>
                </li>
            </ul>
        </form>

    </div>

    <?php


    
    ?>

    <script src="../js/producto.js"></script>
    <script src="../js/deseados.js"></script>

</body>
</html>