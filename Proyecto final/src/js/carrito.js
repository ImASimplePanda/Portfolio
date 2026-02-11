document.addEventListener('DOMContentLoaded', () => {

    const tienda = document.getElementById("tienda");
    const preferencias = document.getElementById("preferencias");
    const carro = document.getElementById("carrito");
    const deseados = document.getElementById("deseados");
    const close_sesion = document.getElementById("close_sesion");
    const ini_sesion = document.getElementById("ini_sesion");

    const onyxia = document.getElementById("onyxia");
    const sañosa = document.getElementById("sañosa");
    const invencible = document.getElementById("invencible");
    const cenizas = document.getElementById("cenizas");
    const millagazor = document.getElementById("millagazor");
    const tempestad = document.getElementById("tempestad");
    const arenisca = document.getElementById("arenisca");


    //Compruebo si existe la variable y cambio su contenido
    function actualizarTexto(idioma) {
        switch(idioma) {
            case 'en':
                if (tienda) tienda.textContent = "Shop";
                if (preferencias) preferencias.textContent = "Preferences";
                if (carro) carro.textContent = "Cart";
                if (deseados) deseados.textContent = "Wishlist";
                if (close_sesion) close_sesion.textContent = "Log out";
                if (ini_sesion) ini_sesion.textContent = "Log in";

                if (onyxia) onyxia.textContent = "Onyxia Draco";
                if (sañosa) sañosa.textContent = "Vicious mount";
                if (invencible) invencible.textContent = "The Invincible";
                if (cenizas) cenizas.textContent = "Ashes of Al'ar";
                if (millagazor) millagazor.textContent = "Steaming egg of millagazor";
                if (tempestad) tempestad.textContent = "Cold flame storm";
                if (arenisca) arenisca.textContent = "Sandstone dragon";
                break;

            default:
                break;
        }
    }

    const idiomaGuardado = localStorage.getItem('idiomaPreferido'); 
    if (idiomaGuardado) actualizarTexto(idiomaGuardado);


    
    // Recuperar carrito
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let precioTotal = 0;

    carrito.forEach(producto => {
        // Buscar <li> por nombre de producto
        const li = Array.from(document.querySelectorAll("ul li")).find(liEl => { //Recorre el array hasta que encuentre el primer elemento que cumpla la condición
            const nombreP = liEl.querySelector("p:first-of-type");
            return nombreP && nombreP.textContent.trim() === producto.nombre.trim();
        });

        if (!li) return;

        // Mostrar <li>
        li.style.display = "block";

        // Actualizar cantidad
        const cantidadP = li.querySelector("p:nth-of-type(2)");
        if (cantidadP) cantidadP.textContent = `x${producto.cantidad}`;

        // Actualizar precio
        const precioP = li.querySelector(".acciones p");
        if (precioP) precioP.textContent = producto.precio * producto.cantidad + "€";

        // Sumar total
        precioTotal += producto.precio * producto.cantidad;
    });

    // Mostrar precio total
    const totalP = document.getElementById("precioTotal");
    if (totalP) {
        totalP.textContent = precioTotal + "€";
        const totalLi = totalP.closest("li"); //Busca el anterior li mas cercano
        if (totalLi) totalLi.style.display = "block";
    }









    document.querySelectorAll(".quitar-producto").forEach(boton => {
        boton.addEventListener("click", e => {
            
            //Obtener el <li> del producto
            const li = boton.closest("li"); 

            //Nombre del producto
            const nombre = li.querySelector("p:first-of-type").textContent.trim(); 

            let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

            const index = carrito.findIndex(p => p.nombre === nombre);
            if (index > -1) {
                carrito[index].cantidad--; // restar 1

                if (carrito[index].cantidad <= 0) {
                    //Si llega a 0 se elimina
                    carrito.splice(index, 1); 
                    li.style.display = "none";
                } else {
                    //Actualizar cantidad y precio
                    li.querySelector("p:nth-of-type(2)").textContent = `x${carrito[index].cantidad}`;
                    const precioP = li.querySelector(".acciones p");
                    if (precioP) precioP.textContent = carrito[index].precio * carrito[index].cantidad + "€";
                }

                localStorage.setItem("carrito", JSON.stringify(carrito));

                //Actualizar precio total
                let precioTotal = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
                const totalP = document.querySelector(".contenedor_precioTotal p:nth-of-type(2)");
                if (totalP) totalP.textContent = precioTotal + "€";

                //Si no hay nada, ocultar el total
                if (precioTotal === 0) {
                    const totalLi = totalP.closest("li");
                    if (totalLi) totalLi.style.display = "none";
                }
            }
        });
    });


//Botón Proceder
const btnProceder = document.getElementById("proceder");
btnProceder.addEventListener("click", () => {

    const fecha = new Date().toLocaleString();

    localStorage.setItem("ultimaCompra", fecha);

    alert("Compra realizada el: " + fecha);
});

//Botón Última compra
const btnUltima = document.getElementById("ultima");
btnUltima.addEventListener("click", () => {

    const ultima = localStorage.getItem("ultimaCompra");

    if (ultima) {
        alert("Tu última compra fue el: " + ultima);
    } else {
        alert("No hay ninguna compra registrada.");
    }
});











});
