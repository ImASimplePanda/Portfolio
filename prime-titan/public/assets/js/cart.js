document.addEventListener("DOMContentLoaded", () => {

    console.log("cart.js CARGADO");

    // Configuración inicial
    const userId = window.USER_ID || "guest";
    const CART_KEY = "cart_" + userId;

    // Traducciones desde PHP
    const TXT_ADDED = window.CART_ADDED;
    const TXT_EMPTY = window.CART_EMPTY;
    const TXT_QTY = window.CART_QTY;
    const TXT_REMOVE = window.CART_REMOVE;
    const TXT_PURCHASE_SUCCESS = window.CART_PURCHASE_SUCCESS;
    const TXT_PURCHASE_EMPTY = window.CART_PURCHASE_EMPTY;

    function getCart() {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

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
        showToast(TXT_ADDED);
    }

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

    function renderCart() {
        const container = document.getElementById("cart-container");
        const totalPriceEl = document.getElementById("cart-total-price");

        if (!container || !totalPriceEl) return;

        const cart = getCart();

        if (cart.length === 0) {
            container.innerHTML = `<p>${TXT_EMPTY}</p>`;
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
                        <p>${TXT_QTY}: ${item.quantity}</p>
                        <button class="remove-item" data-id="${item.id}">${TXT_REMOVE}</button>
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

    function removeItem(id) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== id);
        saveCart(cart);
        renderCart();
    }

    const buyBtn = document.getElementById("buy-btn");

    if (buyBtn) {
        buyBtn.addEventListener("click", () => {
            let cart = getCart();

            if (cart.length === 0) {
                alert(TXT_PURCHASE_EMPTY);
                return;
            }

            saveCart([]);
            renderCart();
            alert(TXT_PURCHASE_SUCCESS);
        });
    }

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

    renderCart();
});
