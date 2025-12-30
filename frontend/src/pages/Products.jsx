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

  /**
   * Get placeholder image URL based on product category
   * Uses a placeholder image service with category-based colors
   */
  const getProductImage = (category, productName) => {
    // Map categories to placeholder image colors/themes
    const categoryColors = {
      'Dairy': 'E3F2FD', // Light blue
      'Fruits': 'FFF3E0', // Light orange
      'Vegetables': 'E8F5E9', // Light green
      'Grains': 'FFF9C4', // Light yellow
      'Snacks': 'FCE4EC', // Light pink
      'Beverages': 'E1F5FE', // Light cyan
      'Meat': 'FFEBEE', // Light red
      'Bakery': 'F3E5F5', // Light purple
    };

    const color = categoryColors[category] || 'F5F5F5'; // Default gray
    const encodedName = encodeURIComponent(productName || 'Product');
    
    // Use placeholder.com service with category-based color
    return `https://via.placeholder.com/300x200/${color}/666666?text=${encodedName}`;
  };

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
        <h2 className="fw-bold">Products</h2>
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
              <div 
                className="card h-100 shadow-sm border-0"
                style={{
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
                }}
              >
                {/* Product Image Section */}
                <div 
                  className="position-relative"
                  style={{
                    height: '200px',
                    backgroundColor: '#f8f9fa',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={getProductImage(product.category, product.name)}
                    alt={product.name}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.target.style.display = 'none';
                      e.target.parentElement.style.backgroundColor = '#e9ecef';
                      e.target.parentElement.innerHTML = `<div class="d-flex align-items-center justify-content-center h-100 text-muted"><i class="bi bi-image"></i></div>`;
                    }}
                  />
                  {/* Category Badge Overlay */}
                  {product.category && (
                    <span 
                      className="badge position-absolute top-0 end-0 m-2"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {product.category}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="card-body d-flex flex-column p-3">
                  {/* Product Name */}
                  <h5 className="card-title mb-2 fw-semibold" style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>
                    {product.name}
                  </h5>
                  
                  {/* Brand Badge */}
                  {product.brand && (
                    <div className="mb-2">
                      <span className="badge bg-light text-dark border" style={{ fontSize: '0.75rem' }}>
                        {product.brand}
                      </span>
                    </div>
                  )}

                  {/* Unit Information */}
                  <div className="mb-3 mt-auto">
                    <small className="text-muted d-flex align-items-center">
                      <span style={{ marginRight: '4px' }}>📦</span>
                      <span>{product.unit || '1 piece'}</span>
                    </small>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    className="btn btn-primary w-100"
                    style={{
                      fontWeight: '500',
                      padding: '0.625rem',
                    }}
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
                      <>
                        <span style={{ marginRight: '6px' }}>🛒</span>
                        Add to Cart
                      </>
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
