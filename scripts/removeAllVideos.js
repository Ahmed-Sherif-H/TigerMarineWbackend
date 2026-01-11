/**
 * Remove all video file records from the database
 * 
 * Usage: node scripts/removeAllVideos.js
 * 
 * This script:
 * - Deletes all VideoFile records from the database
 * - Does NOT delete actual video files from the filesystem (you'll do that manually)
 * - Safe to run multiple times
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeAllVideos() {
  try {
    console.log('🗑️  Starting removal of all video file records...\n');

    // Count videos before deletion
    const videoCount = await prisma.videoFile.count();
    console.log(`📊 Found ${videoCount} video file record(s) to delete\n`);

    if (videoCount === 0) {
      console.log('✅ No video files found. Nothing to delete.');
      return;
    }

    // Get details about videos (which models they belong to)
    const videos = await prisma.videoFile.findMany({
      include: {
        model: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Group by model for reporting
    const videosByModel = {};
    videos.forEach(video => {
      const modelName = video.model.name;
      if (!videosByModel[modelName]) {
        videosByModel[modelName] = [];
      }
      videosByModel[modelName].push(video.filename);
    });

    console.log('📋 Videos to be deleted by model:');
    Object.keys(videosByModel).forEach(modelName => {
      console.log(`   ${modelName}: ${videosByModel[modelName].length} video(s)`);
      videosByModel[modelName].forEach(filename => {
        console.log(`     - ${filename}`);
      });
    });
    console.log('');

    // Delete all video files
    console.log('🗑️  Deleting all video file records...');
    const result = await prisma.videoFile.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.count} video file record(s)!`);

    // Verify deletion
    const remainingCount = await prisma.videoFile.count();
    if (remainingCount === 0) {
      console.log('\n✅ Verification: All video file records removed successfully!');
    } else {
      console.error(`\n⚠️  Warning: ${remainingCount} video file record(s) still exist.`);
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Manually delete video files from public/images/[ModelName]/ folders');
    console.log('   2. Videos will now be added via YouTube links instead');

  } catch (error) {
    console.error('❌ Error removing video files:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  removeAllVideos()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { removeAllVideos };
