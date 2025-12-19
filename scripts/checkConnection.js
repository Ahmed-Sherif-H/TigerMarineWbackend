// Quick script to test database connection
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    console.log('📡 DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    // Try to connect
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful!');
    console.log('📊 Result:', result);
    
    await prisma.$disconnect();
    console.log('✅ Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check DATABASE_URL in .env file');
    console.log('3. Verify database "tigermarine" exists');
    console.log('4. Check username and password are correct');
    process.exit(1);
  }
}

testConnection();


