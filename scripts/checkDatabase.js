/**
 * Check Database Population
 * Verifies if models have image filenames in the database
 */

const { prisma } = require('../config/database');

async function checkDatabase() {
  console.log('🔍 Checking database population...\n');
  
  try {
    // Get all models
    const models = await prisma.model.findMany({
      include: {
        galleryImages: true,
        interiorFiles: true,
        videoFiles: true,
        category: true
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`📊 Total models: ${models.length}\n`);
    
    let modelsWithImages = 0;
    let modelsWithoutImages = 0;
    let totalGalleryImages = 0;
    let totalInteriorImages = 0;
    let totalVideos = 0;
    
    models.forEach(model => {
      const hasMainImage = !!(model.imageFile || model.heroImageFile || model.contentImageFile);
      const hasGallery = model.galleryImages.length > 0;
      const hasInterior = model.interiorFiles.length > 0;
      const hasVideos = model.videoFiles.length > 0;
      
      const hasAnyImages = hasMainImage || hasGallery || hasInterior || hasVideos;
      
      if (hasAnyImages) {
        modelsWithImages++;
        console.log(`✅ ${model.name} (${model.category?.name || 'No category'})`);
        if (model.imageFile) console.log(`   - Image: ${model.imageFile}`);
        if (model.heroImageFile) console.log(`   - Hero: ${model.heroImageFile}`);
        if (model.contentImageFile) console.log(`   - Content: ${model.contentImageFile}`);
        if (hasGallery) console.log(`   - Gallery: ${model.galleryImages.length} images`);
        if (hasInterior) console.log(`   - Interior: ${model.interiorFiles.length} images`);
        if (hasVideos) console.log(`   - Videos: ${model.videoFiles.length} files`);
      } else {
        modelsWithoutImages++;
        console.log(`❌ ${model.name} (${model.category?.name || 'No category'}) - NO IMAGES`);
      }
      
      totalGalleryImages += model.galleryImages.length;
      totalInteriorImages += model.interiorFiles.length;
      totalVideos += model.videoFiles.length;
    });
    
    console.log('\n📈 Summary:');
    console.log(`   Models with images: ${modelsWithImages}`);
    console.log(`   Models without images: ${modelsWithoutImages}`);
    console.log(`   Total gallery images: ${totalGalleryImages}`);
    console.log(`   Total interior images: ${totalInteriorImages}`);
    console.log(`   Total videos: ${totalVideos}`);
    
    if (modelsWithoutImages > 0) {
      console.log('\n⚠️  WARNING: Some models have no images in database!');
      console.log('   Use Admin Dashboard to upload images or run populate:images script');
    }
    
    // Check categories
    const categories = await prisma.category.findMany();
    console.log(`\n📁 Categories: ${categories.length}`);
    categories.forEach(cat => {
      const hasImage = !!(cat.image || cat.heroImage);
      console.log(`   ${hasImage ? '✅' : '❌'} ${cat.name}${hasImage ? '' : ' - NO IMAGES'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

