const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * Authentication Routes
 * 
 * POST /api/auth/register - Register a new user
 * POST /api/auth/login - Login user and get JWT token
 * GET /api/auth/me - Get current authenticated user (protected route)
 */

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route (requires authentication)
router.get('/me', authMiddleware, getMe);

module.exports = router;

