const mongoose = require('mongoose');

/**
 * Store Schema
 * Purpose: Represents a grocery store / vendor
 * 
 * Key Features:
 * - Stores basic store information
 * - isActive flag allows soft deletion/deactivation
 * - Used as reference in ProductPrice for price comparison
 */
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a store name'],
    trim: true,
    unique: true,
  },
  location: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups of active stores
storeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Store', storeSchema);

