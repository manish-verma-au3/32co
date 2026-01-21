// Shared Prisma Client instance
// Load environment variables first
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Initialize PostgreSQL adapter for Prisma 7
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('WARNING: DATABASE_URL environment variable is not set');
  // Don't throw - let the app start, errors will occur when DB is accessed
}

let prisma;
try {
  if (connectionString) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    // Fallback: try without adapter (will fail if Prisma 7 requires it)
    prisma = new PrismaClient();
  }
} catch (error) {
  console.error('Error initializing Prisma Client:', error.message);
  // Create a mock client that will throw errors on use
  prisma = {
    $connect: () => Promise.reject(new Error('Prisma Client not initialized')),
    $disconnect: () => Promise.resolve(),
  };
}

module.exports = prisma;
