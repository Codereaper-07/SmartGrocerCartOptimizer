# Smart Grocery Cart Optimizer – Project Context

## Stack
- Backend: Node.js, Express
- Database: MongoDB Atlas
- Auth: JWT-based authentication
- Tools: Mongoose, bcrypt, jsonwebtoken

## Completed Features
### Authentication
- Register, login, get current user
- JWT auth middleware
- Protected routes tested and working

### Data Models
- Store: name, location, isActive
- Product: name, category, brand, unit
- ProductPrice: productId, storeId, price, lastUpdated

### Controllers Implemented
- storeController (createStore, getStores)
- productController (createProduct, getProducts)
- priceController (createOrUpdatePrice, getPrices)

### Routes Implemented
- /api/auth
- /api/stores
- /api/products
- /api/prices

### Notes / Decisions
- Product uniqueness currently handled at controller level using name + brand (case-insensitive)
- Schema-level compound unique index (name + brand) will be added later
- Price uses upsert logic with composite index (productId + storeId)
- Seed script not implemented yet
- Cart and optimizer logic not implemented yet

## Current Status
- All APIs implemented
- APIs ready for testing via Thunder Client
- Next steps: test APIs → commit → seed script → cart + optimizer
