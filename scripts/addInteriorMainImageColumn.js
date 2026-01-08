/**
 * Add interiorMainImage column to Model table
 * Run this script to manually add the column if migration didn't work
 */

const { prisma } = require('../config/database');

async function addInteriorMainImageColumn() {
  try {
    console.log('🔧 Adding interiorMainImage column to Model table...');
    
    // Use raw SQL to add the column
    await prisma.$executeRaw`
      ALTER TABLE "Model" 
      ADD COLUMN IF NOT EXISTS "interiorMainImage" TEXT;
    `;
    
    console.log('✅ Column added successfully!');
    
    // Verify the column exists
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Model' AND column_name = 'interiorMainImage';
    `;
    
    if (result && result.length > 0) {
      console.log('✅ Verified: interiorMainImage column exists in database');
      console.log(`   Column type: ${result[0].data_type}`);
    } else {
      console.log('⚠️  Warning: Column might not have been added');
    }
    
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addInteriorMainImageColumn();

