import { useState, useEffect } from 'react';
import api from '../api/axios';

function Optimize() {
  const [optimizationData, setOptimizationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch optimization result on component mount
  useEffect(() => {
    fetchOptimization();
  }, []);

  const fetchOptimization = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/optimize/cart');
      
      // Handle response - check for success flag if it exists
      if (response.data.success && response.data.data) {
        setOptimizationData(response.data.data);
      } else if (response.data.data) {
        // Fallback if success flag doesn't exist
        setOptimizationData(response.data.data);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      // Handle error response
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 404 && err.response?.data?.message?.includes('empty')) {
        // Cart is empty
        setError('Your cart is empty. Add items to your cart to see optimization results.');
      } else {
        setError('Failed to fetch optimization data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Optimizing your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Unable to Optimize</h4>
          <p className="mb-0">{error}</p>
          {error.includes('empty') ? (
            <>
              <hr />
              <p className="mb-0">
                <a href="/products" className="alert-link">
                  Browse products
                </a>{' '}
                to add items to your cart.
              </p>
            </>
          ) : (
            <button
              className="btn btn-sm btn-outline-warning mt-3"
              onClick={fetchOptimization}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!optimizationData) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info" role="alert">
          No optimization data available.
        </div>
      </div>
    );
  }

  const { cheapestStore, savings, storeBreakdown, itemBreakdown, cartSummary } = optimizationData;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Cart Optimization Results</h2>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-primary">
            <div className="card-body">
              <h5 className="card-title text-primary">Cheapest Store</h5>
              <h3 className="card-text">{cheapestStore.storeName}</h3>
              {cheapestStore.storeLocation && (
                <p className="text-muted small mb-0">{cheapestStore.storeLocation}</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-success">
            <div className="card-body">
              <h5 className="card-title text-success">Total Price</h5>
              <h3 className="card-text">${cheapestStore.totalPrice.toFixed(2)}</h3>
              <p className="text-muted small mb-0">
                {cartSummary?.totalItems || 0} items • {cartSummary?.totalQuantity || 0} units
              </p>
            </div>
          </div>
        </div>

        {savings && (
          <div className="col-md-4 mb-3">
            <div className="card border-warning bg-warning bg-opacity-10">
              <div className="card-body">
                <h5 className="card-title text-warning">Total Savings</h5>
                <h3 className="card-text text-warning">
                  ${savings.amount.toFixed(2)}
                </h3>
                <p className="text-muted small mb-0">
                  {savings.percentage.toFixed(1)}% savings vs average
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Store Comparison Table */}
      {storeBreakdown && storeBreakdown.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-3">Store Comparison</h4>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Store Name</th>
                  <th>Location</th>
                  <th className="text-end">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {storeBreakdown.map((store) => {
                  const isCheapest = store.storeId.toString() === cheapestStore.storeId.toString();
                  return (
                    <tr
                      key={store.storeId}
                      className={isCheapest ? 'table-success fw-bold' : ''}
                    >
                      <td>
                        {store.storeName}
                        {isCheapest && (
                          <span className="badge bg-success ms-2">Best Price</span>
                        )}
                      </td>
                      <td>{store.storeLocation || '—'}</td>
                      <td className="text-end">${store.totalPrice.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Breakdown Table */}
      {itemBreakdown && itemBreakdown.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-3">Item Breakdown (at {cheapestStore.storeName})</h4>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th className="text-end">Price per Unit</th>
                  <th className="text-end">Item Total</th>
                </tr>
              </thead>
              <tbody>
                {itemBreakdown.map((item, index) => (
                  <tr key={item.productId || index}>
                    <td>
                      <strong>{item.productName}</strong>
                      {item.category && (
                        <span className="badge bg-secondary ms-2">{item.category}</span>
                      )}
                      {item.unit && (
                        <span className="text-muted small d-block mt-1">
                          Unit: {item.unit}
                        </span>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td className="text-end">${item.pricePerUnit.toFixed(2)}</td>
                    <td className="text-end fw-bold">${item.itemTotal.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="table-primary">
                  <td colSpan="3" className="text-end fw-bold">
                    Grand Total:
                  </td>
                  <td className="text-end fw-bold">
                    ${cheapestStore.totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-2">
        <a href="/cart" className="btn btn-outline-secondary">
          ← Back to Cart
        </a>
        <a href="/products" className="btn btn-outline-primary">
          Continue Shopping
        </a>
      </div>
    </div>
  );
}

export default Optimize;
