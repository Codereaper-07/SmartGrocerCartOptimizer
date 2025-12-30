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
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={fetchCart}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const isCartEmpty = cartItems.length === 0;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Cart</h2>
        {!isCartEmpty && (
          <span className="text-muted">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {isCartEmpty ? (
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">Your cart is empty!</h4>
          <p className="mb-0">
            Start adding products from the{' '}
            <a href="/products" className="alert-link">
              Products page
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const product = item.product;
                const productId = product._id || product;
                const productName = product.name || 'Unknown Product';
                const productUnit = product.unit || '1 piece';
                const quantity = item.quantity;
                const isUpdating = updating[productId];
                const isRemoving = removing[productId];
                const isDisabled = isUpdating || isRemoving;

                return (
                  <tr key={productId}>
                    <td>
                      <strong>{productName}</strong>
                    </td>
                    <td>{productUnit}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleQuantityUpdate(productId, quantity, -1)}
                          disabled={isDisabled}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="mx-3" style={{ minWidth: '30px', textAlign: 'center' }}>
                          {quantity}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleQuantityUpdate(productId, quantity, 1)}
                          disabled={isDisabled}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveItem(productId)}
                        disabled={isDisabled}
                      >
                        {isRemoving ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
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
