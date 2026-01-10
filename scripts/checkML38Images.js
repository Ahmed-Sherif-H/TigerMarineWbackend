const { prisma } = require('../config/database');

async function checkML38() {
  try {
    const model = await prisma.model.findFirst({
      where: { name: 'ML38' },
      include: {
        galleryImages: { orderBy: { order: 'asc' } }
      }
    });
    
    if (!model) {
      console.log('❌ ML38 model not found');
      return;
    }
    
    console.log(`✅ Model: ${model.name}`);
    console.log(`   Image: ${model.imageFile || 'NULL'}`);
    console.log(`   Hero: ${model.heroImageFile || 'NULL'}`);
    console.log(`   Content: ${model.contentImageFile || 'NULL'}`);
    console.log(`   Gallery images (${model.galleryImages.length}):`);
    model.galleryImages.forEach(img => {
      console.log(`     - ${img.filename}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkML38();

