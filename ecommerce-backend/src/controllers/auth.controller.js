const authService = require('../services/auth.service');

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Basic Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authService.register(email, password, role);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.json(data);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};