const prisma = require('../db/prisma');

class OrderRepository {
  // Create Order with nested OrderItems
  // Accepts 'tx' (Transaction Client) to ensure it runs inside the transaction
  async create(orderData, tx = prisma) {
    return await tx.order.create({
      data: {
        userId: orderData.userId,
        totalPrice: orderData.totalPrice,
        items: {
          create: orderData.items // [{ productId, quantity, price }, ...]
        }
      },
      include: { items: true } // Return the full order structure
    });
  }

  [cite_start]// Customer: View their own history [cite: 27]
  async findByUserId(userId) {
    return await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  [cite_start]// Admin: View ALL orders [cite: 28]
  async findAll() {
    return await prisma.order.findMany({
      include: { 
        user: { select: { email: true } }, // See who bought it
        items: true 
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = new OrderRepository();