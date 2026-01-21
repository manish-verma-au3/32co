const prisma = require('../db/prisma');

class UserRepository {
  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async create(userData) {
    // userData = { email, password, role }
    return await prisma.user.create({ data: userData });
  }

  async findById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }
}

module.exports = new UserRepository();