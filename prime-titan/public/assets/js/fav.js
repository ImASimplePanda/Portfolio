document.querySelectorAll('.add-to-fav').forEach(btn => {
    btn.addEventListener('click', () => {

        const id = btn.dataset.id;

        // Enviar el producto al servidor para guardarlo en la wishlist
        fetch("actions/add_to_wishlist.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "id=" + id
        })
        .then(res => res.text())
        .then(() => {
            // Cambiar el aspecto del botón cuando se guarda
            btn.innerHTML = "❤️ Guardado";
            btn.style.background = "#ff4d4d";
            btn.style.color = "white";
        });
    });
});