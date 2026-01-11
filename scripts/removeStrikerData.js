/**
 * Remove all Striker-related data from the database
 * 
 * Usage: node scripts/removeStrikerData.js
 * Or: npm run remove:striker
 * 
 * This script:
 * - Deletes all Striker models and their related data
 * - Deletes the Striker category
 * - Safe to run multiple times
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeStrikerData() {
  try {
    console.log('🗑️  Starting removal of Striker data...\n');

    // Find Striker category
    const strikerCategory = await prisma.category.findFirst({
      where: { 
        name: { 
          contains: 'Striker', 
          mode: 'insensitive' 
        } 
      },
      include: {
        models: {
          include: {
            specs: true,
            features: true,
            optionalFeatures: true,
            galleryImages: true,
            videoFiles: true,
            interiorFiles: true,
          },
        },
      },
    });

    if (!strikerCategory) {
      console.log('✅ No Striker category found. Nothing to remove.');
      return;
    }

    console.log(`📋 Found Striker category: "${strikerCategory.name}" (ID: ${strikerCategory.id})`);
    console.log(`   Models in category: ${strikerCategory.models.length}\n`);

    // Count related records
    let totalRelatedRecords = 0;
    for (const model of strikerCategory.models) {
      const modelRecords = 
        model.specs.length + 
        model.features.length + 
        model.optionalFeatures.length + 
        model.galleryImages.length + 
        model.videoFiles.length + 
        model.interiorFiles.length;
      
      console.log(`   Model "${model.name}" (ID: ${model.id}):`);
      console.log(`     - Specs: ${model.specs.length}`);
      console.log(`     - Features: ${model.features.length}`);
      console.log(`     - Optional Features: ${model.optionalFeatures.length}`);
      console.log(`     - Gallery Images: ${model.galleryImages.length}`);
      console.log(`     - Video Files: ${model.videoFiles.length}`);
      console.log(`     - Interior Files: ${model.interiorFiles.length}`);
      
      totalRelatedRecords += modelRecords;
    }

    console.log(`\n📊 Total related records to be deleted: ${totalRelatedRecords}`);
    console.log(`\n🗑️  Deleting Striker category and all related data...\n`);

    // Delete the category (this will cascade delete all models and their related data)
    await prisma.category.delete({
      where: { id: strikerCategory.id },
    });

    console.log('✅ Striker category and all related data deleted successfully!');

    // Verify deletion
    const remainingStrikerCategory = await prisma.category.findFirst({
      where: { 
        name: { 
          contains: 'Striker', 
          mode: 'insensitive' 
        } 
      },
    });

    const remainingStrikerModels = await prisma.model.findMany({
      where: {
        name: {
          contains: 'Striker',
          mode: 'insensitive'
        }
      }
    });

    if (!remainingStrikerCategory && remainingStrikerModels.length === 0) {
      console.log('\n✅ Verification: All Striker data removed successfully!');
    } else {
      console.warn('\n⚠️  Warning: Some Striker data may still exist.');
      if (remainingStrikerCategory) {
        console.warn(`   Category still exists: ${remainingStrikerCategory.name}`);
      }
      if (remainingStrikerModels.length > 0) {
        console.warn(`   ${remainingStrikerModels.length} model(s) still exist`);
      }
    }

    console.log('\n📝 Note: Striker image/video files in public/images/ folders');
    console.log('   need to be deleted manually from the filesystem.');

  } catch (error) {
    console.error('❌ Error removing Striker data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  removeStrikerData()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { removeStrikerData };
