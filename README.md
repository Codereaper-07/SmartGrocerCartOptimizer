# Smart Grocery Cart Optimizer

A production-grade MERN stack application that helps users minimize their grocery expenses by comparing prices across multiple stores and finding the optimal cart configuration.

## 🎯 Core Concept

Users add grocery items to their cart, and the backend compares prices of those items across multiple grocery stores stored in the database. The system returns the cheapest possible cart configuration along with total cost and savings.

**Important:** This project does NOT scrape real grocery websites. All prices are stored and managed in the database, focusing on backend optimization logic, data modeling, and system design.

## 🛠️ Tech Stack

- **Frontend:** React (functional components), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt

## 📁 Project Structure

```
SmartGrocerCartOptimizer/
├── backend/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Store.js           # Store schema
│   │   ├── Product.js         # Product schema
│   │   ├── ProductPrice.js    # ProductPrice schema
│   │   ├── Cart.js            # Cart schema
│   │   ├── CartItem.js        # CartItem schema
│   │   └── index.js           # Model exports
│   ├── routes/                # API routes (to be implemented)
│   ├── controllers/           # Route handlers (to be implemented)
│   ├── middleware/            # Custom middleware (to be implemented)
│   ├── utils/                 # Utility functions (to be implemented)
│   ├── server.js              # Express app entry point
│   └── package.json
├── frontend/                  # React app (to be implemented)
├── package.json               # Root package.json
└── README.md
```

## 🗄️ Database Schema Design

### Why This Data Model Works for Price Optimization

The database schema is designed using **normalization principles** to enable efficient price optimization queries:

#### 1. **Separation of Concerns (Normalization)**

- **Product** stores product information independently (name, category, unit)
- **Store** stores vendor information independently
- **ProductPrice** links products to stores with prices

This separation allows:
- Easy price updates without touching product data
- Efficient queries: "Get all prices for product X"
- Scalability: Add new stores/products without schema changes

#### 2. **Composite Indexes for Performance**

The `ProductPrice` model uses composite indexes:
```javascript
index({ productId: 1, storeId: 1 }, { unique: true })
```

This enables:
- Fast lookups: "Get price of product X at store Y" → O(log n)
- Efficient aggregation: "Get all prices for product X" → Index scan
- Optimized cart queries: Fetch all relevant prices in one query

#### 3. **Optimization Algorithm Efficiency**

When optimizing a cart:
1. Fetch all `CartItems` for a cart → O(k) where k = cart size
2. For each product, fetch all `ProductPrices` → O(k * log m) where m = stores
3. Select cheapest store per item → O(k * m)
4. Calculate totals → O(k)

**Total complexity:** O(k * m) which is optimal for this use case.

#### 4. **Data Integrity**

- Unique constraint on `(productId, storeId)` ensures one price per product-store pair
- Foreign key references maintain referential integrity
- Indexes prevent duplicate entries and speed up queries

#### 5. **Scalability Considerations**

- Small dataset (3-6 stores, ~100 products) → Works perfectly
- Large dataset (100+ stores, 1000+ products) → Indexes ensure performance
- Horizontal scaling → MongoDB sharding can partition by storeId or productId

### Schema Relationships

```
User (1) ──→ (N) Cart
Cart (1) ──→ (N) CartItem
CartItem (N) ──→ (1) Product
Product (1) ──→ (N) ProductPrice
Store (1) ──→ (N) ProductPrice
```

This structure allows:
- Multiple users with their own carts
- Multiple items per cart
- Multiple prices per product (one per store)
- Efficient joins via Mongoose `.populate()`

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install root dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Create `.env` file in `backend/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/smart-grocer-cart
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

5. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

## 📝 API Endpoints (To Be Implemented)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Stores (Admin Only)
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Products (Admin Only)
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Product Prices (Admin Only)
- `GET /api/prices` - Get all prices
- `POST /api/prices` - Create/update price
- `GET /api/prices/product/:productId` - Get prices for a product

### Cart (User)
- `GET /api/cart` - Get user's active cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `POST /api/cart/optimize` - Optimize cart and get best prices

## 🎯 Next Steps

1. ✅ Set up backend folder structure
2. ✅ Create all Mongoose schemas
3. ⏳ Implement authentication routes and middleware
4. ⏳ Implement store/product/price CRUD (admin only)
5. ⏳ Implement cart management routes
6. ⏳ Implement optimization algorithm
7. ⏳ Set up React frontend
8. ⏳ Build UI components


