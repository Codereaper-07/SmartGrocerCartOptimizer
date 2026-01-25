const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Cart Controller
 * Purpose: Handle CRUD operations for shopping cart
 * 
 * Design Notes:
 * - All routes are protected (require authentication)
 * - Each user has exactly one cart (auto-created if doesn't exist)
 * - Cart items are embedded in cart document
 * - Product validation ensures only valid products are added
 */

/**
 * Helper: Get or create cart for user
 * Returns existing cart or creates a new one
 */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
};

/**
 * Add Product to Cart
 * POST /api/cart/add
 * 
 * Adds a product to the cart or increases quantity if already exists
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const addQuantity = quantity ? parseInt(quantity) : 1;
    if (isNaN(addQuantity) || addQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number',
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

    // Get or create cart
    const cart = await getOrCreateCart(userId);

    // Check if product already in cart
    const existingItem = cart.findItemByProduct(productId);

    if (existingItem) {
      // Increase quantity
      existingItem.quantity += addQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity: addQuantity,
      });
    }

    // Save cart
    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name category brand unit');

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      data: { cart },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding product to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Update Cart Item Quantity
 * PUT /api/cart/update
 * 
 * Updates the quantity of a product in the cart
 * Removes item if quantity <= 0
 */
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const newQuantity = quantity !== undefined ? parseInt(quantity) : undefined;
    if (newQuantity !== undefined && (isNaN(newQuantity) || newQuantity < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number',
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    // Update or remove item
    if (newQuantity === undefined || newQuantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = newQuantity;
    }

    // Save cart
    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name category brand unit');

    const wasRemoved = newQuantity === undefined || newQuantity <= 0;

    res.status(200).json({
    success: true,
    message: wasRemoved
        ? 'Product removed from cart'
        : 'Cart updated successfully',
    data: { cart },
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Remove Product from Cart
 * DELETE /api/cart/remove/:productId
 * 
 * Removes a product from the cart
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Find and remove item
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    // Check if item was actually removed
    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    // Save cart
    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name category brand unit');

    res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully',
      data: { cart },
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing product from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get User's Cart
 * GET /api/cart
 * 
 * Returns the current user's cart with populated product details
 * Creates cart if it doesn't exist
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create cart
    const cart = await getOrCreateCart(userId);

    // Populate product details
    await cart.populate('items.product', 'name category brand unit');

    res.status(200).json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
};



