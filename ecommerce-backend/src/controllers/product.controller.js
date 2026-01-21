const productService = require('../services/product.service');

// PUBLIC: List all products with filters
exports.getProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUBLIC: Get single product details
exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// ADMIN ONLY: Create Product
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ADMIN ONLY: Update Product
exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ADMIN ONLY: Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};