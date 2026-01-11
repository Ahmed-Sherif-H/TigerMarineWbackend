/**
 * Export entire database to JSON file
 * 
 * Usage: node scripts/exportDatabase.js [output-file.json]
 * Example: node scripts/exportDatabase.js database-export.json
 * 
 * Exports: Categories, Models, Specs, Features, OptionalFeatures, GalleryImages, InteriorFiles
 * Note: Does NOT export VideoFiles (will be removed), Admin, Inquiries, Events
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs-extra');
const path = require('path');

const prisma = new PrismaClient();

async function exportDatabase(outputFile = 'database-export.json') {
  try {
    console.log('📤 Starting database export...\n');

    // Get all categories
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });

    // Get models for each category separately to avoid missing column issues
    const categoriesWithModels = await Promise.all(
      categories.map(async (category) => {
        // Query models using select to avoid missing columns
        const models = await prisma.model.findMany({
          where: { categoryId: category.id },
          select: {
            id: true,
            name: true,
            description: true,
            shortDescription: true,
            imageFile: true,
            heroImageFile: true,
            contentImageFile: true,
            section2Title: true,
            section2Description: true
            // Note: interiorMainImage excluded - may not exist in local DB
          },
          orderBy: { name: 'asc' }
        });
        
        // Get related data separately for each model
        const modelsWithRelations = await Promise.all(
          models.map(async (model) => {
            const [specs, features, optionalFeatures, galleryImages, interiorFiles] = await Promise.all([
              prisma.spec.findMany({ where: { modelId: model.id } }),
              prisma.feature.findMany({ 
                where: { modelId: model.id },
                orderBy: { order: 'asc' }
              }),
              prisma.optionalFeature.findMany({ 
                where: { modelId: model.id },
                orderBy: { order: 'asc' }
              }),
              prisma.galleryImage.findMany({ 
                where: { modelId: model.id },
                orderBy: { order: 'asc' }
              }),
              prisma.interiorFile.findMany({ 
                where: { modelId: model.id },
                orderBy: { order: 'asc' }
              })
            ]);
            
            return {
              ...model,
              interiorMainImage: null, // Set to null - column may not exist in local DB
              specs,
              features,
              optionalFeatures,
              galleryImages,
              interiorFiles
            };
          })
        );
        
        return { ...category, models: modelsWithRelations };
      })
    );

    console.log(`📦 Found ${categoriesWithModels.length} categories`);
    const totalModels = categoriesWithModels.reduce((sum, cat) => sum + (cat.models?.length || 0), 0);
    console.log(`📦 Found ${totalModels} models\n`);

    // Transform to export format
    const exportData = categoriesWithModels.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      heroImage: category.heroImage,
      mainGroup: category.mainGroup,
      order: category.order,
      models: category.models.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description,
        shortDescription: model.shortDescription,
        imageFile: model.imageFile,
        heroImageFile: model.heroImageFile,
        contentImageFile: model.contentImageFile,
        interiorMainImage: model.interiorMainImage || null, // May not exist in local DB - will be null
        section2Title: model.section2Title,
        section2Description: model.section2Description,
        categoryName: category.name, // Include for import
        specs: model.specs.map(spec => ({
          key: spec.key,
          value: spec.value
        })),
        features: model.features.map(feature => ({
          feature: feature.feature,
          order: feature.order
        })),
        optionalFeatures: model.optionalFeatures.map(opt => ({
          name: opt.name,
          description: opt.description,
          category: opt.category,
          price: opt.price,
          order: opt.order
        })),
        galleryImages: model.galleryImages.map(img => ({
          filename: img.filename,
          order: img.order
        })),
        interiorFiles: model.interiorFiles.map(int => ({
          filename: int.filename,
          order: int.order
        }))
        // videoFiles excluded - will be removed
      }))
    }));

    // Write to file
    const outputPath = path.join(__dirname, '..', outputFile);
    await fs.writeJson(outputPath, exportData, { spaces: 2 });

    console.log(`✅ Database exported successfully!`);
    console.log(`📁 File: ${outputPath}`);
    console.log(`📊 Exported:`);
    console.log(`   - ${categoriesWithModels.length} categories`);
    console.log(`   - ${totalModels} models`);
    
    // Calculate totals safely
    const totalSpecs = categoriesWithModels.reduce((sum, cat) => 
      sum + (cat.models || []).reduce((s, m) => s + (m.specs?.length || 0), 0), 0
    );
    const totalFeatures = categoriesWithModels.reduce((sum, cat) => 
      sum + (cat.models || []).reduce((s, m) => s + (m.features?.length || 0), 0), 0
    );
    const totalGallery = categoriesWithModels.reduce((sum, cat) => 
      sum + (cat.models || []).reduce((s, m) => s + (m.galleryImages?.length || 0), 0), 0
    );
    const totalInterior = categoriesWithModels.reduce((sum, cat) => 
      sum + (cat.models || []).reduce((s, m) => s + (m.interiorFiles?.length || 0), 0), 0
    );
    
    console.log(`   - ${totalSpecs} specs`);
    console.log(`   - ${totalFeatures} features`);
    console.log(`   - ${totalGallery} gallery images`);
    console.log(`   - ${totalInterior} interior images`);
    console.log(`\n⚠️  Note: VideoFiles excluded (will be removed)`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  const outputFile = process.argv[2] || 'database-export.json';
  exportDatabase(outputFile)
    .then(() => {
      console.log('\n✅ Export completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Export failed:', error);
      process.exit(1);
    });
}

module.exports = { exportDatabase };
