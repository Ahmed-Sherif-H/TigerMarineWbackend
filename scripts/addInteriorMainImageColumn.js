/**
 * Add interiorMainImage column directly to Railway database
 * 
 * Usage: 
 *   1. Set DATABASE_URL to Railway public URL
 *   2. node scripts/addInteriorMainImageColumn.js
 * 
 * Example:
 *   $env:DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway"
 *   node scripts/addInteriorMainImageColumn.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addColumn() {
  try {
    console.log('🔧 Adding interiorMainImage column to Model table...\n');
    
    // Check if column already exists by trying to query it
    try {
      await prisma.$queryRaw`SELECT "interiorMainImage" FROM "Model" LIMIT 1`;
      console.log('✅ Column already exists!');
      return;
    } catch (error) {
      // Column doesn't exist, continue to add it
      if (!error.message.includes('interiorMainImage')) {
        throw error;
      }
    }
    
    // Add the column
    await prisma.$executeRaw`ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "interiorMainImage" TEXT;`;
    console.log('✅ Column added successfully!');
    
    // Verify it was added
    await prisma.$queryRaw`SELECT "interiorMainImage" FROM "Model" LIMIT 1`;
    console.log('✅ Verification: Column exists and is accessible');
    
    console.log('\n📝 Next step: Regenerate Prisma Client');
    console.log('   Run: npx prisma generate');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Can\'t reach database')) {
      console.error('\n💡 Make sure DATABASE_URL is set to Railway public URL');
      console.error('   Example: $env:DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway"');
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addColumn()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
