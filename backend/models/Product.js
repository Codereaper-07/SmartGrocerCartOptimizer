const mongoose = require('mongoose');

/**
 * Product Schema
 * Purpose: Represents a grocery item independent of stores
 * 
 * Key Features:
 * - Product information is store-agnostic
 * - Unit field helps with quantity-based price comparisons
 * - Category enables filtering and organization
 * - Prices are stored separately in ProductPrice model
 */
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    unique: true,
  },
  category: {
    type: String,
    trim: true,
    // Examples: "Fruits", "Vegetables", "Dairy", "Meat", "Bakery", etc.
  },
  unit: {
    type: String,
    trim: true,
    // Examples: "1kg", "1L", "500g", "1 piece", etc.
    default: '1 piece',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for category-based filtering
productSchema.index({ category: 1 });
productSchema.index({ name: 1 }); // For search functionality

module.exports = mongoose.model('Product', productSchema);

