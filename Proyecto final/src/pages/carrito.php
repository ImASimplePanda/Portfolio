<?php 

    session_name("login");
    session_start();

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




?>


<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Jeremi Martin</title>
    <link rel="stylesheet" href="../css/carrito.css">
</head>
<body style="background-image: url('<?php echo $fondo;?>');">

    <header>
        <div class="logo"></div>
        <nav>
            <ul>
                <li><a id="tienda" href="<?php echo $tienda?>">Tienda</a></li>
                <li><a id ="preferencias" href="<?php echo $preferencias?>" >Preferencias</a></li>
                <li><a id ="carro" href="carrito.php">Carrito</a></li>
                <li><a id="deseados" href="deseados.php">Deseados</a></li>
                            
            <?php
            
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
                <li style="display: none;">
                    <div>
                        <img src="../img/compras/dracoonyxia.png">
                        <p>Draco de onyxia</p>
                        <p>x1</p>
                        <div class="acciones">
                            <p id="precio_ony"></p>
                            <button type="button" class="quitar-producto"><img class="carrito" src="../img/cruzNegra.png"></button>
                        </div>
                    </div>
                </li>

                <li style="display: none;">
                    <div>
                        <img src="../img/compras/sañosa.png" style="height: 61px;">
                        <p>Montura sañosa</p>
                        <p>x1</p>
                        <div class="acciones">
                            <p id="precio_sañ"></p>
                            <button type="button" class="quitar-producto"><img class="carrito" src="../img/cruzNegra.png"></button>
                        </div>
                    </div>
                </li>

                <li style="display: none;">
                    <div>
                        <img src="../img/compras/elinvencible.png" style="height: 61px;">
                        <p>El invencible</p>
                        <p>x1</p>
                        <div class="acciones">
                            <p id="precio_inv"></p>
                            <button type="button" class="quitar-producto"><img class="carrito" src="../img/cruzNegra.png"></button>
                        </div>
                    </div>
                </li>

                <li style="display: none;">
                    <div>
                        <img src="../img/compras/cenizas.png" style="height: 61px;">
                        <p>Cenizas de Al'ar</p>
                        <p>x1</p>
                        <div class="acciones">
                            <p id="precio_cen"></p>
                            <button type="button" class="quitar-producto"><img class="carrito" src="../img/cruzNegra.png"></button>
                        </div>
                    </div>
                </li>

                <li style="display: none;">
                    <div>
                        <img src="../img/compras/millagazor.png" style="height: 61px;">
                        <p>Huevo humeante de millagazor</p>
                        <p>x1</p>
                        <div class="acciones">
                            <p id="precio_mil"></p>
                            <button type="button" class="quitar-producto"><img class="carrito" src="../img/cruzNegra.png"></button>
                        </div>
                    </div>
                </li>

                <li style="display: none;">
                    <div>
                        <img src="../img/compras/tempestaddellamafria.png">
                        <p>Tempestad de llama fría</p>
                        <p>x1</p>
                        <div class="acciones">
                            <p id="precio_tem"></p>
                            <button type="button" class="quitar-producto"><img class="carrito" src="../img/cruzNegra.png"></button>
                        </div>
                    </div>
                </li>

                <li style="display: none;">
                    <div>
                        <img src="../img/compras/dracoarenisca.png" style="height: 61px;">
                        <p>Draco de arenisca</p>
                        <p>x1</p>
                        <div class="acciones">
                            <p id="precio_are"></p>
                            <button type="button" class="quitar-producto"><img class="carrito" src="../img/cruzNegra.png"></button>
                        </div>
                    </div>
                </li>

                <li style="display: none;">
                    <div>
                        <img src="../img/compras/aeonaxx.png" style="height: 61px;">
                        <p>Aeonaxx</p>
                        <p>x1</p>
                        <div class="acciones">
                            <p id="precio_aeo"></p>
                            <button type="button" class="quitar-producto"><img class="carrito" src="../img/cruzNegra.png"></button>
                        </div>
                    </div>
                </li>

        
                <li style="display: none; background-color: transparent;">
                    <div class="contenedor_precioTotal">
                        <div>
                            <p style="margin-left: 5px; width: 110px;"><strong>Precio total:</strong></p>
                            <p style="margin-right: -5px;" id="precioTotal">0€</p>
                        </div>
                        <div>
                            <button id="proceder"><strong>Proceder</strong></button>
                        </div>
                        <div>
                            <button id="ultima"><strong>Última compra</strong></button>
                        </div>
                    </div>
                </li>
            </ul>
        </form>
    </div>


    <script src="../js/carrito.js"></script>

</body>
</html>