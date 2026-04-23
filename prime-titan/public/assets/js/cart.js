// Definimos las funciones de utilidad fuera para que sean accesibles
const getUserId = () => window.USER_ID || "guest";
const getLang = () => document.documentElement.lang || 'es';
const getCartKey = () => "cart_" + getUserId() + "_" + getLang();

// Exportamos addToCart al objeto global window para que React la use
window.addToCart = function(product) {
    let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
    const existing = cart.find(item => item.id === product.id);
    const qty = Number(product.quantity) || 1;

    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
            quantity: qty
        });
    }

    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    
    // Disparamos un evento personalizado por si React necesita enterarse de que el carrito cambió
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Llamamos al toast 
    if (typeof window.showToast === 'function') {
        window.showToast(window.CART_ADDED || "Producto añadido");
    }

    // Si existe la función de renderizado, la ejecutamos
    if (typeof window.renderCart === 'function') {
        window.renderCart();
    }
};

// Función Toast global
window.showToast = function(msg) {
    const oldToast = document.querySelector(".cart-toast");
    if (oldToast) oldToast.remove();
    const toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("cart.js CARGADO Y COMPATIBLE CON REACT");

    const TXT_EMPTY = window.CART_EMPTY || "Carrito vacío";
    const TXT_QTY = window.CART_QTY || "Cantidad";
    const TXT_REMOVE = window.CART_REMOVE || "Eliminar";
    const TXT_PURCHASE_SUCCESS = window.CART_PURCHASE_SUCCESS || "Compra realizada";
    const TXT_PURCHASE_EMPTY = window.CART_PURCHASE_EMPTY || "Carrito vacío";

    // Hacemos renderCart global para que se pueda llamar desde fuera
    window.renderCart = function() {
        const container = document.getElementById("cart-container");
        const totalPriceEl = document.getElementById("cart-total-price");
        if (!container || !totalPriceEl) return;

        const cart = JSON.parse(localStorage.getItem(getCartKey())) || [];

        if (cart.length === 0) {
            container.innerHTML = `<p>${TXT_EMPTY}</p>`;
            totalPriceEl.textContent = "0.00€";
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
                        <p class="cart-item-name"><strong>${item.name}</strong></p>
                        <p class="cart-item-price">${item.price.toFixed(2)}€</p>
                        <p class="cart-item-qty">${TXT_QTY}: ${item.quantity}</p>
                        <button class="remove-item" data-id="${item.id}">${TXT_REMOVE}</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        totalPriceEl.textContent = total.toFixed(2) + "€";

        document.querySelectorAll(".remove-item").forEach(btn => {
            btn.onclick = () => removeItem(btn.dataset.id);
        });
    }

    function removeItem(id) {
        let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
        cart = cart.filter(item => item.id != id);
        localStorage.setItem(getCartKey(), JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated')); // Avisar a React
        window.renderCart();
    }

    // Eventos para botones que NO son de React (los que queden en PHP)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".add-to-cart");
        if (btn) {
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: btn.dataset.price,
                image: btn.dataset.image,
                quantity: 1
            };
            window.addToCart(product);
        }
    });

    // Botón comprar
    const buyBtn = document.getElementById("buy-btn");
    if (buyBtn) {
        buyBtn.addEventListener("click", () => {
            const cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
            if (cart.length === 0) return alert(TXT_PURCHASE_EMPTY);
            
            localStorage.setItem(getCartKey(), JSON.stringify([]));
            window.dispatchEvent(new Event('cartUpdated'));
            window.renderCart();
            alert(TXT_PURCHASE_SUCCESS);
        });
    }

    window.renderCart();
});