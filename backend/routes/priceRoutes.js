const express = require('express');
const router = express.Router();
const { createOrUpdatePrice, getPrices } = require('../controllers/priceController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * Price Routes
 * 
 * POST /api/prices - Create or update a product price (protected)
 * GET /api/prices - Get all prices (public)
 * GET /api/prices?productId=xxx - Get all prices for a product (public)
 * GET /api/prices?storeId=xxx - Get all prices at a store (public)
 * GET /api/prices?productId=xxx&storeId=yyy - Get specific product price at store (public)
 */

// Public routes
router.get('/', getPrices);

// Protected routes (require authentication)
router.post('/', authMiddleware, createOrUpdatePrice);

module.exports = router;



