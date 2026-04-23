const { useState, useEffect } = React;

function ProductApp() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [ratings, setRatings] = useState({}); // Guardaremos aquí los datos de renderStars.php

    // 1. Cargar productos iniciales
    useEffect(() => {
        fetch(window.BASE_URL + 'api/api_products.php')
            .then(res => res.json())
            .then(data => {
                const prods = Array.isArray(data) ? data : [];
                setProducts(prods);
                // Una vez cargados los productos, pedimos sus valoraciones
                prods.forEach(p => loadRatingData(p.id));
            })
            .catch(err => console.error("Error productos:", err));

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const handleInput = (e) => setSearch(e.target.value.toLowerCase());
            searchInput.addEventListener('input', handleInput);
            return () => searchInput.removeEventListener('input', handleInput);
        }
    }, []);

    // 2. Función para obtener datos de renderStars.php
    const loadRatingData = (productId) => {
        // RUTA CORREGIDA: public/actions/renderStars.php
        fetch(`${window.BASE_URL}actions/renderStars.php?product_id=${productId}`)
            .then(res => res.json())
            .then(data => {
                setRatings(prev => ({
                    ...prev,
                    [productId]: data // Guardamos html, average y hasVoted
                }));
            })
            .catch(err => console.error(`Error rating prod ${productId}:`, err));
    };

    // 3. Función para VOTAR (myVote.php)
    const handleVote = (productId, ratingValue) => {
        const formData = new FormData();
        formData.append('product_id', productId);
        formData.append('rating', ratingValue);

        // RUTA CORREGIDA: public/actions/myVote.php
        fetch(`${window.BASE_URL}actions/myVote.php`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadRatingData(productId); // Recargamos datos de ese producto
            } else {
                if (data.error === "ALREADY_VOTED") alert("Ya has votado.");
                else if (data.error === "NO_USER") alert("Inicia sesión para votar.");
                else console.error("Error al votar:", data);
            }
        });
    };

    const filteredProducts = products.filter(p => 
        (p.name || "").toLowerCase().includes(search) || 
        (p.description || "").toLowerCase().includes(search)
    );

    return (
        <div className="products">
            {filteredProducts.map(product => {
                const ratingData = ratings[product.id] || { average: 0, html: '...', hasVoted: false };
                
                return (
                    <div key={product.id} className="product-card">
                        <img 
                            src={`${window.BASE_URL}assets/images/${product.image || 'default.png'}`} 
                            alt={product.name} 
                            onError={(e) => e.target.src = window.BASE_URL + 'assets/images/default.png'}
                        />
                        <h3>{product.name}</h3>
                        <p className="price">{parseFloat(product.price).toFixed(2)}€</p>

                        {/* Estrellas */}
                        <div className={`rating ${ratingData.hasVoted ? 'voted' : ''}`} data-product={product.id}>
                            {[1, 2, 3, 4, 5].map(val => (
                                <i 
                                    key={val} 
                                    className={`fa fa-star star ${val <= Math.round(ratingData.average) ? 'active' : ''}`} 
                                    onClick={() => handleVote(product.id, val)}
                                    style={{ cursor: window.USER_ID === 'guest' ? 'default' : 'pointer' }}
                                ></i>
                            ))}
                        </div>

                        {/* Información de votos (inyectamos el HTML que viene de PHP) */}
                        <div 
                            className="rating-info" 
                            id={`rating-info-${product.id}`}
                            dangerouslySetInnerHTML={{ __html: ratingData.html }}
                        >
                        </div>

                        <div className="product-actions">
                            <button className="add-to-cart" onClick={() => window.addToCart(product)}>
                                🛒 Añadir
                            </button>
                            <button 
                                className="add-to-fav" 
                                onClick={() => typeof window.addToFav === 'function' && window.addToFav(product.id)}
                            >
                                ❤️ Favorito
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('react-product-app'));
root.render(<ProductApp />);