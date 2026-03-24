document.addEventListener("DOMContentLoaded", () => {

function updateStars(productId) {
    fetch(`${BASE_URL}actions/renderStars.php?product_id=${productId}`)
        .then(res => res.json())
        .then(data => {

            // promedio (abajo)
            document.getElementById("rating-info-" + productId).innerHTML = data.html;

            // estrellas clicables según media
            paintAverageStars(productId, data.average);

            // desactivar si ya ha votado
            const ratingBox = document.querySelector(`.rating[data-product="${productId}"]`);
            if (data.hasVoted) {
                ratingBox.classList.add("rating-disabled");
            } else {
                ratingBox.classList.remove("rating-disabled");
            }
        })
        .catch(err => console.error("Error en updateStars:", err));
}


    function paintAverageStars(productId, average) {
        const stars = document.querySelectorAll(`.rating[data-product="${productId}"] .star`);

        stars.forEach(star => {
            const value = parseInt(star.dataset.value);

            if (value <= average) {
                star.classList.add("active");
            } else {
                star.classList.remove("active");
            }
        });
    }

    document.querySelectorAll('.rating .star').forEach(star => {
        star.addEventListener('click', function() {

            const rating = parseInt(this.dataset.value);
            const productId = this.parentElement.dataset.product;

            // NO pintamos nada todavía

            fetch(`${BASE_URL}actions/myVote.php`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `product_id=${productId}&rating=${rating}`
            })
            .then(res => res.json())
            .then(data => {

                if (data.error === "NO_USER") {
                    alert("Debes iniciar sesión para votar.");
                    updateStars(productId); // restaurar media real
                    return;
                }

                if (data.error === "ALREADY_VOTED") {
                    alert("Ya has valorado este producto.");
                    updateStars(productId); // restaurar media real
                    return;
                }

                if (data.success) {
                    // Ahora sí pintamos la media real
                    updateStars(productId);
                }
            });
        });
    });

    // Cargar promedio al iniciar
    document.querySelectorAll(".rating").forEach(r => {
        updateStars(r.dataset.product);
    });

});
