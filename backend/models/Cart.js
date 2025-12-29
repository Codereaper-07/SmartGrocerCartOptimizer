const mongoose = require('mongoose');

/**
 * Cart Schema
 * Purpose: Represents a user's shopping cart
 * 
 * Key Features:
 * - Links to user for ownership
 * - Status tracks cart state (active vs optimized)
 * - CartItems are stored separately for normalization
 */
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'optimized'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for user's cart lookups
cartSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Cart', cartSchema);

