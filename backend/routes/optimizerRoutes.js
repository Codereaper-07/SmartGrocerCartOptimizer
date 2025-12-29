const express = require('express');
const router = express.Router();
const { optimizeCart } = require('../controllers/optimizerController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * Optimizer Routes
 * 
 * All routes are protected and require authentication.
 * 
 * GET /api/optimize/cart - Optimize cart and get best pricing
 */

// Apply auth middleware to all routes
router.use(authMiddleware);

// Optimizer routes
router.get('/cart', optimizeCart);

module.exports = router;

