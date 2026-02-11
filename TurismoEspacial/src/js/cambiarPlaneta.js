document.addEventListener("DOMContentLoaded", function() {

    const moon = document.getElementById("moon");
    const mars = document.getElementById("mars");
    const europa = document.getElementById("europa");
    const titan = document.getElementById("titan");

    const titlePlaneta = document.querySelector(".titleplaneta");
    const texto = document.querySelector(".texto");

    const km = document.querySelector(".km");

    const month = document.querySelector(".month");

    const planeta = document.querySelector(".planeta");

    moon.addEventListener("click", function() {

        titlePlaneta.textContent = "MOON";
        texto.textContent = "See our planet as you’ve never seen it before. A perfect relaxing trip away to help regain perspective and come back refreshed. While you’re there, take in some history by visiting the Luna 2 and Apollo 11 landing sites";

        km.textContent = "384 MIL. KM";
        month.textContent = "3 DAYS";

        planeta.src ="../assets/images/destination/image-moon.png"

    })

    mars.addEventListener("click", function() {

        titlePlaneta.textContent = "MARS";
        texto.textContent = "Don’t forget to pack your hiking boots. You’ll need them to tackle Olympus Mons, the tallest planetary mountain in our solar system. It’s two and a half times the size of Everest!";

        km.textContent = "225 MIL. KM";
        month.textContent = "9 MONTHS";

        planeta.src ="../assets/images/destination/image-mars.png"


    })

    europa.addEventListener("click", function() {

        titlePlaneta.textContent = "EUROPA";
        texto.textContent = "  The smallest of the four Galilean moons orbiting Jupiter, Europa is a winter lover’s dream. With an icy surface, it’s perfect for a bit of ice skating, curling, hockey, or simple relaxation in your snug wintery cabin.";

        km.textContent = "628 MIL. KM";
        month.textContent = "3 YEARS";

        planeta.src ="../assets/images/destination/image-europa.png"


    })

    titan.addEventListener("click", function() {

        titlePlaneta.textContent = "TITAN";
        texto.textContent = "  The only moon known to have a dense atmosphere other than Earth, Titan is a home away from home (just a few hundred degrees colder!). As a bonus, you get striking views of the Rings of Saturn.";

        km.textContent = "1.6 BIL. KM";
        month.textContent = "7 YEARS";

        planeta.src ="../assets/images/destination/image-titan.png"


    })
})