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
      <div className="container mx-auto px-4 mt-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Optimizing your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-4 rounded" role="alert">
          <h4 className="font-bold mb-2">Unable to Optimize</h4>
          <p className="mb-0">{error}</p>
          {error.includes('empty') ? (
            <>
              <hr className="my-3 border-yellow-300" />
              <p className="mb-0">
                <a href="/products" className="text-yellow-700 hover:text-yellow-900 underline font-medium">
                  Browse products
                </a>{' '}
                to add items to your cart.
              </p>
            </>
          ) : (
            <button
              className="mt-3 text-sm border border-yellow-300 px-3 py-1 rounded hover:bg-yellow-100 transition-colors"
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
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded" role="alert">
          No optimization data available.
        </div>
      </div>
    );
  }

  const { cheapestStore, savings, storeBreakdown, itemBreakdown, cartSummary } = optimizationData;

  return (
    <div className="container mx-auto px-4 mt-8">
      <h2 className="text-2xl font-bold mb-6">Cart Optimization Results</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border-2 border-blue-500 rounded-lg shadow-sm p-6">
          <h5 className="text-blue-600 font-semibold mb-2">Cheapest Store</h5>
          <h3 className="text-2xl font-bold text-gray-900">{cheapestStore.storeName}</h3>
          {cheapestStore.storeLocation && (
            <p className="text-sm text-gray-600 mt-1">{cheapestStore.storeLocation}</p>
          )}
        </div>

        <div className="bg-white border-2 border-green-500 rounded-lg shadow-sm p-6">
          <h5 className="text-green-600 font-semibold mb-2">Total Price</h5>
          <h3 className="text-2xl font-bold text-gray-900">${cheapestStore.totalPrice.toFixed(2)}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {cartSummary?.totalItems || 0} items • {cartSummary?.totalQuantity || 0} units
          </p>
        </div>

        {savings && (
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg shadow-sm p-6">
            <h5 className="text-yellow-600 font-semibold mb-2">Total Savings</h5>
            <h3 className="text-2xl font-bold text-yellow-700">
              ${savings.amount.toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {savings.percentage.toFixed(1)}% savings vs average
            </p>
          </div>
        )}
      </div>

      {/* Store Comparison Table */}
      {storeBreakdown && storeBreakdown.length > 0 && (
        <div className="mb-8">
          <h4 className="text-xl font-semibold mb-4">Store Comparison</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Store Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Location</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {storeBreakdown.map((store) => {
                  const isCheapest = store.storeId.toString() === cheapestStore.storeId.toString();
                  return (
                    <tr
                      key={store.storeId}
                      className={isCheapest ? 'bg-green-50 font-bold' : 'hover:bg-gray-50'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {store.storeName}
                        {isCheapest && (
                          <span className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded">Best Price</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{store.storeLocation || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">${store.totalPrice.toFixed(2)}</td>
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
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-4">Item Breakdown (at {cheapestStore.storeName})</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Price per Unit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Item Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {itemBreakdown.map((item, index) => (
                  <tr key={item.productId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <strong className="text-gray-900">{item.productName}</strong>
                      {item.category && (
                        <span className="ml-2 bg-gray-600 text-white text-xs px-2 py-1 rounded">{item.category}</span>
                      )}
                      {item.unit && (
                        <p className="text-sm text-gray-600 mt-1">
                          Unit: {item.unit}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-900">${item.pricePerUnit.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">${item.itemTotal.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50">
                  <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-900">
                    Grand Total:
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    ${cheapestStore.totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <a href="/cart" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium">
          ← Back to Cart
        </a>
        <a href="/products" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Continue Shopping
        </a>
      </div>
    </div>
  );
}

export default Optimize;
