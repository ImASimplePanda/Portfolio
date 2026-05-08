/* ==========================================================================
   CART.JS - Gestión de Carrito y Wishlist con Notificaciones
   ========================================================================== */

// 1. Identificadores únicos para el carrito (según usuario e idioma)
if (typeof window.getUserId === 'undefined') {
    window.getUserId = () => window.USER_ID || "guest";
    window.getLang = () => document.documentElement.lang || 'es';
    window.getCartKey = () => "cart_" + window.getUserId() + "_" + window.getLang();
}

/**
 * Función para mostrar notificaciones (Toast)
 * Si no tienes esta función definida en otro sitio, esta servirá.
 */
window.showToast = function(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        // Estilos básicos por si no hay CSS
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message success'; // Puedes usar tus clases de CSS existentes
    toast.textContent = message;
    
    // Estilos rápidos de fallback
    toast.style.background = '#2ecc71';
    toast.style.color = '#fff';
    toast.style.padding = '15px 25px';
    toast.style.borderRadius = '8px';
    toast.style.marginBottom = '10px';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

/**
 * Borra el producto de la wishlist en la DB
 */
async function removeFromWishlistDB(id) {
    if (!id || id === "null") return false;
    try {
        const response = await fetch('wishlist-remove.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${encodeURIComponent(id)}`
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error("Error eliminando de wishlist:", error);
        return false;
    }
}

/**
 * Validar productos contra la Base de Datos
 */
async function validateCartItems(cart) {
    if (cart.length === 0) return cart;

    try {
        const ids = cart.map(item => item.id);
        const response = await fetch(window.BASE_URL + 'actions/validate_products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: ids })
        });
        
        if (!response.ok) throw new Error("404");

        const validIds = await response.json(); 
        const cleanCart = cart.filter(item => validIds.includes(String(item.id)));
        
        if (cleanCart.length !== cart.length) {
            localStorage.setItem(window.getCartKey(), JSON.stringify(cleanCart));
            window.dispatchEvent(new Event('cartUpdated'));
        }
        return cleanCart;
    } catch (error) {
        console.warn("Sincronización de base de datos omitida.");
        return cart;
    }
}

/**
 * Añadir al carrito
 */
window.addToCart = function(product) {
    if (!product.id || product.id === "null" || !product.name) return;

    let cart = JSON.parse(localStorage.getItem(window.getCartKey())) || [];
    const productId = String(product.id).trim();
    const existing = cart.find(item => String(item.id) === productId);
    const qty = Number(product.quantity) || 1;

    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: parseFloat(product.price) || 0, 
            image: product.image || 'default.jpg',
            quantity: qty
        });
    }

    localStorage.setItem(window.getCartKey(), JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Lanzar el mensaje de éxito
    if (typeof window.showToast === 'function') {
        window.showToast(window.CART_ADDED || "Producto añadido");
    }

    if (typeof window.renderCart === 'function') {
        window.renderCart();
    }
};

/**
 * Lógica del botón COMPRAR
 */
window.handleCheckout = function() {
    const key = window.getCartKey();
    let cart = JSON.parse(localStorage.getItem(key)) || [];

    if (cart.length === 0) {
        alert(window.CART_PURCHASE_EMPTY || "El carrito está vacío");
        return;
    }

    alert(window.CART_PURCHASE_SUCCESS || "¡Compra realizada con éxito!");

    localStorage.removeItem(key);
    window.dispatchEvent(new Event('cartUpdated'));
    window.location.href = window.BASE_URL + "index.php";
};

/**
 * Renderizado y Eventos
 */
document.addEventListener("DOMContentLoaded", () => {
    const TXT_EMPTY = window.CART_EMPTY || "Carrito vacío";
    const TXT_QTY = window.CART_QTY || "Cantidad";
    const TXT_REMOVE = window.CART_REMOVE || "Eliminar";

    // Manejador para añadir al carrito (desde tienda o wishlist)
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".add-to-cart, .add-from-wishlist");
        if (!btn) return;

        e.preventDefault();
        
        const productId = btn.getAttribute("data-id");
        const productData = {
            id: productId,
            name: btn.getAttribute("data-name"),
            price: btn.getAttribute("data-price"),
            image: btn.getAttribute("data-image"),
            quantity: btn.getAttribute("data-quantity") || 1
        };

        // 1. Añadir al carrito local y mostrar mensaje
        window.addToCart(productData);

        // 2. Si es desde wishlist, borrar de la DB y recargar
        if (btn.classList.contains("add-from-wishlist")) {
            const deleted = await removeFromWishlistDB(productId);
            if (deleted) {
                // Esperamos un segundo (1000ms) para que el usuario vea el mensaje 
                // antes de que la página se refresque
                setTimeout(() => {
                    window.location.reload(); 
                }, 1000);
            }
        }
    });

    window.renderCart = async function() {
        const container = document.getElementById("cart-container");
        const totalPriceEl = document.getElementById("cart-total-price");
        const buyBtn = document.getElementById("buy-btn");

        if (!container || !totalPriceEl) return;

        let cart = JSON.parse(localStorage.getItem(window.getCartKey())) || [];
        cart = await validateCartItems(cart); 

        if (cart.length === 0) {
            container.innerHTML = `<p>${TXT_EMPTY}</p>`;
            totalPriceEl.textContent = "0.00€";
            if (buyBtn) buyBtn.style.display = "none";
            return;
        }

        if (buyBtn) {
            buyBtn.style.display = "block";
            buyBtn.onclick = window.handleCheckout;
        }

        let html = "";
        let total = 0;

        cart.forEach(item => {
            const itemPrice = parseFloat(item.price) || 0;
            const itemQty = parseInt(item.quantity) || 1;
            total += itemPrice * itemQty;
            
            html += `
                <div class="cart-item">
                    <img src="${window.BASE_URL}assets/images/${item.image}" class="cart-img">
                    <div class="cart-info">
                        <p class="cart-item-name"><strong>${item.name}</strong></p>
                        <p class="cart-item-price">${itemPrice.toFixed(2)}€</p>
                        <div class="wishlist-qty-row">
                            <button class="qty-btn-dark" onclick="window.updateCartQty('${item.id}', -1)">-</button>
                            <span class="qty-text">${TXT_QTY}: ${itemQty}</span>
                            <button class="qty-btn-dark" onclick="window.updateCartQty('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-item btn-remove-dark" onclick="window.removeItem('${item.id}')">${TXT_REMOVE}</button>
                    </div>
                </div>`;
        });

        container.innerHTML = html;
        totalPriceEl.textContent = total.toFixed(2) + "€";
    };

    window.removeItem = function(id) {
        let cart = JSON.parse(localStorage.getItem(window.getCartKey())) || [];
        cart = cart.filter(item => String(item.id) !== String(id));
        localStorage.setItem(window.getCartKey(), JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        window.renderCart();
    };

    window.updateCartQty = function(id, delta) {
        let cart = JSON.parse(localStorage.getItem(window.getCartKey())) || [];
        const item = cart.find(i => String(i.id) === String(id));
        if (item) {
            item.quantity = parseInt(item.quantity) + delta;
            if (item.quantity < 1) return window.removeItem(id);
            localStorage.setItem(window.getCartKey(), JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            window.renderCart();
        }
    };

    window.renderCart();
});