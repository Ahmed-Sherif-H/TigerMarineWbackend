require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTable() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Try to access the dealer model
    const count = await prisma.dealer.count();
    console.log(`✅ Dealer table exists! Current count: ${count}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('does not exist') || error.code === 'P2021') {
      console.log('\n💡 The Dealer table does not exist yet.');
      console.log('   Run: npx prisma migrate deploy');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkTable();
