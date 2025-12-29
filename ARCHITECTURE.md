# Data Model Architecture Explanation

## Why This Schema Design Works for Price Optimization

### Problem Statement
Given a cart with N items, find the cheapest combination by selecting one store per item, minimizing total cost.

### Design Decisions

#### 1. **Normalized Pricing Data (ProductPrice Model)**

**The Core Insight:**
Instead of storing prices as nested arrays in Product or Store models, we use a separate `ProductPrice` collection. This is a classic **many-to-many relationship** with attributes (price).

```
Product ←─→ ProductPrice ←─→ Store
```

**Why This Works:**
- **Query Efficiency:** To find the cheapest price for a product, we query:
  ```javascript
  ProductPrice.find({ productId: X }).sort({ price: 1 }).limit(1)
  ```
  The composite index `(productId, storeId)` makes this O(log n) operation.

- **Update Efficiency:** Price updates only touch one document, not entire product/store objects.

- **Scalability:** Adding a new store doesn't require updating all products.

#### 2. **Cart-CartItem Separation**

**The Pattern:**
Cart contains metadata (userId, status), while CartItem contains the actual items.

**Why This Works:**
- **Flexibility:** Add/remove items without updating entire cart document
- **Query Efficiency:** 
  ```javascript
  // Get all items in cart
  CartItem.find({ cartId: cartId }).populate('productId')
  ```
- **Normalization:** Avoids document size limits (16MB in MongoDB)

#### 3. **Composite Indexes for Optimization Algorithm**

**The Optimization Query Pattern:**
```javascript
// For each product in cart:
// 1. Get all prices for that product
ProductPrice.find({ productId: productId })
  .populate('storeId')
  .sort({ price: 1 })

// 2. Select cheapest
// 3. Calculate: quantity × price
```

**Index Strategy:**
- `ProductPrice.index({ productId: 1, storeId: 1 })` - Fast lookup of specific price
- `ProductPrice.index({ productId: 1 })` - Fast aggregation of all prices for a product
- `CartItem.index({ cartId: 1, productId: 1 })` - Fast cart item retrieval

**Algorithm Complexity:**
- Cart has K items
- Each product has M stores
- Total operations: K × M (fetching prices) + K (selecting minimum) = O(K × M)

For typical use case (K=10, M=5): 50 operations → Very fast!

#### 4. **Store-Agnostic Product Model**

**The Benefit:**
Product information (name, category, unit) is independent of stores.

**Why This Matters:**
- Product search doesn't require joining with stores
- Category filtering is straightforward
- Unit information helps with quantity calculations
- Future feature: Product recommendations based on category

#### 5. **Optimization Result Structure (Future Implementation)**

The optimization algorithm will return:
```javascript
{
  cartItems: [
    {
      product: {...},
      quantity: 2,
      store: {...},
      pricePerUnit: 5.99,
      totalPrice: 11.98
    },
    // ...
  ],
  totalCost: 45.67,
  originalCost: 52.30,  // If all from one store
  savings: 6.63,
  storeBreakdown: {
    "Store A": 20.50,
    "Store B": 15.17,
    "Store C": 10.00
  }
}
```

This structure:
- Shows per-item optimization
- Calculates total savings
- Provides store breakdown for user decision-making

### Alternative Approaches (Why Not These)

#### ❌ Embedding Prices in Product
```javascript
Product {
  prices: [
    { storeId: ..., price: ... },
    ...
  ]
}
```
**Problem:** Updating a price requires updating entire product document. Document size grows with stores.

#### ❌ Embedding Items in Cart
```javascript
Cart {
  items: [
    { productId: ..., quantity: ... },
    ...
  ]
}
```
**Problem:** Document size limit (16MB). Can't efficiently query for "all carts containing product X".

#### ❌ Single Collection for All Data
```javascript
StoreProduct {
  storeId: ...,
  productId: ...,
  price: ...,
  productName: ...,  // Denormalized
  storeName: ...,    // Denormalized
}
```
**Problem:** Data duplication, update anomalies, harder to maintain.

### Performance Characteristics

| Operation | Complexity | Index Used |
|-----------|-----------|------------|
| Get product prices | O(M log M) | productId index |
| Get cheapest price | O(M log M) | productId index + sort |
| Add item to cart | O(1) | cartId index |
| Optimize entire cart | O(K × M log M) | Multiple indexes |
| Update price | O(log N) | Composite index |

Where:
- K = number of items in cart (typically 5-20)
- M = number of stores (typically 3-6)
- N = total product prices (typically 300-600)

### Future Scalability

**If dataset grows:**
- 100 stores, 10,000 products → Indexes still work efficiently
- Can add caching layer (Redis) for frequently accessed prices
- Can partition ProductPrice collection by storeId for sharding
- Can add price history collection for trend analysis

**Additional Features Enabled:**
- Price alerts (product drops below threshold)
- Price history tracking
- Store recommendations (closest store with best price)
- Seasonal price trends

### Conclusion

This schema design:
✅ Normalized for data integrity  
✅ Indexed for query performance  
✅ Scalable for future growth  
✅ Clean separation of concerns  
✅ Interview-ready (demonstrates DB design knowledge)

The structure enables efficient optimization while maintaining flexibility for future features.

