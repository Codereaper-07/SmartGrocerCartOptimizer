const Store = require('../models/Store');

/**
 * Store Controller
 * Purpose: Handle CRUD operations for grocery stores
 * 
 * Design Notes:
 * - POST routes are protected (admin-only for store management)
 * - GET routes are public (users need to see available stores)
 */

/**
 * Create Store
 * POST /api/stores
 * Protected route - requires authentication
 */
const createStore = async (req, res) => {
  try {
    const { name, location, isActive } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Store name is required',
      });
    }

    // Check if store already exists
    const existingStore = await Store.findOne({ name: name.trim() });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: 'Store with this name already exists',
      });
    }

    // Create store
    const store = await Store.create({
      name: name.trim(),
      location: location ? location.trim() : undefined,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: { store },
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Store with this name already exists',
      });
    }

    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating store',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get All Stores
 * GET /api/stores
 * Public route - returns all stores (active and inactive)
 * 
 * Query params:
 * - active: filter by isActive status (true/false)
 */
const getStores = async (req, res) => {
  try {
    const { active } = req.query;

    // Build query
    const query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    // Fetch stores
    const stores = await Store.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: stores.length,
      data: { stores },
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stores',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createStore,
  getStores,
};



