const { useState, useEffect } = React;

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('api_products.php')
            .then(response => response.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Cargando productos...</div>;

    return (
        <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {products.map(product => (
                <div key={product.id} className="product-card">
                    <img src={`assets/images/${product.image}`} alt={product.name} style={{ width: '100%' }} />
                    <h3>{product.name}</h3>
                    <p>{product.price}€</p>
                    {/* Reutilizamos tu función addToCart de cart.js */}
                    <button onClick={() => window.addToCartFromReact(product)}>
                        Añadir al carrito
                    </button>
                </div>
            ))}
        </div>
    );
}

// Renderizar en el div con id "react-product-list"
const domContainer = document.querySelector('#react-product-list');
if (domContainer) {
    const root = ReactDOM.createRoot(domContainer);
    root.render(<ProductList />);
}