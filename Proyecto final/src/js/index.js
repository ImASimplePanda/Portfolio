document.addEventListener('DOMContentLoaded', () => {

    const tienda = document.getElementById("tienda");
    const preferencias = document.getElementById("preferencias");
    const carrito = document.getElementById("carrito");
    const deseados = document.getElementById("deseados");
    const close_sesion = document.getElementById("close_sesion");
    const ini_sesion = document.getElementById("ini_sesion");
    const botonesComprar = document.querySelectorAll('.comprar');

    const onyxia = document.getElementById("onyxia");
    const sañosa = document.getElementById("sañosa");
    const invencible = document.getElementById("invencible");
    const cenizas = document.getElementById("cenizas");
    const millagazor = document.getElementById("millagazor");
    const tempestad = document.getElementById("tempestad");
    const arenisca = document.getElementById("arenisca");
    const aeonaxx = document.getElementById("aeonaxx");
    
    
    //Compruebo si existe la variable y cambio su contenido
    function actualizarTexto(idioma) {
        switch(idioma) {
            case 'en':
    
                if (tienda) tienda.textContent = "Shop";
                if (preferencias) preferencias.textContent = "Preferences";
                if (carrito) carrito.textContent = "Cart";
                if (deseados) deseados.textContent = "Wishlist";
                if (close_sesion) close_sesion.textContent = "Log out";
                if (ini_sesion) ini_sesion.textContent = "Log in";
                botonesComprar.forEach(boton =>{
                    boton.textContent = "Buy";
                });
                if (onyxia) onyxia.textContent = "Onyxia Draco";
                if (sañosa) sañosa.textContent = "Vicious mount";
                if (invencible) invencible.textContent = "The Invincible";
                if (cenizas) cenizas.textContent = "Ashes of Al'ar";
                if (millagazor) millagazor.textContent = "Steaming egg of millagazor";
                if (tempestad) tempestad.textContent = "Cold flame storm";
                if (arenisca) arenisca.textContent = "Sandstone dragon";


                break;

            default:
                if (abandonar) abandonar.textContent = "Abandonar horda";
        }
    }

    const idiomaGuardado = localStorage.getItem('idiomaPreferido'); 
    if (idiomaGuardado) {
        actualizarTexto(idiomaGuardado);
    }



    const c_onyxia = document.getElementById("c_onyxia");
    const c_sañosa = document.getElementById("c_sañosa");
    const c_invencible = document.getElementById("c_invencible");
    const c_cenizas = document.getElementById("c_cenizas");
    const c_millagazor = document.getElementById("c_millagazor");
    const c_tempestad = document.getElementById("c_tempestad");
    const c_arenisca = document.getElementById("c_arenisca");
    const c_aeonaxx = document.getElementById("c_aeonaxx");

    let contador1 = 0;
    let contador2 = 0;
    let contador3 = 0;
    let contador4 = 0;
    let contador5 = 0;
    let contador6 = 0;
    let contador7 = 0;
    let contador8 = 0;

    c_onyxia.addEventListener("click",()=>{
        contador1++;
        const p_onyxia = new Producto(onyxia, 20, contador1);
        guardarProducto(p_onyxia);
    });

    c_sañosa.addEventListener("click",()=> {
        contador2++;
        const p_sañosa = new Producto(sañosa, 35, contador2);
        guardarProducto(p_sañosa);
    });

    c_invencible.addEventListener("click",()=> {
        contador3++;
        const p_invencible = new Producto(invencible, 100, contador3);
        guardarProducto(p_invencible);
    });

    c_cenizas.addEventListener("click",()=> {
        contador4++;
        const p_cenizas = new Producto(cenizas, 45, contador4);
        guardarProducto(p_cenizas);
    });

    c_millagazor.addEventListener("click",()=> {
        contador5++;
        const p_millagazor = new Producto(millagazor, 65, contador5);
        guardarProducto(p_millagazor);
    });

    c_tempestad.addEventListener("click",()=> {
        contador6++;
        const p_tempestad = new Producto(tempestad, 40, contador6);
        guardarProducto(p_tempestad);
    });

    c_arenisca.addEventListener("click",()=> {
        contador7++;
        const p_arenisca = new Producto(arenisca, 75, contador7);
        guardarProducto(p_arenisca);
    });

    c_aeonaxx.addEventListener("click",()=> {
        contador8++;
        const p_aeonaxx = new Producto(aeonaxx, 85, contador8);
        guardarProducto(p_aeonaxx);
    });


    function guardarProducto(producto) {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        // Buscar si ya existe ese producto
        const existente = carrito.find(item => item.nombre === producto.nombre.textContent);

        if (existente) {
            // Si ya existe → solo actualizo la cantidad
            existente.cantidad = producto.cantidad;

        } else {
            // Si no existe → lo agrego
            carrito.push({
                nombre: producto.nombre.textContent,
                precio: producto.precio,
                cantidad: producto.cantidad
            });

        }

        localStorage.setItem("carrito", JSON.stringify(carrito)); //Convierte array carrito en JSON
    }





});
