const Cart = require('../models/Cart');
const Store = require('../models/Store');
const ProductPrice = require('../models/ProductPrice');

/**
 * Optimizer Controller
 * Purpose: Calculate optimal cart pricing across all stores
 * 
 * Algorithm:
 * 1. Fetch user's cart with populated products
 * 2. Check if cart is empty
 * 3. Fetch all active stores
 * 4. For each store:
 *    - Fetch prices for all cart items at that store
 *    - If any product is missing price, exclude store
 *    - Calculate total cart price (sum of price × quantity)
 * 5. Find cheapest store
 * 6. Return detailed breakdown
 */

/**
 * Optimize Cart
 * GET /api/optimize/cart
 * 
 * Returns the optimal store and pricing breakdown for user's cart
 */
const optimizeCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user's cart with populated products
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name category brand unit');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // 2. Check if cart is empty
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add items to cart before optimizing.',
      });
    }

    // 3. Fetch all active stores
    const stores = await Store.find({ isActive: true });

    if (!stores || stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active stores found',
      });
    }

    // 4. Prepare product IDs from cart
    const productIds = cart.items.map((item) => item.product._id);

    // 5. Calculate price for each store
    const storeCalculations = [];

    for (const store of stores) {
      try {
        // Fetch all prices for this store and these products in one query
        const prices = await ProductPrice.find({
          storeId: store._id,
          productId: { $in: productIds },
        }).populate('productId', 'name category brand unit');

        // Create a map for quick price lookup: productId -> price
        const priceMap = new Map();
        prices.forEach((priceDoc) => {
          priceMap.set(priceDoc.productId._id.toString(), {
            price: priceDoc.price,
            lastUpdated: priceDoc.lastUpdated,
            product: priceDoc.productId,
          });
        });

        // Check if all products have prices at this store
        const missingProducts = [];
        let storeTotal = 0;
        const itemBreakdown = [];

        for (const cartItem of cart.items) {
          const productIdStr = cartItem.product._id.toString();
          const priceData = priceMap.get(productIdStr);

          if (!priceData) {
            // Product missing price at this store
            missingProducts.push({
              productId: cartItem.product._id,
              productName: cartItem.product.name,
            });
          } else {
            // Calculate item total
            const itemTotal = priceData.price * cartItem.quantity;
            storeTotal += itemTotal;

            itemBreakdown.push({
              productId: cartItem.product._id,
              productName: cartItem.product.name,
              category: cartItem.product.category,
              brand: cartItem.product.brand,
              unit: cartItem.product.unit,
              quantity: cartItem.quantity,
              pricePerUnit: priceData.price,
              itemTotal: parseFloat(itemTotal.toFixed(2)),
            });
          }
        }

        // Only include store if all products have prices
        if (missingProducts.length === 0) {
          storeCalculations.push({
            storeId: store._id,
            storeName: store.name,
            storeLocation: store.location,
            totalPrice: parseFloat(storeTotal.toFixed(2)),
            itemBreakdown,
          });
        } else {
          // Log excluded store (for debugging)
          console.log(
            `Store "${store.name}" excluded - missing prices for:`,
            missingProducts.map((p) => p.productName).join(', ')
          );
        }
      } catch (error) {
        // Skip this store if there's an error calculating its price
        console.error(`Error calculating price for store ${store.name}:`, error);
        continue;
      }
    }

    // 6. Check if we have any valid stores
    if (storeCalculations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No stores have complete pricing for all cart items',
      });
    }

    // 7. Find cheapest store
    const cheapestStore = storeCalculations.reduce((prev, current) => {
      return prev.totalPrice < current.totalPrice ? prev : current;
    });

    // 8. Calculate savings (if multiple stores)
    let savings = null;
    let savingsPercentage = null;
    if (storeCalculations.length > 1) {
      // Calculate average price excluding cheapest
      const otherStoresTotal = storeCalculations
        .filter((s) => s.storeId.toString() !== cheapestStore.storeId.toString())
        .reduce((sum, store) => sum + store.totalPrice, 0);
      const averagePrice = otherStoresTotal / (storeCalculations.length - 1);
      savings = parseFloat((averagePrice - cheapestStore.totalPrice).toFixed(2));
      savingsPercentage = parseFloat(
        ((savings / averagePrice) * 100).toFixed(2)
      );
    }

    // 9. Build response
    const response = {
      success: true,
      data: {
        cartSummary: {
          totalItems: cart.items.length,
          totalQuantity: cart.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
        },
        cheapestStore: {
          storeId: cheapestStore.storeId,
          storeName: cheapestStore.storeName,
          storeLocation: cheapestStore.storeLocation,
          totalPrice: cheapestStore.totalPrice,
        },
        savings: savings !== null ? {
          amount: savings,
          percentage: savingsPercentage,
        } : null,
        storeBreakdown: storeCalculations.map((store) => ({
          storeId: store.storeId,
          storeName: store.storeName,
          storeLocation: store.storeLocation,
          totalPrice: store.totalPrice,
        })),
        itemBreakdown: cheapestStore.itemBreakdown,
        allStoreDetails: storeCalculations.map((store) => ({
          storeId: store.storeId,
          storeName: store.storeName,
          storeLocation: store.storeLocation,
          totalPrice: store.totalPrice,
          items: store.itemBreakdown,
        })),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Optimize cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error optimizing cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  optimizeCart,
};

