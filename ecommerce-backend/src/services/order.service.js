const prisma = require('../db/prisma');
const orderRepo = require('../repositories/order.repo');
const productRepo = require('../repositories/product.repo');
const cartRepo = require('../repositories/cart.repo');

class OrderService {
  async placeOrder(userId) {
    // START TRANSACTION (ACID Compliance)
    return await prisma.$transaction(async (tx) => {
      
      // 1. Get Cart (Using the repo we made earlier)
      // Note: We need to use 'tx' versions if we were locking, 
      // but reading cart is safe here.
      const cart = await prisma.cart.findUnique({
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

        [cite_start]// Check Stock [cite: 25]
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        [cite_start]// Deduct Stock [cite: 25]
        // CRITICAL: Must use 'tx' to rollback if anything fails later
        await productRepo.updateStock(product.id, product.stockQuantity - item.quantity, tx);

        [cite_start]// Snapshot Price (Store price at time of purchase) [cite: 26]
        const itemTotal = Number(product.price) * item.quantity;
        orderTotal += itemTotal;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price 
        });
      }

      [cite_start]// 3. Create Order [cite: 26]
      const order = await orderRepo.create({
        userId,
        totalPrice: orderTotal,
        items: orderItemsData
      }, tx);

      // 4. Clear Cart (After successful order)
      await cartRepo.clearCart(cart.id, tx); // You need to add clearCart to cart.repo.js

      return order;
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