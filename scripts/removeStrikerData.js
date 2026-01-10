require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeStrikerData() {
  try {
    console.log('🗑️  Starting removal of Striker data...\n');

    // Step 1: Find the Striker category
    const strikerCategory = await prisma.category.findUnique({
      where: { name: 'Striker' },
      include: {
        models: {
          include: {
            _count: {
              select: {
                specs: true,
                features: true,
                optionalFeatures: true,
                galleryImages: true,
                videoFiles: true,
                interiorFiles: true
              }
            }
          }
        }
      }
    });

    if (!strikerCategory) {
      console.log('ℹ️  No Striker category found. Nothing to remove.\n');
      return;
    }

    console.log(`📋 Found Striker category (ID: ${strikerCategory.id})`);
    console.log(`   Models in category: ${strikerCategory.models.length}`);

    // Step 2: Show what will be deleted
    let totalRelatedData = 0;
    strikerCategory.models.forEach(model => {
      const count = model._count;
      const modelTotal = count.specs + count.features + count.optionalFeatures + 
                        count.galleryImages + count.videoFiles + count.interiorFiles;
      totalRelatedData += modelTotal;
      console.log(`   - Model "${model.name}" (ID: ${model.id}):`);
      console.log(`     Specs: ${count.specs}, Features: ${count.features}, Optional Features: ${count.optionalFeatures}`);
      console.log(`     Gallery Images: ${count.galleryImages}, Videos: ${count.videoFiles}, Interior Files: ${count.interiorFiles}`);
    });

    console.log(`\n📊 Total related data to be deleted: ${totalRelatedData} records`);

    // Step 3: Delete the category (this will cascade delete all models and their related data)
    console.log('\n🗑️  Deleting Striker category and all related data...');
    
    await prisma.category.delete({
      where: { id: strikerCategory.id }
    });

    console.log('✅ Striker category and all related data deleted successfully!\n');

    // Step 4: Verify deletion
    const verifyCategory = await prisma.category.findUnique({
      where: { name: 'Striker' }
    });

    const verifyModels = await prisma.model.findMany({
      where: {
        name: {
          contains: 'Striker',
          mode: 'insensitive'
        }
      }
    });

    if (!verifyCategory && verifyModels.length === 0) {
      console.log('✅ Verification: All Striker data removed successfully!');
    } else {
      console.log('⚠️  Warning: Some Striker data may still exist');
      if (verifyCategory) {
        console.log(`   Category still exists: ${verifyCategory.name}`);
      }
      if (verifyModels.length > 0) {
        console.log(`   Models still exist: ${verifyModels.map(m => m.name).join(', ')}`);
      }
    }

    console.log('\n✨ Striker data removal completed!');

  } catch (error) {
    console.error('❌ Error removing Striker data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
removeStrikerData()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

