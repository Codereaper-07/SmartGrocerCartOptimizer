const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// Load environment variables
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("Loaded MONGO URI:", process.env.MONGODB_URI);

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Grocery Cart Optimizer API',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes (to be implemented)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/stores', require('./routes/stores'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/cart', require('./routes/cart'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

