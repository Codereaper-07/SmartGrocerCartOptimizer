/**
 * Product Image Mapping
 * Frontend-only static mapping of product names to image paths
 * Images should be placed in /public/images directory
 * 
 * Format: productName (as it appears in database) -> image filename
 */

const productImageMap = {
  // Dairy
  'Whole Milk': '/images/whole-milk.jpg',
  'Greek Yogurt': '/images/greek-yogurt.jpg',
  'Cheddar Cheese': '/images/cheddar-cheese.jpg',
  'Butter': '/images/butter.jpg',
  
  // Fruits
  'Bananas': '/images/bananas.jpg',
  'Apples': '/images/apples.jpg',
  'Strawberries': '/images/strawberries.jpg',
  'Oranges': '/images/oranges.jpg',
  'Grapes': '/images/grapes.jpg',
  
  // Vegetables
  'Tomatoes': '/images/tomatoes.jpg',
  'Carrots': '/images/carrots.jpg',
  'Broccoli': '/images/broccoli.jpg',
  'Spinach': '/images/spinach.jpg',
  'Potatoes': '/images/potatoes.jpg',
  
  // Grains
  'White Bread': '/images/white-bread.jpg',
  'Brown Rice': '/images/brown-rice.jpg',
  'Pasta Spaghetti': '/images/pasta-spaghetti.jpg',
  'Oats': '/images/oats.jpg',
  
  // Snacks
  'Potato Chips': '/images/potato-chips.jpg',
  'Chocolate Chip Cookies': '/images/chocolate-chip-cookies.jpg',
  'Granola Bars': '/images/granola-bars.jpg',
  'Popcorn': '/images/popcorn.jpg',
  
  // Beverages
  'Orange Juice': '/images/orange-juice.jpg',
  'Cola Soda': '/images/cola-soda.jpg',
  'Coffee Grounds': '/images/coffee-grounds.jpg',
};

/**
 * Get product image path from mapping
 * Returns the image path if found, otherwise returns null
 */
export const getProductImagePath = (productName) => {
  if (!productName) return null;
  return productImageMap[productName] || null;
};

/**
 * Get fallback placeholder image URL based on category
 * Uses placeholder.com service with category-based colors
 */
export const getFallbackImage = (category, productName) => {
  const categoryColors = {
    'Dairy': 'E3F2FD',
    'Fruits': 'FFF3E0',
    'Vegetables': 'E8F5E9',
    'Grains': 'FFF9C4',
    'Snacks': 'FCE4EC',
    'Beverages': 'E1F5FE',
    'Meat': 'FFEBEE',
    'Bakery': 'F3E5F5',
  };

  const color = categoryColors[category] || 'F5F5F5';
  const encodedName = encodeURIComponent(productName || 'Product');
  return `https://via.placeholder.com/300x200/${color}/666666?text=${encodedName}`;
};

/**
 * Main function to get product image
 * Tries local image first, falls back to placeholder
 */
export const getProductImage = (productName, category) => {
  const imagePath = getProductImagePath(productName);
  if (imagePath) {
    return imagePath;
  }
  return getFallbackImage(category, productName);
};
