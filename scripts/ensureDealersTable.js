const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function ensureDealersTable() {
  try {
    // Try to query the table to see if it exists
    const count = await prisma.dealer.count();
    console.log(`✅ Dealers table exists! Current count: ${count}`);
  } catch (error) {
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      console.log('⚠️  Dealers table does not exist. Creating it...');
      console.log('Please run: npx prisma migrate deploy');
      console.log('Or manually execute the SQL from prisma/migrations/20260224232921_add_dealers_table/migration.sql');
    } else {
      console.error('Error checking dealers table:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

ensureDealersTable();
