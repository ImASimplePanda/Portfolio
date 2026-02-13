document.addEventListener("DOMContentLoaded", () => {

    const track = document.querySelector(".carousel-track"); 
    const items = document.querySelectorAll(".carousel-item"); 
    const btnPrev = document.querySelector(".prev");
    const btnNext = document.querySelector(".next"); 

    let index = 0; // Posición actual del carrusel
    const total = items.length; 

    function updateCarousel() {
        track.style.transform = `translateX(-${index * 100}%)`; 
    }

    btnNext.addEventListener("click", () => {
        index = (index + 1) % total; // Avanza al siguiente elemento
        updateCarousel(); 
    });

    btnPrev.addEventListener("click", () => {
        index = (index - 1 + total) % total; // Retrocede al elemento anterior
        updateCarousel(); 
    });

    /* Deslizamiento táctil */
    let startX = 0; 

    track.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX; // Registra donde empieza el toque
    });

    track.addEventListener("touchend", e => {
        let endX = e.changedTouches[0].clientX; // Registra donde termina el toque

        if (startX - endX > 50) {
            index = (index + 1) % total; // Desliza a la izquierda
        } else if (endX - startX > 50) {
            index = (index - 1 + total) % total; // Desliza a la derecha
        }

        updateCarousel(); 
    });

});