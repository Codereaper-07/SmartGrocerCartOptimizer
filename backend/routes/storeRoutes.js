const express = require('express');
const router = express.Router();
const { createStore, getStores } = require('../controllers/storeController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * Store Routes
 * 
 * POST /api/stores - Create a new store (protected)
 * GET /api/stores - Get all stores (public)
 * GET /api/stores?active=true - Get only active stores (public)
 */

// Public routes
router.get('/', getStores);

// Protected routes (require authentication)
router.post('/', authMiddleware, createStore);

module.exports = router;



