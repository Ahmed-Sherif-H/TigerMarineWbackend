const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return prisma;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, connectDB };


