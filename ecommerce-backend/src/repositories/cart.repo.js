const prisma = require('../db/prisma');

class CartRepository {
  // Find cart and fetch ALL related product details for calculation
  async findCartByUserId(userId) {
    return await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true // Need price from Product table
          },
          orderBy: { id: 'asc' }
        }
      }
    });
  }

  // Create a cart for the user if it doesn't exist
  async createCart(userId) {
    return await prisma.cart.create({
      data: { userId }
    });
  }

  // Add item or Update quantity if already exists
  async upsertCartItem(cartId, productId, quantity) {
    // Check if item exists in this cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId, productId }
    });

    if (existingItem) {
      // Update quantity
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Create new item
      return await prisma.cartItem.create({
        data: { cartId, productId, quantity }
      });
    }
  }

  async removeItem(cartId, productId) {
    // We use deleteMany to avoid needing the exact CartItem ID from frontend
    // We just need "Remove Product X from Cart Y"
    return await prisma.cartItem.deleteMany({
      where: {
        cartId,
        productId
      }
    });
  }
  
  async clearCart(cartId) {
    return await prisma.cartItem.deleteMany({ where: { cartId } });
  }
}

module.exports = new CartRepository();