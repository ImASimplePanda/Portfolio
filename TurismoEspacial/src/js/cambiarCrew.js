document.addEventListener("DOMContentLoaded", function() {


    function verificarModoPantalla() {
        const esEscritorio = window.matchMedia("(min-width: 1024px)").matches;
    
        if (esEscritorio) {
            console.log("Modo escritorio detectado, deteniendo eventos.");
            removerEventos();
        } else {
            console.log("Modo móvil/tablet detectado, activando eventos.");
            agregarEventos();
        }
    }

    // Ejecutar la verificación cuando la página carga
    document.addEventListener("DOMContentLoaded", verificarModoPantalla);

    // Detectar cambios en el tamaño de la pantalla en tiempo real
    window.matchMedia("(min-width: 1024px)").addEventListener("change", verificarModoPantalla);

    const uno = document.getElementById("uno");
    const dos = document.getElementById("dos");
    const tres = document.getElementById("tres");
    const cuatro = document.getElementById("cuatro");

    const persona = document.querySelector(".persona");

    const job = document.getElementById("job");
    const name = document.getElementById("name");
    const description = document.getElementById("description");


    function agregarEventos() {
        uno.addEventListener("click", function() {

            persona.src = "../assets/images/crew/image-anousheh-ansari.png";
    
            if ( persona.style.width < "350px"){
    
                persona.style.width = "350px";
    
            }
    
            else if (persona.style.width < "480px"){
    
                persona.style.width = "480px";
                persona.style.left = "150px";
    
            }
    
            job.textContent = "FLIGHT ENGINEER";
            name.textContent = "ANOUSHEH ANSARI";
            description.textContent = "Anousheh Ansari is an Iranian American engineer and co-founder of Prodea Systems. Ansari was the fourth self-funded space tourist, the first self-funded woman to fly to the ISS, and the first Iranian in space. ";
    
        })
    
        dos.addEventListener("click", function() {
    
            persona.src = "../assets/images/crew/image-douglas-hurley.png";
    
            if ( persona.style.width > "280px"){
    
                persona.style.width = "280px";
    
            }
    
            else if (persona.style.width > "400px"){
    
                persona.style.width = "400px";
                persona.style.left = "220px";
    
            }
    
            job.textContent = "COMMANDER";
            name.textContent = "DOUGLAS HURLEY";
            description.textContent = "  Douglas Gerald Hurley is an American engineer, former Marine Corps pilot and former NASA astronaut. He launched into space for the third time as commander of Crew Dragon Demo-2.";
    
    
        })
    
        tres.addEventListener("click", function() {
    
            persona.src = "../assets/images/crew/image-mark-shuttleworth.png";
    
            if ( persona.style.width > "240px"){
    
                persona.style.width = "240px";
    
            }
    
            else if (persona.style.width > "240px"){
    
                persona.style.width = "400px";
                persona.style.left = "160px";
    
            }
    
            job.textContent = "MISSION SPECIALIST";
            name.textContent = "MARK SHUTTLEWORTH";
            name.style.fontSize = "25px";
            description.textContent = "  Mark Richard Shuttleworth is the founder and CEO of Canonical, the company behind the Linux-based Ubuntu operating system. Shuttleworth became the first South African to travel to space as a space tourist.";
    
        })
    
        cuatro.addEventListener("click", function() {
    
            persona.src = "../assets/images/crew/image-victor-glover.png";
    
            if ( persona.style.width < "300px"){
    
                persona.style.width = "300px";
    
            }
    
            else if (persona.style.width < "300px"){
    
                persona.style.width = "400px";
                persona.style.left = "200px";
    
            }
    
    
            job.textContent = "PILOT";
            name.textContent = "VICTOR GLOVER";
            description.textContent = "Pilot on the first operational flight of the SpaceX Crew Dragon to the International Space Station. Glover is a commander in the U.S. Navy where he pilots an F/A-18.He was a crew member of Expedition 64, and served as a station systems flight engineer. ";
    
        })
    }
    
    // Función para remover eventos cuando está en escritorio
    function removerEventos() {
        uno.removeEventListener("click", cambiarAUno);
        dos.removeEventListener("click", cambiarADos);
        tres.removeEventListener("click", cambiarATres);
        cuatro.removeEventListener("click", cambiarACuatro);
    }



    


    // Ejecutar la verificación cuando la página carga
    document.addEventListener("DOMContentLoaded", verificarModoPantalla);

    // Detectar cambios en el tamaño de la pantalla en tiempo real
    window.matchMedia("(min-width: 1024px)").addEventListener("change", verificarModoPantalla);
})