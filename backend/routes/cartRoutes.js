const express = require('express');
const router = express.Router();
const {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
} = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * Cart Routes
 * 
 * All routes are protected and require authentication.
 * 
 * POST /api/cart/add - Add product to cart (or increase quantity)
 * PUT /api/cart/update - Update product quantity (or remove if <= 0)
 * DELETE /api/cart/remove/:productId - Remove product from cart
 * GET /api/cart - Get user's cart with product details
 */

// Apply auth middleware to all routes
router.use(authMiddleware);

// Cart routes
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.get('/', getCart);

module.exports = router;



