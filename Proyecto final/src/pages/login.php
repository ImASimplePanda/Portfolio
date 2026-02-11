<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Jeremi Martin</title>
    <link rel="stylesheet" href="../css/login.css">
</head>
<body>

    <form method="post">

        <h5 id="nombre">Nombre de cuenta</h5>
        <input type="text" name="usuario" placeholder="Enter your user..." class="inputName">
        <h5 id="psw">Contraseña</h5>
        <input type="password" name="psw" class="inputPsw">
        <br>
        <input type="submit" name="login" value="Login" class="botonLogin">
        

    </form>

    <?php

        if (isset($_POST['login'])){

            $admin = "admin";
            $normal = "guest";
            $psw = "1234";


            $usu = isset($_POST['usuario']) ? $_POST['usuario'] : '';
            $pswUsu = isset($_POST['psw']) ? $_POST['psw'] : '';

            $errores = [];
            //Comprobar erratas
            if (comprobar_texto($usu)){
                $errores[] = "Campo cuenta no puede estar vacío";
            }

            if (comprobar_texto($pswUsu)){
                $errores[] = "Campo contraseña no puede estar vacío";
            }
            
            if (empty($errores)){

                if ($usu == $admin && $pswUsu == $psw || $usu == $normal && $pswUsu == $psw){

                    session_name("login");
                    session_start();

                    $_SESSION['usuario'] = $usu;
                    //Redireccion dependiendo de la cookie
                    if ($_COOKIE['horda']){
                        header('Location:horda_index.php');
                        exit;
                    }
                    
                    elseif ($_COOKIE['alianza']){
                        header('Location:alianza_index.php');
                        exit;
                    }

                    else{
                        header('Location:../../index.php');
                        exit;
                    }


                }
                else{
                    echo "<br>";
                    echo "<p style='color:orange'>Usuario o contraseña incorrectos</p>";
                }
            }

            else{

                echo "<br>";
                echo "<ul>";
                foreach($errores as $e){
                    echo "<li style='color:orange'>$e</li>";
                }
                echo "</ul>";

            }

        }    




        function comprobar_texto($t): bool{
            return trim($t) == '';
        }

    ?>

    <script src="../js/login.js"></script>

</body>
</html>