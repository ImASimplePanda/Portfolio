/* ==========================================================================
   CART.JS - Gestión de Carrito con Validación de Base de Datos
   ========================================================================== */

// 1. Identificadores únicos para el carrito (según usuario e idioma)
const getUserId = () => window.USER_ID || "guest";
const getLang = () => document.documentElement.lang || 'es';
const getCartKey = () => "cart_" + getUserId() + "_" + getLang();

/**
 * Validar productos contra la Base de Datos (Opción 1)
 * Elimina automáticamente del LocalStorage los productos que ya no existen en la DB.
 */
async function validateCartItems(cart) {
    if (cart.length === 0) return cart;

    try {
        const ids = cart.map(item => item.id);
        
        // Usamos window.BASE_URL para garantizar la ruta correcta sin importar la página
        const response = await fetch(window.BASE_URL + 'actions/validate_products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: ids })
        });
        
        if (!response.ok) throw new Error("Archivo de validación no encontrado (404)");

        const validIds = await response.json(); 
        
        // Solo conservamos los productos cuyos IDs han sido devueltos por la DB
        const cleanCart = cart.filter(item => validIds.includes(String(item.id)));
        
        // Si hubo cambios, actualizamos el almacenamiento local
        if (cleanCart.length !== cart.length) {
            localStorage.setItem(getCartKey(), JSON.stringify(cleanCart));
            window.dispatchEvent(new Event('cartUpdated'));
        }
        return cleanCart;
    } catch (error) {
        console.warn("Validación de DB omitida:", error.message);
        return cart; // Si falla el servidor, devolvemos el carrito local para no perder datos
    }
}

/**
 * Añadir al carrito
 */
window.addToCart = function(product) {
    if (!product.id || product.id === "null" || !product.name) {
        console.error("Producto inválido:", product);
        return;
    }

    let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
    const productId = String(product.id).trim();
    const existing = cart.find(item => String(item.id) === productId);
    const qty = Number(product.quantity) || 1;
    const price = parseFloat(product.price) || 0;

    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: price, 
            image: product.image || 'default.jpg',
            quantity: qty
        });
    }

    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    if (typeof window.showToast === 'function') {
        window.showToast(window.CART_ADDED || "Producto añadido");
    }

    if (typeof window.renderCart === 'function') {
        window.renderCart();
    }
};

/**
 * Actualizar cantidad (+/-)
 */
window.updateCartQty = function(id, delta) {
    let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
    const item = cart.find(i => String(i.id) === String(id));
    
    if (item) {
        item.quantity = parseInt(item.quantity) + delta;
        if (item.quantity < 1) {
            cart = cart.filter(i => String(i.id) !== String(id));
        }
        localStorage.setItem(getCartKey(), JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        window.renderCart();
    }
};

/**
 * Borrar de Wishlist al añadir al carrito
 */
function removeFromWishlistDB(id) {
    if (!id || id === "null") return;
    fetch('wishlist-remove.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${encodeURIComponent(id)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) window.location.href = "wishlist.php"; 
    });
}

/**
 * Renderizar el Carrito en el HTML
 */
document.addEventListener("DOMContentLoaded", () => {
    const TXT_EMPTY = window.CART_EMPTY || "Carrito vacío";
    const TXT_QTY = window.CART_QTY || "Cantidad";
    const TXT_REMOVE = window.CART_REMOVE || "Eliminar";

    window.renderCart = async function() {
        const container = document.getElementById("cart-container");
        const totalPriceEl = document.getElementById("cart-total-price");
        if (!container || !totalPriceEl) return;

        let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
        
        // 1. Limpieza inicial
        cart = cart.filter(item => item.id && item.id !== "null" && item.name);
        
        // 2. Validación con el servidor (Elimina lo que ya no existe en DB)
        cart = await validateCartItems(cart); 

        if (cart.length === 0) {
            container.innerHTML = `<p>${TXT_EMPTY}</p>`;
            totalPriceEl.textContent = "0.00€";
            return;
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
                            <button class="qty-btn-dark change-qty" data-id="${item.id}" data-delta="-1">-</button>
                            <span class="qty-text">${TXT_QTY}: ${itemQty}</span>
                            <button class="qty-btn-dark change-qty" data-id="${item.id}" data-delta="1">+</button>
                        </div>

                        <button class="remove-item btn-remove-dark" data-id="${item.id}">${TXT_REMOVE}</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        totalPriceEl.textContent = total.toFixed(2) + "€";

        // Re-asignar eventos a botones generados dinámicamente
        document.querySelectorAll(".change-qty").forEach(btn => {
            btn.onclick = () => updateCartQty(btn.dataset.id, parseInt(btn.dataset.delta));
        });

        document.querySelectorAll(".remove-item").forEach(btn => {
            btn.onclick = () => removeItem(btn.dataset.id);
        });
    };

    function removeItem(id) {
        let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
        cart = cart.filter(item => String(item.id) !== String(id));
        localStorage.setItem(getCartKey(), JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        window.renderCart();
    }

    // Delegación de eventos para botones de "Añadir al Carrito"
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".add-to-cart, .add-from-wishlist");
        if (btn) {
            e.preventDefault(); 
            const productId = btn.getAttribute("data-id");
            const productName = btn.getAttribute("data-name");

            if (!productId || productId === "null" || !productName) return;

            window.addToCart({
                id: productId,
                name: productName,
                price: btn.getAttribute("data-price"),
                image: btn.getAttribute("data-image"),
                quantity: btn.getAttribute("data-quantity") || 1
            });

            if (btn.classList.contains("add-from-wishlist")) {
                removeFromWishlistDB(productId);
            }
        }
    });

    window.renderCart();
});