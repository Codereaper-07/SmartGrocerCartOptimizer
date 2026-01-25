const express = require('express');
const router = express.Router();
const { createProduct, getProducts } = require('../controllers/productController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * Product Routes
 * 
 * POST /api/products - Create a new product (protected)
 * GET /api/products - Get all products (public)
 * GET /api/products?category=Fruits - Filter by category (public)
 * GET /api/products?search=apple - Search products by name (public)
 */

// Public routes
router.get('/', getProducts);

// Protected routes (require authentication)
router.post('/', authMiddleware, createProduct);

module.exports = router;



