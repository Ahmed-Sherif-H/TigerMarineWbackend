const { prisma } = require('../config/database');
const fs = require('fs-extra');
const path = require('path');

// Map model names to folder names
const modelFolderMap = {
  'TL950': 'TopLine950',
  'TL850': 'TopLine850',
  'TL750': 'TopLine750',
  'TL650': 'TopLine650',
  'PL620': 'ProLine620',
  'PL550': 'ProLine550',
  'SL520': 'SportLine520',
  'SL480': 'SportLine480',
  'OP850': 'Open850',
  'OP750': 'Open750',
  'OP650': 'Open650',
  'ML38': 'MaxLine 38',
  'Infinity 280': 'Infinity 280'
};

// Get folder name for model
function getModelFolder(modelName) {
  return modelFolderMap[modelName] || modelName;
}

// Get image files from folder
function getImageFiles(folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.log(`  ⚠️  Folder not found: ${folderPath}`);
    return [];
  }

  const files = fs.readdirSync(folderPath)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    })
    .sort(); // Sort alphabetically

  return files;
}

// Get video files from folder
function getVideoFiles(folderPath) {
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const files = fs.readdirSync(folderPath)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.webm'].includes(ext);
    })
    .sort();

  return files;
}

// Get interior images from Interior subfolder
function getInteriorFiles(folderPath) {
  const interiorPath = path.join(folderPath, 'Interior');
  if (!fs.existsSync(interiorPath)) {
    return [];
  }

  const files = fs.readdirSync(interiorPath)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    })
    .sort();

  return files;
}

async function populateImageFilenames() {
  try {
    console.log('🔄 Starting to populate image filenames...\n');

    const imagesBasePath = path.join(__dirname, '../public/images');
    
    // Get all models
    const models = await prisma.model.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${models.length} models to process\n`);

    let updated = 0;
    let skipped = 0;

    for (const model of models) {
      console.log(`📦 Processing: ${model.name}`);
      
      const folderName = getModelFolder(model.name);
      const modelFolderPath = path.join(imagesBasePath, folderName);

      // Get all image files
      const imageFiles = getImageFiles(modelFolderPath);
      const videoFiles = getVideoFiles(modelFolderPath);
      const interiorFiles = getInteriorFiles(modelFolderPath);

      if (imageFiles.length === 0) {
        console.log(`  ⚠️  No images found in ${folderName}`);
        skipped++;
        continue;
      }

      // Use first image as default for imageFile and heroImageFile
      const firstImage = imageFiles[0];
      const secondImage = imageFiles[1] || firstImage; // Use first if only one exists
      const thirdImage = imageFiles[2] || firstImage; // Use first if less than 3

      // Prepare update data
      const updateData = {
        imageFile: firstImage,
        heroImageFile: firstImage, // Can be changed later if needed
        contentImageFile: secondImage, // Use second image for content
      };

      // Update gallery images
      if (imageFiles.length > 0) {
        // Delete existing gallery images
        await prisma.galleryImage.deleteMany({
          where: { modelId: model.id }
        });

        // Create new gallery images
        await prisma.galleryImage.createMany({
          data: imageFiles.map((filename, index) => ({
            modelId: model.id,
            filename: filename,
            order: index
          }))
        });
        updateData.galleryFiles = imageFiles; // For logging
      }

      // Update video files
      if (videoFiles.length > 0) {
        // Delete existing video files
        await prisma.videoFile.deleteMany({
          where: { modelId: model.id }
        });

        // Create new video files
        await prisma.videoFile.createMany({
          data: videoFiles.map((filename, index) => ({
            modelId: model.id,
            filename: filename,
            order: index
          }))
        });
        updateData.videoFiles = videoFiles; // For logging
      }

      // Update interior files
      if (interiorFiles.length > 0) {
        // Delete existing interior files
        await prisma.interiorFile.deleteMany({
          where: { modelId: model.id }
        });

        // Create new interior files
        await prisma.interiorFile.createMany({
          data: interiorFiles.map((filename, index) => ({
            modelId: model.id,
            filename: filename,
            order: index
          }))
        });
        updateData.interiorFiles = interiorFiles; // For logging
      }

      // Update model with image filenames
      await prisma.model.update({
        where: { id: model.id },
        data: {
          imageFile: updateData.imageFile,
          heroImageFile: updateData.heroImageFile,
          contentImageFile: updateData.contentImageFile
        }
      });

      console.log(`  ✅ Updated:`);
      console.log(`     - Main Image: ${updateData.imageFile}`);
      console.log(`     - Hero Image: ${updateData.heroImageFile}`);
      console.log(`     - Content Image: ${updateData.contentImageFile}`);
      console.log(`     - Gallery Images: ${imageFiles.length} files`);
      console.log(`     - Video Files: ${videoFiles.length} files`);
      console.log(`     - Interior Images: ${interiorFiles.length} files`);
      console.log('');

      updated++;
    }

    console.log('\n✨ Population complete!');
    console.log(`   ✅ Updated: ${updated} models`);
    console.log(`   ⚠️  Skipped: ${skipped} models (no images found)`);

  } catch (error) {
    console.error('❌ Error populating image filenames:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  populateImageFilenames()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populateImageFilenames };


