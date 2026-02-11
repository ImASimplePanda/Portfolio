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






    //Crear las cookies de favoritos y recargar la página
    if (isset($_POST['fav_onyxia'])){

        setcookie("fav_onyxia", 1, time() + 60*60*24*7, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;

    }

    elseif (isset($_POST['fav_sañosa'])){

        setcookie("fav_sañosa", 1, time() + 60*60*24*7, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;

    }
    
    elseif (isset($_POST['fav_invencible'])){

        setcookie("fav_invencible", 1, time() + 60*60*24*7, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;

    }
    
    elseif (isset($_POST['fav_cenizas'])){

        setcookie("fav_cenizas", 1, time() + 60*60*24*7, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;

    }
    
    elseif (isset($_POST['fav_millagazor'])){

        setcookie("fav_millagazor", 1, time() + 60*60*24*7, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;

    }
    
    elseif (isset($_POST['fav_tempestad'])){

        setcookie("fav_tempestad", 1, time() + 60*60*24*7, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;

    }
     
    
    elseif (isset($_POST['fav_dracoarenisca'])){

        setcookie("fav_dracoarenisca", 1, time() + 60*60*24*7, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;

    }
    
    elseif (isset($_POST['fav_aeonaxx'])){

        setcookie("fav_aeonaxx", 1, time() + 60*60*24*7, "/");
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;

    }
    


?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Jeremi Martin</title>
    <link rel="stylesheet" href="./src/css/style.css">
</head>
<body>

    <header>
    <div class="logo"></div>
    <nav>
        <ul>
            <li><a id="tienda" href="../../index.php">Tienda</a></li>
            <li><a id="preferencias" href="./src/pages/preferencias.php">Preferencias</a></li>
            <li><a id="carrito" href="./src/pages/carrito.php">Carrito</a></li>
            <li><a id="deseados" href="./src/pages/deseados.php">Deseados</a></li>

            <?php
                //Poner cerrar sesión o iniciar sesion
                if ($bienvenida !== ""){
                    echo "<li><a href='./src/pages/logout.php' id='close_sesion'>Cerrar sesión</a></li>";
                    echo $bienvenida;
                }
                else{
                    echo "<li><a href='./src/pages/login.php' id='ini_sesion'>Iniciar sesión</a></li>";
                }
            
            ?>
        </ul>
    </nav>
    </header>

    <div class="contenedor_principal">


        <form method="post">
            <ul  style="margin-top: 30px;">
                
                <li>
                    <div class="img_con_texto">
                        <img src="./src/img/compras/dracoonyxia.png" style="height: 260px;">
                        <p class="texto" id="onyxia">Draco de onyxia</p>
                    </div>

                    <div>
                        <p class="precio">20€</p>
                        <button type="button" class="comprar" id="c_onyxia" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_onyxia"><img src="<?php 
                        
                            //Cambiar imagen si esta o no en favoritos
                            if (isset($_COOKIE['fav_onyxia'])){
                                echo "./src/img/favorito_2.png";
                            }
                            else{
                                echo "./src/img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>


                <li>
                    <div class="img_con_texto">
                        <img src="./src/img/compras/sañosa.png" style="height: 260px;">
                        <p class="texto" id="sañosa">Montura sañosa</p>
                    </div>

                    <div>
                        <p class="precio">35€</p>
                        <button type="button" class="comprar" id="c_sañosa" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_sañosa"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_sañosa'])){
                                echo "./src/img/favorito_2.png";
                            }
                            else{
                                echo "./src/img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>
                

                <li>
                    <div class="img_con_texto">
                        <img src="./src/img/compras/elinvencible.png" style="height: 260px;">
                        <p class="texto" id="invencible">El invencible</p>
                    </div>

                    <div>
                        <p class="precio">100€</p>
                        <button type="button" class="comprar" id="c_invencible" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_invencible"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_invencible'])){
                                echo "./src/img/favorito_2.png";
                            }
                            else{
                                echo "./src/img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>

                
                <li>
                    <div class="img_con_texto">
                        <img src="./src/img/compras/cenizas.png" style="height: 260px;">
                        <p class="texto" id="cenizas">Cenizas de Al'ar</p>
                    </div>

                    <div>
                        <p class="precio">45€</p>
                        <button type="button" class="comprar" id="c_cenizas" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_cenizas"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_cenizas'])){
                                echo "./src/img/favorito_2.png";
                            }
                            else{
                                echo "./src/img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>

                
                <li>
                    <div class="img_con_texto">
                        <img src="./src/img/compras/millagazor.png" style="height: 260px;">
                        <p class="texto" id="millagazor">Huevo humeante de millagazor</p>
                    </div>

                    <div>
                        <p class="precio">65€</p>
                        <button type="button" class="comprar" id="c_millagazor" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_millagazor"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_millagazor'])){
                                echo "./src/img/favorito_2.png";
                            }
                            else{
                                echo "./src/img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>

                
                <li>
                    <div class="img_con_texto">
                        <img src="./src/img/compras/tempestaddellamafria.png">
                        <p class="texto" id="tempestad">Tempestad de llama fría</p>
                    </div>

                    <div>
                        <p class="precio">40€</p>
                        <button type="button" class="comprar" id="c_tempestad" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_tempestad"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_tempestad'])){
                                echo "./src/img/favorito_2.png";
                            }
                            else{
                                echo "./src/img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>

                
                <li>
                    <div class="img_con_texto">
                        <img src="./src/img/compras/dracoarenisca.png" style="height: 260px;">
                        <p class="texto" id="arenisca">Draco de arenisca</p>
                    </div>

                    <div>
                        <p class="precio">75€</p>
                        <button type="button" class="comprar" id="c_arenisca" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_dracoarenisca"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_dracoarenisca'])){
                                echo "./src/img/favorito_2.png";
                            }
                            else{
                                echo "./src/img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>

                
                <li>
                    <div class="img_con_texto">
                        <img src="./src/img/compras/aeonaxx.png" style="height: 260px;">
                        <p class="texto" id="aeonaxx">Aeonaxx</p>
                    </div>

                    <div>
                        <p class="precio">85€</p>
                        <button type="button" class="comprar" id="c_aeonaxx" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_aeonaxx"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_aeonaxx'])){
                                echo "./src/img/favorito_2.png";
                            }
                            else{
                                echo "./src/img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>
            </ul>
        </form>

    </div>


    <script src="./src/js/producto.js"></script>
    <script src="./src/js/index.js"></script>

</body>
</html>