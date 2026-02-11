document.addEventListener('DOMContentLoaded', () => {
    const nombre = document.getElementById("nombre");
    const psw = document.getElementById("psw");

    //Compruebo si existe la variable y cambio su contenido
    function actualizarTexto(idioma) {
        switch(idioma) {
            case 'en':
                
                if (nombre) nombre.textContent = "Account name";
                if (psw) psw.textContent = "Password";


                break;

            default:
                if (nombre) nombre.textContent = "Cuenta de usuario";
        }
    }

    const idiomaGuardado = localStorage.getItem('idiomaPreferido'); 
    if (idiomaGuardado) {
        actualizarTexto(idiomaGuardado);
    }
});
