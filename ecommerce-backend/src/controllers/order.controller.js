const orderService = require('../services/order.service');

// POST /api/orders
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT
    const order = await orderService.placeOrder(userId);
    res.status(201).json({ 
      message: 'Order placed successfully', 
      orderId: order.id 
    });
  } catch (err) {
    // If stock is low, we return 400 Bad Request
    res.status(400).json({ error: err.message });
  }
};

// GET /api/orders
// Handles both "Customer History" and "Admin View All"
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const orders = await orderService.getAllOrders(userId, userRole);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};