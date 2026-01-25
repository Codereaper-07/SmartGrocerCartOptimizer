# Product Images Directory

This directory contains product images for the Smart Grocery Cart Optimizer.

## Image Requirements

- **Format**: JPG or PNG recommended
- **Dimensions**: 300x200px or similar aspect ratio (3:2)
- **File Naming**: Use lowercase with hyphens (e.g., `whole-milk.jpg`, `greek-yogurt.jpg`)

## Supported Product Images

The following product images are mapped in the application:

### Dairy
- `whole-milk.jpg`
- `greek-yogurt.jpg`
- `cheddar-cheese.jpg`
- `butter.jpg`

### Fruits
- `bananas.jpg`
- `apples.jpg`
- `strawberries.jpg`
- `oranges.jpg`
- `grapes.jpg`

### Vegetables
- `tomatoes.jpg`
- `carrots.jpg`
- `broccoli.jpg`
- `spinach.jpg`
- `potatoes.jpg`

### Grains
- `white-bread.jpg`
- `brown-rice.jpg`
- `pasta-spaghetti.jpg`
- `oats.jpg`

### Snacks
- `potato-chips.jpg`
- `chocolate-chip-cookies.jpg`
- `granola-bars.jpg`
- `popcorn.jpg`

### Beverages
- `orange-juice.jpg`
- `cola-soda.jpg`
- `coffee-grounds.jpg`

## Fallback Behavior

If an image is not found in this directory, the application will automatically use a category-based placeholder image from an external service.

## Adding New Product Images

1. Add the image file to this directory with the appropriate filename
2. Update `frontend/src/utils/productImageMap.js` to include the mapping
3. The image will be automatically loaded on the next render
