document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".rating").forEach(ratingBox => {

        const productId = ratingBox.dataset.product;

        // Cargar valoración actual
        loadRating(productId);

        // Evento click en estrellas
        ratingBox.querySelectorAll(".star").forEach(star => {
            star.addEventListener("click", async () => {
                const value = star.dataset.value;
                await sendRating(productId, value);
                await loadRating(productId);
            });
        });
    });
});


// Enviar valoración al servidor
async function sendRating(productId, value) {
    const res = await fetch("actions/rate_product.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `product_id=${productId}&rating=${value}`
    });

    return await res.text();
}


// Cargar valoración media
async function loadRating(productId) {
    const res = await fetch(`actions/get_rating.php?product_id=${productId}`);
    const data = await res.json();

    const stars = document.querySelector(`.rating[data-product="${productId}"]`).querySelectorAll(".star");
    const info = document.getElementById(`rating-info-${productId}`);

    // Pintar estrellas activas
    stars.forEach(star => {
        star.classList.toggle("active", star.dataset.value <= data.average);
    });

    // Texto traducido desde PHP
    const avgLabel = window.AVERAGE_RATING_LABEL;
    const votesLabel = window.VOTES_LABEL;

    info.textContent = `${avgLabel}: ${data.average} (${data.count} ${votesLabel})`;
}
