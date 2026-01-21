require('dotenv/config');
const express = require('express');
const cors = require('cors');
const authController = require('./controllers/auth.controller');
const productController = require('./controllers/product.controller');
const orderController = require('./controllers/order.controller');
const cartController = require('./controllers/cart.controller');
const { authenticate, authorizeAdmin } = require('./middleware/auth');


const app = express();
app.use(express.json());
app.use(cors());

// --- ROUTES ---
// Auth Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// --- Customer Routes ---
// Customers can list and view product details
app.get('/api/products', productController.getProducts);
app.get('/api/products/:id', productController.getProductById);

// --- Admin Routes ---
// Admins can create, update, delete products
app.post('/api/products', authenticate, authorizeAdmin, productController.createProduct);
app.put('/api/products/:id', authenticate, authorizeAdmin, productController.updateProduct);
app.delete('/api/products/:id', authenticate, authorizeAdmin, productController.deleteProduct);

// --- Cart Routes ---
app.get('/api/cart', authenticate, cartController.getCart);
app.post('/api/cart', authenticate, cartController.addToCart);
app.delete('/api/cart/:productId', authenticate, cartController.removeFromCart);

// --- Order Routes ---
app.post('/api/orders', authenticate, orderController.placeOrder);
app.get('/api/orders', authenticate, orderController.getOrders);

// Error handling middleware (should be after routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - keep server running
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});