const mongoose = require('mongoose');

/**
 * CartItem Schema
 * Purpose: Represents an item inside a cart
 * 
 * Key Features:
 * - Links cart to products with quantity
 * - Quantity allows buying multiple units
 * - Separated from Cart for normalization (one-to-many relationship)
 * 
 * Why This Design Works:
 * - Allows multiple items per cart without embedding arrays
 * - Easy to add/remove items without updating entire cart
 * - Enables efficient queries for cart contents
 */
const cartItemSchema = new mongoose.Schema({
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: [true, 'Cart ID is required'],
    index: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
    index: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Composite index for cart item lookups
cartItemSchema.index({ cartId: 1, productId: 1 });

// Ensure one cart item entry per product per cart
cartItemSchema.index({ cartId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', cartItemSchema);

