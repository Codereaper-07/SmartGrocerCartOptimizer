import { useState, useEffect } from 'react';
import api from '../api/axios';

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState({}); // Track which product is being updated
  const [removing, setRemoving] = useState({}); // Track which product is being removed

  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/cart');
      
      // Handle response - check for success flag if it exists
      if (response.data.success && response.data.data?.cart) {
        setCart(response.data.data.cart);
      } else if (response.data.data?.cart) {
        // Fallback if success flag doesn't exist
        setCart(response.data.data.cart);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      // Handle error response
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to fetch cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityUpdate = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;

    // If quantity becomes 0 or less, remove the item
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    try {
      setUpdating((prev) => ({ ...prev, [productId]: true }));
      
      const response = await api.put('/cart/update', {
        productId,
        quantity: newQuantity,
      });

      // Refresh cart data
      if (response.data.success && response.data.data?.cart) {
        setCart(response.data.data.cart);
      } else if (response.data.data?.cart) {
        setCart(response.data.data.cart);
      } else {
        // Fallback: refresh cart from API
        await fetchCart();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        ? err.response.data.message 
        : 'Failed to update quantity. Please try again.';
      
      alert(errorMessage);
    } finally {
      setUpdating((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setRemoving((prev) => ({ ...prev, [productId]: true }));
      
      const response = await api.delete(`/cart/remove/${productId}`);

      // Refresh cart data
      if (response.data.success && response.data.data?.cart) {
        setCart(response.data.data.cart);
      } else if (response.data.data?.cart) {
        setCart(response.data.data.cart);
      } else {
        // Fallback: refresh cart from API
        await fetchCart();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        ? err.response.data.message 
        : 'Failed to remove item. Please try again.';
      
      alert(errorMessage);
    } finally {
      setRemoving((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 mt-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              className="ml-4 text-sm border border-red-300 px-3 py-1 rounded hover:bg-red-100 transition-colors"
              onClick={fetchCart}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const isCartEmpty = cartItems.length === 0;

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Cart</h2>
        {!isCartEmpty && (
          <span className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {isCartEmpty ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-4 rounded" role="alert">
          <h4 className="font-bold mb-2">Your cart is empty!</h4>
          <p>
            Start adding products from the{' '}
            <a href="/products" className="text-blue-600 hover:text-blue-800 underline font-medium">
              Products page
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cartItems.map((item, index) => {
                const product = item.product;
                const productId = product._id || product;
                const productName = product.name || 'Unknown Product';
                const productUnit = product.unit || '1 piece';
                const quantity = item.quantity;
                const isUpdating = updating[productId];
                const isRemoving = removing[productId];
                const isDisabled = isUpdating || isRemoving;

                return (
                  <tr key={productId} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <strong className="text-gray-900">{productName}</strong>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{productUnit}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          className="px-3 py-1 border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                          onClick={() => handleQuantityUpdate(productId, quantity, -1)}
                          disabled={isDisabled}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 border-t border-b border-gray-300 bg-white text-center min-w-[40px]">
                          {quantity}
                        </span>
                        <button
                          className="px-3 py-1 border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                          onClick={() => handleQuantityUpdate(productId, quantity, 1)}
                          disabled={isDisabled}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        className="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-1"
                        onClick={() => handleRemoveItem(productId)}
                        disabled={isDisabled}
                      >
                        {isRemoving ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Removing...
                          </>
                        ) : (
                          'Remove'
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Cart;
