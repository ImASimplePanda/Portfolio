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




    //cambiar color de botones
    $color = "#1a1a1a";
    $colorTexto = "#A88E3D";

    if (isset($_COOKIE['colorHorda'])){

        $color = $_COOKIE['colorHorda'];
        $colorTexto = "black";

    }





    //Crear cookie para deseados
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
    <link rel="stylesheet" href="../css/horda_index.css">
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

    <div class="contenedor_principal">

        <form method="post">
            <ul  style="margin-top: 30px;">
                
                <li>
                    <div class="img_con_texto">
                        <img src="../img/compras/dracoonyxia.png" style="height: 260px;">
                        <p class="texto" id="onyxia">Draco de onyxia</p>
                    </div>

                    <div>
                        <p class="precio">20€</p>
                        <button class="comprar" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_onyxia"><img src="<?php 
                        
                            //Cambiar imagen si esta en deseados
                            if (isset($_COOKIE['fav_onyxia'])){
                                echo "../img/favorito_2.png";
                            }
                            else{
                                echo "../img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>


                <li>
                    <div class="img_con_texto">
                        <img src="../img/compras/sañosa.png" style="height: 260px;">
                        <p class="texto" id="sañosa">Montura sañosa</p>
                    </div>

                    <div>
                        <p class="precio">35€</p>
                        <button class="comprar" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_sañosa"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_sañosa'])){
                                echo "../img/favorito_2.png";
                            }
                            else{
                                echo "../img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>
                

                <li>
                    <div class="img_con_texto">
                        <img src="../img/compras/elinvencible.png" style="height: 260px;">
                        <p class="texto" id="invencible">El invencible</p>
                    </div>

                    <div>
                        <p class="precio">100€</p>
                        <button class="comprar" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_invencible"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_invencible'])){
                                echo "../img/favorito_2.png";
                            }
                            else{
                                echo "../img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>

                
                <li>
                    <div class="img_con_texto">
                        <img src="../img/compras/cenizas.png" style="height: 260px;">
                        <p class="texto" id="cenizas">Cenizas de Al'ar</p>
                    </div>

                    <div>
                        <p class="precio">45€</p>
                        <button class="comprar" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_cenizas"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_cenizas'])){
                                echo "../img/favorito_2.png";
                            }
                            else{
                                echo "../img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>

                
                <li>
                    <div class="img_con_texto">
                        <img src="../img/compras/millagazor.png" style="height: 260px;">
                        <p class="texto" id="millagazor">Huevo humeante de millagazor</p>
                    </div>

                    <div>
                        <p class="precio">65€</p>
                        <button class="comprar" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_millagazor"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_millagazor'])){
                                echo "../img/favorito_2.png";
                            }
                            else{
                                echo "../img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>

                
                <li>
                    <div class="img_con_texto">
                        <img src="../img/compras/tempestaddellamafria.png">
                        <p class="texto" id="tempestad">Tempestad de llama fría</p>
                    </div>

                    <div>
                        <p class="precio">40€</p>
                        <button class="comprar" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_tempestad"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_tempestad'])){
                                echo "../img/favorito_2.png";
                            }
                            else{
                                echo "../img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>

                
                <li>
                    <div class="img_con_texto">
                        <img src="../img/compras/dracoarenisca.png" style="height: 260px;">
                        <p class="texto" id="arenisca">Draco de arenisca</p>
                    </div>

                    <div>
                        <p class="precio">75€</p>
                        <button class="comprar" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_dracoarenisca"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_dracoarenisca'])){
                                echo "../img/favorito_2.png";
                            }
                            else{
                                echo "../img/favorito.png";
                            }

                        ?>" class="fav_img"></button>
                    </div>
                </li>

                
                <li>
                    <div class="img_con_texto">
                        <img src="../img/compras/aeonaxx.png" style="height: 260px;">
                        <p class="texto">Aeonaxx</p>
                    </div>

                    <div>
                        <p class="precio">85€</p>
                        <button class="comprar" style="background-color:<?php echo $color;?>; color: <?php echo $colorTexto;?>;">Comprar</button>
                        <button class="fav" type="submit" name="fav_aeonaxx"><img src="<?php 
                        
                            if (isset($_COOKIE['fav_aeonaxx'])){
                                echo "../img/favorito_2.png";
                            }
                            else{
                                echo "../img/favorito.png";
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