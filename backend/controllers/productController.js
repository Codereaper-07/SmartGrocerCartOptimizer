const Product = require('../models/Product');

/**
 * Product Controller
 * Purpose: Handle CRUD operations for grocery products
 * 
 * Design Notes:
 * - POST routes are protected (admin-only for product management)
 * - GET routes are public (users need to browse products)
 * - Products are store-agnostic; prices are stored separately
 */

/**
 * Create Product
 * POST /api/products
 * Protected route - requires authentication
 */
const createProduct = async (req, res) => {
  try {
    const { name, category, brand, unit } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required',
      });
    }

    // Check if product already exists
    const existingProduct = await Product.findOne({
        name: new RegExp(`^${name.trim()}$`, 'i'),
        brand: brand ? new RegExp(`^${brand.trim()}$`, 'i') : undefined,
      });
      
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists',
      });
    }

    // Create product
    const product = await Product.create({
      name: name.trim(),
      category: category ? category.trim() : undefined,
      brand: brand ? brand.trim() : undefined,
      unit: unit ? unit.trim() : '1 piece',
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
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
        message: 'Product with this name already exists',
      });
    }

    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get All Products
 * GET /api/products
 * Public route - returns all products
 * 
 * Query params:
 * - category: filter by category
 * - search: search by product name (case-insensitive)
 */
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    // Build query
    const query = {};
    if (category) {
      query.category = new RegExp(category.trim(), 'i'); // Case-insensitive
    }
    if (search) {
      query.name = new RegExp(search.trim(), 'i'); // Case-insensitive search
    }

    // Fetch products
    const products = await Product.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
};



