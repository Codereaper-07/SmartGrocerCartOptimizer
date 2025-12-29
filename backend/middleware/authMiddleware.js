const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Purpose: Verify JWT token and attach authenticated user to request
 * 
 * Usage: Add this middleware to protected routes
 * Example: router.get('/profile', authMiddleware, controller.getProfile)
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.',
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token not found.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token payload
    // Note: password is excluded by default (select: false in schema)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
      });
    }

    // Attach user to request object
    // Now protected routes can access req.user
    req.user = user;
    next();
  } catch (error) {
    // Handle various JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
      });
    }

    // Generic error
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.',
    });
  }
};

/**
 * Optional: Admin-only middleware
 * Use after authMiddleware to restrict routes to admins only
 */
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
};

