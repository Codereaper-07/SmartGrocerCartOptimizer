const ProductPrice = require('../models/ProductPrice');
const Product = require('../models/Product');
const Store = require('../models/Store');

/**
 * Price Controller
 * Purpose: Handle CRUD operations for product prices
 * 
 * Design Notes:
 * - POST routes are protected (admin-only for price management)
 * - GET routes are public (users need to see prices)
 * - ProductPrice model ensures one price per product-store combination
 * - Creating/updating a price for same product-store updates existing record
 */

/**
 * Create or Update Product Price
 * POST /api/prices
 * Protected route - requires authentication
 * 
 * If a price already exists for the product-store combination, it will be updated.
 * This implements upsert behavior using findOneAndUpdate.
 */
const createOrUpdatePrice = async (req, res) => {
  try {
    const { productId, storeId, price } = req.body;

    // Validation
    if (!productId || !storeId || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, Store ID, and price are required',
      });
    }

    // Validate price is a positive number
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number',
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    // Check if store is active
    if (!store.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot set price for inactive store',
      });
    }

    // Check if price already exists
    const existingPrice = await ProductPrice.findOne({ productId, storeId });

    // Create or update price (upsert)
    // findOneAndUpdate with upsert: true will create if not exists, update if exists
    const productPrice = await ProductPrice.findOneAndUpdate(
      { productId, storeId },
      {
        productId,
        storeId,
        price: priceNumber,
        lastUpdated: Date.now(), // Explicitly set to ensure it updates
      },
      {
        new: true, // Return updated document
        upsert: true, // Create if doesn't exist
        runValidators: true, // Run schema validators
      }
    ).populate('productId', 'name category brand unit').populate('storeId', 'name location');

    res.status(200).json({
      success: true,
      message: existingPrice ? 'Price updated successfully' : 'Price created successfully',
      data: { productPrice },
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

    // Handle duplicate key error (shouldn't happen with upsert, but just in case)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Price already exists for this product-store combination',
      });
    }

    console.error('Create/update price error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating/updating price',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get Product Prices
 * GET /api/prices
 * Public route - returns product prices based on query filters
 * 
 * Query params:
 * - productId: filter by product ID (get all prices for a product)
 * - storeId: filter by store ID (get all prices at a store)
 * - Both: get specific product price at specific store
 */
const getPrices = async (req, res) => {
  try {
    const { productId, storeId } = req.query;

    // Build query
    const query = {};
    if (productId) {
      query.productId = productId;
    }
    if (storeId) {
      query.storeId = storeId;
    }

    // If no filters provided, return all prices (could be expensive, but public for now)
    // In production, you might want to require at least one filter or add pagination

    // Fetch prices with populated product and store data
    const prices = await ProductPrice.find(query)
      .populate('productId', 'name category brand unit')
      .populate('storeId', 'name location isActive')
      .sort({ productId: 1, price: 1 }); // Sort by product, then by price (cheapest first)

    res.status(200).json({
      success: true,
      count: prices.length,
      data: { prices },
    });
  } catch (error) {
    console.error('Get prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  createOrUpdatePrice,
  getPrices,
};

