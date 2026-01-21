const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repo');

class AuthService {
  async register(email, password, role = 'CUSTOMER') {
    // 1. Check if user exists
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = await userRepo.create({
      email,
      password: hashedPassword,
      role // 'ADMIN' or 'CUSTOMER'
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email, password) {
    // 1. Find user
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // 3. Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { token, role: user.role };
  }
}

module.exports = new AuthService();