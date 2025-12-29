const mongoose = require('mongoose');

/**
 * ProductPrice Schema
 * Purpose: Stores the price of a product at a specific store
 * 
 * Key Features:
 * - Normalized pricing data (one price per product-store combination)
 * - Composite index on (productId, storeId) for fast price lookups
 * - UpdatedAt tracks price changes over time
 * - This is the core data for optimization algorithm
 * 
 * Why This Design Works:
 * - Separates product data from pricing data (normalization)
 * - Allows easy price updates without touching product info
 * - Enables efficient queries: "Get all prices for product X"
 * - Enables efficient queries: "Get cheapest price for product X"
 */
const productPriceSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
    index: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store ID is required'],
    index: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Composite index for efficient price lookups
// This allows fast queries like: "Get price of product X at store Y"
// and "Get all prices for product X across stores"
productPriceSchema.index({ productId: 1, storeId: 1 }, { unique: true });

// Index for store-based queries (get all prices at a store)
productPriceSchema.index({ storeId: 1 });

// Ensure one active price per product per store
productPriceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProductPrice', productPriceSchema);

