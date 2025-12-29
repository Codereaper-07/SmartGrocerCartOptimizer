const mongoose = require('mongoose');

/**
 * Cart Schema
 * Purpose: Represents a user's shopping cart
 * 
 * Key Features:
 * - One cart per user (user field is unique)
 * - Items are embedded as an array (simpler structure for this use case)
 * - Auto-updates updatedAt timestamp on save
 * - Items array contains product references and quantities
 * 
 * Design Note:
 * - Using embedded items array instead of separate CartItem collection
 * - This simplifies cart operations (single document updates)
 * - MongoDB document size limit (16MB) is fine for typical cart sizes
 */
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
}, { _id: false }); // No separate _id for subdocuments

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true, // One cart per user
    index: true,
  },
  items: {
    type: [cartItemSchema],
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for user lookups (already unique, but helps with queries)
cartSchema.index({ user: 1 });

// Auto-update updatedAt timestamp on save
cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to find item in cart by product ID
cartSchema.methods.findItemByProduct = function (productId) {
  return this.items.find(
    (item) => item.product.toString() === productId.toString()
  );
};

// Method to add or update item
cartSchema.methods.addOrUpdateItem = function (productId, quantity) {
  const existingItem = this.findItemByProduct(productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity });
  }
};

module.exports = mongoose.model('Cart', cartSchema);
