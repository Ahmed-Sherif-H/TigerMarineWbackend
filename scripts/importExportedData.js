/**
 * Import database from exported JSON format
 * 
 * Usage: node scripts/importExportedData.js <path-to-exported-json>
 * Example: node scripts/importExportedData.js database-export.json
 * 
 * This imports data exported by exportDatabase.js
 * Format: Array of categories, each with nested models
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs-extra');
const path = require('path');

const prisma = new PrismaClient();

async function importExportedData(jsonFilePath) {
  try {
    console.log('🚀 Starting import from exported data...\n');

    // Read JSON file
    const categoriesData = await fs.readJson(jsonFilePath);
    const categories = Array.isArray(categoriesData) ? categoriesData : [categoriesData];

    console.log(`📦 Found ${categories.length} categories to import\n`);

    let categoriesImported = 0;
    let modelsImported = 0;
    let errors = 0;

    for (const categoryData of categories) {
      try {
        // Create or get category
        let category = await prisma.category.findUnique({
          where: { name: categoryData.name }
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: categoryData.name,
              description: categoryData.description || '',
              image: categoryData.image || '',
              heroImage: categoryData.heroImage || '',
              mainGroup: categoryData.mainGroup || 'inflatableBoats',
              order: categoryData.order || 0
            }
          });
          console.log(`✅ Created category: ${category.name}`);
        } else {
          // Update existing category
          category = await prisma.category.update({
            where: { id: category.id },
            data: {
              description: categoryData.description || category.description,
              image: categoryData.image || category.image,
              heroImage: categoryData.heroImage || category.heroImage,
              mainGroup: categoryData.mainGroup || category.mainGroup,
              order: categoryData.order !== undefined ? categoryData.order : category.order
            }
          });
          console.log(`📝 Updated category: ${category.name}`);
        }

        categoriesImported++;

        // Import models for this category
        for (const modelData of categoryData.models || []) {
          try {
        // Check if model exists (using select to avoid missing column issues)
        const existingModel = await prisma.model.findFirst({
          where: {
            categoryId: category.id,
            name: modelData.name
          },
          select: {
            id: true,
            name: true,
            categoryId: true
            // Don't select interiorMainImage - may not exist in database
          }
        });

            if (existingModel) {
              // Update existing model (exclude interiorMainImage if column doesn't exist)
              const updateData = {
                description: modelData.description || '',
                shortDescription: modelData.shortDescription || '',
                imageFile: modelData.imageFile || '',
                heroImageFile: modelData.heroImageFile || '',
                contentImageFile: modelData.contentImageFile || '',
                section2Title: modelData.section2Title || '',
                section2Description: modelData.section2Description || ''
              };
              
              // Only include interiorMainImage if it exists in the database
              // We'll try to update it, but if it fails, we'll skip it
              try {
                await prisma.model.update({
                  where: { id: existingModel.id },
                  data: updateData
                });
              } catch (error) {
                // If update fails due to missing column, try without interiorMainImage
                if (error.message && error.message.includes('interiorMainImage')) {
                  await prisma.model.update({
                    where: { id: existingModel.id },
                    data: updateData
                  });
                } else {
                  throw error;
                }
              }

              // Delete existing related data
              await prisma.spec.deleteMany({ where: { modelId: existingModel.id } });
              await prisma.feature.deleteMany({ where: { modelId: existingModel.id } });
              await prisma.optionalFeature.deleteMany({ where: { modelId: existingModel.id } });
              await prisma.galleryImage.deleteMany({ where: { modelId: existingModel.id } });
              await prisma.interiorFile.deleteMany({ where: { modelId: existingModel.id } });
              // Note: videoFiles already excluded

              // Recreate related data
              await prisma.spec.createMany({
                data: (modelData.specs || []).map(spec => ({
                  modelId: existingModel.id,
                  key: spec.key,
                  value: String(spec.value)
                }))
              });

              await prisma.feature.createMany({
                data: (modelData.features || []).map((feature, index) => ({
                  modelId: existingModel.id,
                  feature: String(feature.feature || feature),
                  order: feature.order !== undefined ? feature.order : index
                }))
              });

              await prisma.optionalFeature.createMany({
                data: (modelData.optionalFeatures || []).map((opt, index) => ({
                  modelId: existingModel.id,
                  name: opt.name || '',
                  description: opt.description || '',
                  category: opt.category || '',
                  price: opt.price || '',
                  order: opt.order !== undefined ? opt.order : index
                }))
              });

              await prisma.galleryImage.createMany({
                data: (modelData.galleryImages || []).map((img, index) => ({
                  modelId: existingModel.id,
                  filename: String(img.filename || img),
                  order: img.order !== undefined ? img.order : index
                }))
              });

              await prisma.interiorFile.createMany({
                data: (modelData.interiorFiles || []).map((int, index) => ({
                  modelId: existingModel.id,
                  filename: String(int.filename || int),
                  order: int.order !== undefined ? int.order : index
                }))
              });

              console.log(`  📝 Updated model: ${modelData.name}`);
            } else {
              // Create new model (exclude interiorMainImage if column doesn't exist)
              const createData = {
                categoryId: category.id,
                name: modelData.name,
                description: modelData.description || '',
                shortDescription: modelData.shortDescription || '',
                imageFile: modelData.imageFile || '',
                heroImageFile: modelData.heroImageFile || '',
                contentImageFile: modelData.contentImageFile || '',
                section2Title: modelData.section2Title || '',
                section2Description: modelData.section2Description || '',
                specs: {
                    create: (modelData.specs || []).map(spec => ({
                      key: spec.key,
                      value: String(spec.value)
                    }))
                  },
                  features: {
                    create: (modelData.features || []).map((feature, index) => ({
                      feature: String(feature.feature || feature),
                      order: feature.order !== undefined ? feature.order : index
                    }))
                  },
                  optionalFeatures: {
                    create: (modelData.optionalFeatures || []).map((opt, index) => ({
                      name: opt.name || '',
                      description: opt.description || '',
                      category: opt.category || '',
                      price: opt.price || '',
                      order: opt.order !== undefined ? opt.order : index
                    }))
                  },
                  galleryImages: {
                    create: (modelData.galleryImages || []).map((img, index) => ({
                      filename: String(img.filename || img),
                      order: img.order !== undefined ? img.order : index
                    }))
                  },
                  interiorFiles: {
                    create: (modelData.interiorFiles || []).map((int, index) => ({
                      filename: String(int.filename || int),
                      order: int.order !== undefined ? int.order : index
                    }))
                  }
                  // videoFiles excluded - will use YouTube links
              };
              
              // Try to create model (skip interiorMainImage if column doesn't exist)
              try {
                await prisma.model.create({ data: createData });
              } catch (error) {
                // If create fails due to missing interiorMainImage column, it shouldn't happen
                // since we're not including it, but handle it just in case
                if (error.message && error.message.includes('interiorMainImage')) {
                  console.warn(`  ⚠️  Warning: interiorMainImage column doesn't exist, skipping...`);
                  await prisma.model.create({ data: createData });
                } else {
                  throw error;
                }
              }

              console.log(`  ✅ Created model: ${modelData.name}`);
            }

            modelsImported++;
          } catch (error) {
            errors++;
            console.error(`  ❌ Error with model ${modelData.name}:`, error.message);
          }
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error with category ${categoryData.name}:`, error.message);
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Categories: ${categoriesImported}`);
    console.log(`   ✅ Models: ${modelsImported}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`\n⚠️  Note: Video files excluded (will use YouTube links)`);

  } catch (error) {
    console.error('❌ Import error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get JSON file path from command line
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.error('❌ Please provide a JSON file path');
  console.log('Usage: node scripts/importExportedData.js <path-to-json-file>');
  console.log('Example: node scripts/importExportedData.js database-export.json');
  process.exit(1);
}

// Try multiple locations
let fullPath;
if (path.isAbsolute(jsonFilePath)) {
  fullPath = jsonFilePath;
} else {
  const backendRoot = path.join(__dirname, '..');
  const rootPath = path.join(backendRoot, jsonFilePath);
  
  if (fs.existsSync(rootPath)) {
    fullPath = rootPath;
  } else {
    fullPath = path.join(__dirname, jsonFilePath);
  }
}

if (!fs.existsSync(fullPath)) {
  console.error(`❌ File not found: ${fullPath}`);
  process.exit(1);
}

// Run import
importExportedData(fullPath)
  .then(() => {
    console.log('\n✅ Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
