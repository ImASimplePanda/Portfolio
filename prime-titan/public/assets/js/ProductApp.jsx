const { useState, useEffect, useMemo } = React;

function ProductApp() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [ratings, setRatings] = useState({});
    // Nuevo estado para el Modal
    const [selectedProduct, setSelectedProduct] = useState(null);

    const lang = window.CURRENT_LANGUAGE || 'es';

    useEffect(() => {
        fetch(window.BASE_URL + 'api/api_products.php')
            .then(res => res.json())
            .then(data => {
                const prods = Array.isArray(data) ? data : [];
                setProducts(prods);
                prods.forEach(p => loadRatingData(p.id));
            })
            .catch(err => console.error("Error API:", err));

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const handleInput = (e) => setSearch(e.target.value.toLowerCase());
            searchInput.addEventListener('input', handleInput);
            return () => searchInput.removeEventListener('input', handleInput);
        }
    }, []);

    const loadRatingData = (productId) => {
        fetch(`${window.BASE_URL}actions/renderStars.php?product_id=${productId}`)
            .then(res => res.json())
            .then(data => {
                setRatings(prev => ({ ...prev, [productId]: data }));
            })
            .catch(err => console.error("Error rating:", err));
    };

    const handleVote = (productId, ratingValue) => {
        if (window.IS_GUEST) return;
        const formData = new FormData();
        formData.append('product_id', productId);
        formData.append('rating', ratingValue);

        fetch(`${window.BASE_URL}actions/myVote.php`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) loadRatingData(productId);
        });
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const name = (p.name || "").toLowerCase();
            const desc = (p.description || "").toLowerCase();
            const term = search.toLowerCase();
            return name.includes(term) || desc.includes(term);
        });
    }, [products, search]);

    return (
        <div className="products-container">
            <div className="products">
                {filteredProducts.map(product => {
                    const r = ratings[product.id] || { average: 0, html: '...', hasVoted: false };
                    const displayName = product.name;
                    const imageUrl = `${window.BASE_URL}assets/images/${product.image || 'default.png'}`;

                    return (
                        <div key={product.id} className="product-card">
                            {/* Al hacer click en la imagen, abrimos el modal */}
                            <img 
                                src={imageUrl} 
                                alt={displayName} 
                                className="clickable-img"
                                onClick={() => setSelectedProduct(product)}
                                onError={(e) => { e.target.onerror = null; e.target.src = window.BASE_URL + 'assets/images/default.png'; }}
                            />
                            
                            <h3>{displayName}</h3>
                            <p className="price">{parseFloat(product.price).toFixed(2)}€</p>

                            <div className={`rating ${r.hasVoted ? 'rating-disabled' : ''}`}>
                                {[1, 2, 3, 4, 5].map(v => (
                                    <i 
                                        key={v} 
                                        className={`fa star ${v <= Math.round(r.average) ? 'fa-star active' : 'fa-star-o'}`} 
                                        onClick={() => handleVote(product.id, v)}
                                        style={{ cursor: 'pointer', color: v <= Math.round(r.average) ? 'gold' : '#ccc' }}
                                    ></i>
                                ))}
                            </div>

                            <div className="rating-info" dangerouslySetInnerHTML={{ __html: r.html }}></div>

                            <div className="product-actions">
                                <button className="add-to-cart" onClick={() => window.addToCart(product)}>
                                    🛒 {window.TXT_ADD_TO_CART}
                                </button>
                                <button className="add-to-fav" onClick={() => typeof window.addToFav === 'function' && window.addToFav(product.id)}>
                                    ❤️ {window.TXT_FAVORITE}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/*VENTANA DETALLE */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedProduct(null)}>&times;</button>
                        
                        <div className="modal-body">
                            <div className="modal-left">
                                <img 
                                    src={`${window.BASE_URL}assets/images/${selectedProduct.image || 'default.png'}`} 
                                    alt={selectedProduct.name} 
                                />
                            </div>
                            <div className="modal-right">
                                <h2>{selectedProduct.name}</h2>
                                <p className="modal-price">{parseFloat(selectedProduct.price).toFixed(2)}€</p>
                                <div className="modal-description">
                                    <p>{selectedProduct.description || "No hay descripción disponible."}</p>
                                </div>
                                <button className="add-to-cart" onClick={() => window.addToCart(selectedProduct)}>
                                    🛒 {window.TXT_ADD_TO_CART}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('react-product-app'));
root.render(<ProductApp />);