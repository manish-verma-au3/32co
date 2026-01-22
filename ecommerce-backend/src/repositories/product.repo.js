const prisma = require('../db/prisma');

class ProductRepository {
  async create(data) {
    return await prisma.product.create({ data });
  }

  async update(id, data) {
    return await prisma.product.update({
      where: { id: Number(id) },
      data,
    });
  }

  // Update stock quantity (supports transaction client)
  async updateStock(id, newQuantity, tx = prisma) {
    return await tx.product.update({
      where: { id: Number(id) },
      data: { stockQuantity: newQuantity }
    });
  }

  async delete(id) {
    return await prisma.product.delete({
      where: { id: Number(id) },
    });
  }

  async findById(id) {
    return await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true } // Join with Category table
    });
  }

  // Handles Pagination & Filtering
  async findAll({ skip, take, categoryId, minPrice, maxPrice }) {
    // Build dynamic filter object
    const where = {};

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    // Handle Price Range (min, max, or both)
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice); // Greater than or equal
      if (maxPrice) where.price.lte = Number(maxPrice); // Less than or equal
    }

    // Execute Query
    const products = await prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }, // Newest first
      include: { category: true }
    });

    // Get total count for frontend pagination UI
    const total = await prisma.product.count({ where });

    return { products, total };
  }
}

module.exports = new ProductRepository();