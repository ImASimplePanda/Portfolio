document.addEventListener("DOMContentLoaded", () => {

    const track = document.querySelector(".carousel-track"); 
    const items = document.querySelectorAll(".carousel-item"); 
    const btnPrev = document.querySelector(".prev");
    const btnNext = document.querySelector(".next"); 

    if (!track || items.length === 0 || !btnPrev || !btnNext) {
        console.log("No hay carrusel en esta página. Script detenido.");
        return;
    }

    let index = 0; 
    const total = items.length; 

    function updateCarousel() {
        track.style.transform = `translateX(-${index * 100}%)`; 
    }

    btnNext.addEventListener("click", () => {
        index = (index + 1) % total;
        updateCarousel(); 
    });

    btnPrev.addEventListener("click", () => {
        index = (index - 1 + total) % total;
        updateCarousel(); 
    });

    /* Deslizamiento táctil */
    let startX = 0; 

    // ⚠ Solo agregar eventos si track existe (ya está verificado arriba)
    track.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX; 
    });

    track.addEventListener("touchend", e => {
        let endX = e.changedTouches[0].clientX; 

        if (startX - endX > 50) {
            index = (index + 1) % total; 
        } else if (endX - startX > 50) {
            index = (index - 1 + total) % total; 
        }

        updateCarousel(); 
    });

});
