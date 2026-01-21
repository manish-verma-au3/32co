const cartService = require('../services/cart.service');

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT
    const cart = await cartService.getCart(userId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/cart
// Body: { "productId": 1, "quantity": 2 }
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'ProductId and quantity required' });
    }

    const cart = await cartService.addToCart(userId, productId, quantity);
    res.json({ message: 'Item added', cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/cart/:productId
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await cartService.removeFromCart(userId, productId);
    res.json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};