/**
 * Función global para añadir a favoritos
 * @param {number} id - ID del producto
 * @param {HTMLElement} btn - (Opcional) El botón que dispara la acción para cambiar su estilo
 */


window.addToFav = function(id, btn = null) {

    const targetBtn = btn || document.querySelector(`.add-to-fav[data-id="${id}"]`);

    const formData = new FormData();
    formData.append('id', id);

    fetch(window.BASE_URL + "actions/add_to_wishlist.php", {
        method: "POST",
        body: new URLSearchParams(formData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            if (targetBtn) {
                // Usamos una variable global de texto o un string traducido si lo tienes
                targetBtn.innerHTML = "❤️ " + (window.TXT_SAVED || "Saved");
                targetBtn.style.background = "#ff4d4d";
                targetBtn.style.color = "white";
                targetBtn.disabled = true; // Evitar múltiples clics
            }
        } else {
            console.error("Error:", data.message);
            if(data.message === "NO_USER") {
                alert("Debes iniciar sesión");
            }
        }
    })
    .catch(err => console.error("Fetch error:", err));
};