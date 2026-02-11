document.addEventListener('DOMContentLoaded', () => {
    const tienda = document.getElementById("tienda");
    const preferencias = document.getElementById("preferencias");
    const carrito = document.getElementById("carrito");
    const deseados = document.getElementById("deseados");
    const close_sesion = document.getElementById("close_sesion");
    const ini_sesion = document.getElementById("ini_sesion");


    const horda = document.getElementById("horda");
    const alianza = document.getElementById("alianza");

    
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
                if (horda) horda.textContent = "For the horde!";
                if (alianza) alianza.textContent = "For the alliance!";

                break;

            default:
                if (abandonar) abandonar.textContent = "Abandonar horda";
        }
    }

    const idiomaGuardado = localStorage.getItem('idiomaPreferido'); 
    if (idiomaGuardado) {
        actualizarTexto(idiomaGuardado);
    }
});
