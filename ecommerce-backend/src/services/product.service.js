const productRepo = require('../repositories/product.repo');

class ProductService {
  async createProduct(data) {
    // Ensure numeric types are correct
    const formattedData = {
      ...data,
      price: Number(data.price),
      stockQuantity: Number(data.stockQuantity),
      categoryId: Number(data.categoryId)
    };
    return await productRepo.create(formattedData);
  }

  async updateProduct(id, data) {
    // Check if product exists first
    const existing = await productRepo.findById(id);
    if (!existing) throw new Error('Product not found');

    // Format data if present
    const formattedData = {};
    if (data.name) formattedData.name = data.name;
    if (data.description) formattedData.description = data.description;
    if (data.price) formattedData.price = Number(data.price);
    if (data.stockQuantity) formattedData.stockQuantity = Number(data.stockQuantity);
    if (data.categoryId) formattedData.categoryId = Number(data.categoryId);

    return await productRepo.update(id, formattedData);
  }

  async deleteProduct(id) {
    const existing = await productRepo.findById(id);
    if (!existing) throw new Error('Product not found');
    
    return await productRepo.delete(id);
  }

  async getProductById(id) {
    const product = await productRepo.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  }

  async getAllProducts(query) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const { products, total } = await productRepo.findAll({
      skip,
      take: limit,
      categoryId: query.categoryId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice
    });

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new ProductService();