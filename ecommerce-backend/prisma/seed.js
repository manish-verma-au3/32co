// Seed script to populate database with sample data
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv/config');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  });

  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: { name: 'Clothing' },
  });

  const books = await prisma.category.upsert({
    where: { name: 'Books' },
    update: {},
    create: { name: 'Books' },
  });

  console.log('✓ Categories created');

  // Create products
  const products = [
    {
      name: 'Laptop',
      description: 'High-performance laptop for work and gaming',
      price: 1299.99,
      stockQuantity: 50,
      categoryId: electronics.id,
    },
    {
      name: 'Smartphone',
      description: 'Latest smartphone with advanced features',
      price: 899.99,
      stockQuantity: 100,
      categoryId: electronics.id,
    },
    {
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling headphones',
      price: 249.99,
      stockQuantity: 75,
      categoryId: electronics.id,
    },
    {
      name: 'T-Shirt',
      description: 'Comfortable cotton t-shirt',
      price: 19.99,
      stockQuantity: 200,
      categoryId: clothing.id,
    },
    {
      name: 'Jeans',
      description: 'Classic denim jeans',
      price: 49.99,
      stockQuantity: 150,
      categoryId: clothing.id,
    },
    {
      name: 'JavaScript: The Definitive Guide',
      description: 'Comprehensive guide to JavaScript programming',
      price: 59.99,
      stockQuantity: 30,
      categoryId: books.id,
    },
    {
      name: 'Clean Code',
      description: 'A Handbook of Agile Software Craftsmanship',
      price: 44.99,
      stockQuantity: 25,
      categoryId: books.id,
    },
  ];

  for (const product of products) {
    // Check if product already exists
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    
    if (!existing) {
      await prisma.product.create({ data: product });
    } else {
      console.log(`  - Product "${product.name}" already exists, skipping...`);
    }
  }

  console.log(`✓ Created ${products.length} products`);

  // Create an admin user (password: admin123 - hash this in production!)
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Created admin user (admin@example.com / admin123)');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
