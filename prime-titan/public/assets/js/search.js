document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const productCards = document.querySelectorAll('.product-card');

    // Si no existe el buscador en esta página, no hacemos nada
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();

        productCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            card.style.display = name.includes(filter) ? 'block' : 'none';
        });
    });
});