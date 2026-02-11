const hamburguesa = document.querySelector(".hamburguesa");
const menu = document.querySelector(".menu");

hamburguesa.addEventListener("click", () => {
    console.log("Hamburguesa clickeada");
    menu.classList.toggle("open");
    hamburguesa.classList.toggle("close");
});