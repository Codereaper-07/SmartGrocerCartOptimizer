require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

// Import models
const Store = require('../models/Store');
const Product = require('../models/Product');
const ProductPrice = require('../models/ProductPrice');

/**
 * MongoDB Seed Script
 * Purpose: Populate database with sample grocery stores, products, and prices
 * 
 * WARNING: This script clears existing data. FOR DEVELOPMENT ONLY.
 */

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Seed Stores
const seedStores = async () => {
  const stores = [
    { name: 'Walmart', location: 'Downtown Mall', isActive: true },
    { name: 'Target', location: 'City Center', isActive: true },
    { name: 'Whole Foods', location: 'Westside Plaza', isActive: true },
    { name: 'Kroger', location: 'Main Street', isActive: true },
  ];

  try {
    const createdStores = await Store.insertMany(stores);
    console.log(`✓ Stores seeded: ${createdStores.length} stores created`);
    return createdStores;
  } catch (error) {
    console.error('✗ Error seeding stores:', error.message);
    throw error;
  }
};

// Seed Products
const seedProducts = async () => {
  const products = [
    // Dairy (4 items)
    { name: 'Whole Milk', category: 'Dairy', brand: 'Farm Fresh', unit: '1L' },
    { name: 'Greek Yogurt', category: 'Dairy', brand: 'Chobani', unit: '500g' },
    { name: 'Cheddar Cheese', category: 'Dairy', brand: 'Kraft', unit: '250g' },
    { name: 'Butter', category: 'Dairy', brand: 'Land O\'Lakes', unit: '500g' },

    // Fruits (5 items)
    { name: 'Bananas', category: 'Fruits', brand: null, unit: '1kg' },
    { name: 'Apples', category: 'Fruits', brand: null, unit: '1kg' },
    { name: 'Strawberries', category: 'Fruits', brand: null, unit: '500g' },
    { name: 'Oranges', category: 'Fruits', brand: null, unit: '1kg' },
    { name: 'Grapes', category: 'Fruits', brand: null, unit: '500g' },

    // Vegetables (5 items)
    { name: 'Tomatoes', category: 'Vegetables', brand: null, unit: '1kg' },
    { name: 'Carrots', category: 'Vegetables', brand: null, unit: '1kg' },
    { name: 'Broccoli', category: 'Vegetables', brand: null, unit: '500g' },
    { name: 'Spinach', category: 'Vegetables', brand: null, unit: '250g' },
    { name: 'Potatoes', category: 'Vegetables', brand: null, unit: '2kg' },

    // Grains (4 items)
    { name: 'White Bread', category: 'Grains', brand: 'Wonder Bread', unit: '1 loaf' },
    { name: 'Brown Rice', category: 'Grains', brand: 'Uncle Ben\'s', unit: '1kg' },
    { name: 'Pasta Spaghetti', category: 'Grains', brand: 'Barilla', unit: '500g' },
    { name: 'Oats', category: 'Grains', brand: 'Quaker', unit: '1kg' },

    // Snacks (4 items)
    { name: 'Potato Chips', category: 'Snacks', brand: 'Lay\'s', unit: '200g' },
    { name: 'Chocolate Chip Cookies', category: 'Snacks', brand: 'Oreo', unit: '300g' },
    { name: 'Granola Bars', category: 'Snacks', brand: 'Nature Valley', unit: '200g' },
    { name: 'Popcorn', category: 'Snacks', brand: 'Orville Redenbacher', unit: '200g' },

    // Beverages (3 items)
    { name: 'Orange Juice', category: 'Beverages', brand: 'Tropicana', unit: '1L' },
    { name: 'Cola Soda', category: 'Beverages', brand: 'Coca-Cola', unit: '2L' },
    { name: 'Coffee Grounds', category: 'Beverages', brand: 'Folgers', unit: '500g' },
  ];

  try {
    const createdProducts = await Product.insertMany(products);
    console.log(`✓ Products seeded: ${createdProducts.length} products created`);
    return createdProducts;
  } catch (error) {
    console.error('✗ Error seeding products:', error.message);
    throw error;
  }
};

// Seed Product Prices
// Prices vary per store to simulate realistic price differences
const seedPrices = async (stores, products) => {
  const prices = [];

  // Helper function to generate price with variation
  // basePrice: base price
  // storeIndex: 0-3, each store has different pricing strategy
  const getPrice = (basePrice, storeIndex) => {
    // Store pricing strategies:
    // Store 0 (Walmart): -5% to -10% (cheapest)
    // Store 1 (Target): -2% to +3% (competitive)
    // Store 2 (Whole Foods): +10% to +20% (premium)
    // Store 3 (Kroger): -3% to +5% (moderate)
    const multipliers = [0.92, 1.0, 1.15, 1.01]; // Average multipliers per store
    const variation = (Math.random() - 0.5) * 0.1; // ±5% random variation
    return parseFloat((basePrice * multipliers[storeIndex] * (1 + variation)).toFixed(2));
  };

  // Define base prices for each product
  const basePrices = {
    // Dairy
    'Whole Milk': 3.99,
    'Greek Yogurt': 4.49,
    'Cheddar Cheese': 5.99,
    'Butter': 4.99,
    // Fruits
    'Bananas': 1.99,
    'Apples': 2.99,
    'Strawberries': 4.99,
    'Oranges': 2.49,
    'Grapes': 5.99,
    // Vegetables
    'Tomatoes': 3.49,
    'Carrots': 1.99,
    'Broccoli': 2.99,
    'Spinach': 2.49,
    'Potatoes': 4.99,
    // Grains
    'White Bread': 2.99,
    'Brown Rice': 4.99,
    'Pasta Spaghetti': 2.49,
    'Oats': 3.99,
    // Snacks
    'Potato Chips': 3.99,
    'Chocolate Chip Cookies': 3.49,
    'Granola Bars': 4.99,
    'Popcorn': 2.99,
    // Beverages
    'Orange Juice': 4.49,
    'Cola Soda': 2.99,
    'Coffee Grounds': 7.99,
  };

  // Generate prices for each product at each store
  products.forEach((product) => {
    const basePrice = basePrices[product.name];
    if (!basePrice) {
      console.warn(`⚠ Warning: No base price defined for ${product.name}`);
      return;
    }

    stores.forEach((store) => {
      const storeIndex = stores.findIndex((s) => s._id.toString() === store._id.toString());
      const price = getPrice(basePrice, storeIndex);

      prices.push({
        productId: product._id,
        storeId: store._id,
        price: price,
        lastUpdated: new Date(),
      });
    });
  });

  try {
    await ProductPrice.insertMany(prices);
    console.log(`✓ Prices seeded: ${prices.length} prices created (${products.length} products × ${stores.length} stores)`);
  } catch (error) {
    console.error('✗ Error seeding prices:', error.message);
    throw error;
  }
};

// Main seed function
const seed = async () => {
  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Store.deleteMany({});
    await Product.deleteMany({});
    await ProductPrice.deleteMany({});
    console.log('✓ Existing data cleared\n');

    // Seed data in order
    const stores = await seedStores();
    const products = await seedProducts();
    await seedPrices(stores, products);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Stores: ${stores.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Prices: ${stores.length * products.length}`);
    console.log('\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed script
if (require.main === module) {
  seed();
}

module.exports = { seed };



