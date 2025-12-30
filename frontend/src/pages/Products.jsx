import { useState, useEffect } from 'react';
import api from '../api/axios';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState({}); // Track which product is being added

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/products');
      
      // Handle response - check for success flag if it exists
      if (response.data.success && response.data.data?.products) {
        setProducts(response.data.data.products);
      } else if (response.data.data?.products) {
        // Fallback if success flag doesn't exist
        setProducts(response.data.data.products);
      } else if (Array.isArray(response.data)) {
        // Fallback if response is directly an array
        setProducts(response.data);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      // Handle error response
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to fetch products. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, productName) => {
    try {
      setAddingToCart((prev) => ({ ...prev, [productId]: true }));
      
      const response = await api.post('/cart/add', {
        productId,
        quantity: 1,
      });

      // Show success message (you could use a toast/alert here)
      // For now, we'll just reset the loading state
      if (response.data.success || response.status === 200) {
        // Product added successfully
        console.log(`${productName} added to cart`);
      }
    } catch (err) {
      // Handle error response
      const errorMessage = err.response?.data?.message 
        ? err.response.data.message 
        : 'Failed to add product to cart. Please try again.';
      
      alert(errorMessage); // Simple alert for now
    } finally {
      setAddingToCart((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products</h2>
        <span className="text-muted">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={fetchProducts}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No products found.
        </div>
      ) : (
        <div className="row g-4">
          {products.map((product) => (
            <div key={product._id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  
                  <div className="mb-2">
                    {product.category && (
                      <span className="badge bg-secondary me-1">
                        {product.category}
                      </span>
                    )}
                    {product.brand && (
                      <span className="badge bg-info text-dark">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  <p className="card-text text-muted small mb-auto">
                    <strong>Unit:</strong> {product.unit || '1 piece'}
                  </p>

                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => handleAddToCart(product._id, product.name)}
                    disabled={addingToCart[product._id]}
                  >
                    {addingToCart[product._id] ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Adding...
                      </>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
