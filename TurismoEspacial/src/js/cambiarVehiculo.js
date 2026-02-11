document.addEventListener("DOMContentLoaded", function() {

    const uno = document.querySelector(".uno");
    const dos = document.querySelector(".dos");
    const tres = document.querySelector(".tres");

    const vehiculo = document.querySelector(".vehiculo");

    const name = document.getElementById("name");

    const descrption = document.getElementById("description");

    uno.addEventListener("click", function() {

        vehiculo.src = "../assets/images/technology/image-launch-vehicle-landscape.jpg";

        name.textContent = "LAUNCH VEHICLE";
        descrption.textContent = "A launch vehicle or carrier rocket is a rocket-propelled vehicle used to carry a payload from Earth's surface to space, usually to Earth orbit or beyond. Our WEB-X carrier rocket is the most powerful in operation. Standing 150 metres tall, it's quite an awe-inspiring sight on the launch pad!";

    })

    dos.addEventListener("click", function() {

        vehiculo.src = "../assets/images/technology/image-space-capsule-landscape.jpg";

        name.textContent = "SPACE CAPSULE";
        descrption.textContent = "  A space capsule is an often-crewed spacecraft that uses a blunt-body reentry capsule to reenter the Earth's atmosphere without wings. Our capsule is where you'll spend your time during the flight. It includes a space gym, cinema, and plenty of other activities to keep you entertained.";


    })

    tres.addEventListener("click", function() {

        vehiculo.src = "../assets/images/technology/image-spaceport-landscape.jpg";

        name.textContent = "SPACEPORT";
        descrption.textContent = "  A spaceport or cosmodrome is a site for launching (or receiving) spacecraft, by analogy to the seaport for ships or airport for aircraft. Based in the famous Cape Canaveral, our spaceport is ideally situated to take advantage of the Earth’s rotation for launch.";

    })

})