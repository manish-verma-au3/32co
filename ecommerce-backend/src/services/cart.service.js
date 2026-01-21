const cartRepo = require('../repositories/cart.repo');
const productRepo = require('../repositories/product.repo'); // To validate product exists

class CartService {
  async getCart(userId) {
    let cart = await cartRepo.findCartByUserId(userId);

    // If no cart exists, return empty structure (don't throw error)
    if (!cart) {
      return { items: [], totalPrice: 0 };
    }

    // CALCULATE TOTALS [Source: 21]
    let totalPrice = 0;

    const itemsWithSubtotal = cart.items.map(item => {
      const price = Number(item.product.price);
      const subtotal = price * item.quantity;
      
      totalPrice += subtotal;

      return {
        productId: item.productId,
        name: item.product.name,
        price: price,
        quantity: item.quantity,
        subtotal: subtotal 
      };
    });

    return {
      cartId: cart.id,
      items: itemsWithSubtotal,
      totalPrice: totalPrice
    };
  }

  async addToCart(userId, productId, quantity) {
    // 1. Validate inputs
    if (quantity <= 0) throw new Error('Quantity must be greater than 0');
    
    // 2. Validate Product exists & has stock
    const product = await productRepo.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.stockQuantity < quantity) throw new Error('Insufficient stock');

    // 3. Ensure User has a Cart
    let cart = await cartRepo.findCartByUserId(userId);
    if (!cart) {
      cart = await cartRepo.createCart(userId);
    }

    // 4. Add/Update Item
    await cartRepo.upsertCartItem(cart.id, productId, quantity);

    // 5. Return updated cart
    return await this.getCart(userId);
  }

  async removeFromCart(userId, productId) {
    const cart = await cartRepo.findCartByUserId(userId);
    if (!cart) throw new Error('Cart not found');

    await cartRepo.removeItem(cart.id, Number(productId));

    return await this.getCart(userId);
  }
}

module.exports = new CartService();