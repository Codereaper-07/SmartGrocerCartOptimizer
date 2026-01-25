import { useState, useEffect } from 'react';
import api from '../api/axios';
import { getProductImage, getFallbackImage } from '../utils/productImageMap';

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
    <div className="container mx-auto px-4 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <span className="text-gray-600">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              className="ml-4 text-sm border border-red-300 px-3 py-1 rounded hover:bg-red-100 transition-colors"
              onClick={fetchProducts}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded" role="alert">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product._id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col"
            >
              {/* Product Image Section */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={getProductImage(product.name, product.category)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if local image fails to load
                    e.target.onerror = null;
                    e.target.src = getFallbackImage(product.category, product.name);
                  }}
                />
                {/* Category Badge Overlay */}
                {product.category && (
                  <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Product Name */}
                <h5 className="text-lg font-semibold mb-2 line-clamp-2" style={{ lineHeight: '1.4' }}>
                  {product.name}
                </h5>
                
                {/* Brand Badge */}
                {product.brand && (
                  <div className="mb-3">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-300">
                      {product.brand}
                    </span>
                  </div>
                )}

                {/* Unit Information */}
                <div className="mb-4 mt-auto">
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">📦</span>
                    <span>{product.unit || '1 piece'}</span>
                  </p>
                </div>

                {/* Add to Cart Button */}
                <button
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                  onClick={() => handleAddToCart(product._id, product.name)}
                  disabled={addingToCart[product._id]}
                >
                  {addingToCart[product._id] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span className="mr-1">🛒</span>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
