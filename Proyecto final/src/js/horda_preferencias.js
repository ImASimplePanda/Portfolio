const sp = document.getElementById("sp");
const en = document.getElementById("en");

const abandonar = document.getElementById("abandonar");
const tienda = document.getElementById("tienda");
const preferencias = document.getElementById("preferencias");
const carrito = document.getElementById("carrito");
const deseados = document.getElementById("deseados");
const close_sesion = document.getElementById("close_sesion");
const ini_sesion = document.getElementById("ini_sesion");

const orco = document.getElementById("orco");
const tauren = document.getElementById("tauren");
const trol = document.getElementById("trol");
const nomuerto = document.getElementById("nomuerto");
const elfo = document.getElementById("elfo");
const goblin = document.getElementById("goblin");


sp.addEventListener("click", ()=>{
    localStorage.setItem('idiomaPreferido', 'sp');
    console.log("Idioma guardado: es");
});

en.addEventListener("click", ()=>{
    localStorage.setItem('idiomaPreferido', 'en');
    console.log("Idioma guardado: en");
});

//Compruebo si existe la variable y cambio su contenido
function actualizarTexto(idioma) {
    switch(idioma) {
        case 'sp':
            if (abandonar) abandonar.textContent = "Abandonar horda";
            break;
        case 'en':
            if (abandonar) abandonar.textContent = "Leave horde";
            if (tienda) tienda.textContent = "Shop";
            if (preferencias) preferencias.textContent = "Preferences";
            if (carrito) carrito.textContent = "Cart"; 
            if (deseados) deseados.textContent = "Wishlist";

            if (orco) orco.textContent = "Orc";
            if (tauren) tauren.textContent = "Tauren";
            if (trol) trol.textContent = "Trol";
            if (nomuerto) nomuerto.textContent = "Undead";
            if (elfo) elfo.textContent = "Blood Elf";
            if (goblin) goblin.textContent = "Goblin";

            if (close_sesion) {
                close_sesion.textContent = "Log out";
            }

            if (ini_sesion) {
                ini_sesion.textContent = "Log in";
            }
            break;
        default:
            abandonar.textContent = "Abandonar horda";
    }
}

const idiomaGuardado = localStorage.getItem('idiomaPreferido'); 
if (idiomaGuardado) {
    actualizarTexto(idiomaGuardado);
}