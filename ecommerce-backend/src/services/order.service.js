const prisma = require('../db/prisma');
const orderRepo = require('../repositories/order.repo');
const productRepo = require('../repositories/product.repo');
const cartRepo = require('../repositories/cart.repo');

class OrderService {
  async placeOrder(userId) {
    // START TRANSACTION (ACID Compliance)
    // Increase timeout for Prisma 7 with adapters
    return await prisma.$transaction(async (tx) => {
      
      // 1. Get Cart - MUST use 'tx' inside transaction
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } }
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      let orderTotal = 0;
      const orderItemsData = [];

      // 2. Process Items (Check Stock & Deduct)
      for (const item of cart.items) {
        const product = item.product;

        // Check Stock
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Deduct Stock
        // CRITICAL: Must use 'tx' to rollback if anything fails later
        await productRepo.updateStock(product.id, product.stockQuantity - item.quantity, tx);

        // Snapshot Price (Store price at time of purchase) [cite: 26]
        const itemTotal = Number(product.price) * item.quantity;
        orderTotal += itemTotal;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price 
        });
      }

      // 3. Create Order
      const order = await orderRepo.create({
        userId,
        totalPrice: orderTotal,
        items: orderItemsData
      }, tx);

      // 4. Clear Cart (After successful order) - MUST use 'tx'
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    }, {
      maxWait: 10000, // 10 seconds max wait to acquire transaction
      timeout: 20000, // 20 seconds timeout for transaction
    });
  }

  async getAllOrders(userId, userRole) {
    if (userRole === 'ADMIN') {
      return await orderRepo.findAll();
    } else {
      return await orderRepo.findByUserId(userId);
    }
  }
}

module.exports = new OrderService();