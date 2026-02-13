document.addEventListener("DOMContentLoaded", () => {

    console.log("cart.js CARGADO");

    // Configuración inicial: se define la clave del carrito según el usuario
    const userId = window.USER_ID || "guest";
    const CART_KEY = "cart_" + userId;

    // Funciones base: obtener y guardar el carrito en localStorage
    function getCart() {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    // Lógica para añadir productos al carrito, sumando cantidades si ya existen
    function addToCart(product) {
        let cart = getCart();
        const existing = cart.find(item => item.id === product.id);
        const qty = Number(product.quantity) || 1;

        if (existing) {
            existing.quantity += qty;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: qty
            });
        }

        saveCart(cart);
        showToast("Producto añadido al carrito");
    }

    // Eventos de los botones normales "añadir al carrito"
    document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => {
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                image: btn.dataset.image,
                quantity: 1
            };

            addToCart(product);
        });
    });

    // Añadir al carrito desde la wishlist y eliminarlo de allí
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".add-from-wishlist");
        if (!btn) return;

        const product = {
            id: btn.dataset.id,
            name: btn.dataset.name,
            price: parseFloat(btn.dataset.price),
            image: btn.dataset.image,
            quantity: parseInt(btn.dataset.quantity)
        };

        addToCart(product);
        window.location.href = `wishlist.php?action=remove&id=${product.id}`;
    });

    // Renderizado del carrito en cart.php: muestra productos, total y botones de eliminar
    function renderCart() {
        const container = document.getElementById("cart-container");
        const totalPriceEl = document.getElementById("cart-total-price");

        if (!container || !totalPriceEl) return;

        const cart = getCart();

        if (cart.length === 0) {
            container.innerHTML = "<p>Tu carrito está vacío.</p>";
            totalPriceEl.textContent = "0€";
            return;
        }

        let html = "";
        let total = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;

            html += `
                <div class="cart-item">
                    <img src="${window.BASE_URL}assets/images/${item.image}" class="cart-img">
                    <div class="cart-info">
                        <p>${item.name}</p>
                        <p>${item.price}€</p>
                        <p>Cantidad: ${item.quantity}</p>
                        <button class="remove-item" data-id="${item.id}">Eliminar</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        totalPriceEl.textContent = total.toFixed(2) + "€";

        document.querySelectorAll(".remove-item").forEach(btn => {
            btn.addEventListener("click", () => {
                removeItem(btn.dataset.id);
            });
        });
    }

    // Eliminar un producto del carrito y volver a renderizarlo
    function removeItem(id) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== id);
        saveCart(cart);
        renderCart();
    }

    // Botón comprar: vacía el carrito y muestra un mensaje
    const buyBtn = document.getElementById("buy-btn");

    if (buyBtn) {
        buyBtn.addEventListener("click", () => {
            let cart = getCart();

            if (cart.length === 0) {
                alert("Tu carrito está vacío.");
                return;
            }

            saveCart([]);
            renderCart();
            alert("¡Compra realizada con éxito!");
        });
    }

    // Toast: mensaje temporal que aparece al añadir productos
    function showToast(msg) {
        const toast = document.createElement("div");
        toast.className = "cart-toast";
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add("show"), 10);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // Inicialización: si estamos en cart.php, muestra el carrito
    renderCart();
});