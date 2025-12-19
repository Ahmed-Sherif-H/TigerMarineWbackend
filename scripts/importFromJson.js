/**
 * Import models data from JSON file
 * 
 * Usage: node scripts/importFromJson.js <path-to-json-file>
 * Example: node scripts/importFromJson.js exported-models.json
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs-extra');
const path = require('path');

const prisma = new PrismaClient();

async function importFromJson(jsonFilePath) {
  try {
    console.log('🚀 Starting JSON import...\n');

    // Read JSON file
    const jsonData = await fs.readJson(jsonFilePath);
    const models = Array.isArray(jsonData) ? jsonData : [jsonData];

    console.log(`📦 Found ${models.length} model(s) to import\n`);

    // Get or create categories
    const categoryMap = new Map();
    const categories = await prisma.category.findMany();
    categories.forEach(cat => categoryMap.set(cat.name, cat.id));

    let imported = 0;
    let errors = 0;

    for (const modelData of models) {
      try {
        const categoryName = modelData.categoryName || 'Uncategorized';
        let categoryId = categoryMap.get(categoryName);

        // Create category if it doesn't exist
        if (!categoryId) {
          const category = await prisma.category.create({
            data: {
              name: categoryName,
              description: `${categoryName} category`,
              order: categories.length + categoryMap.size
            }
          });
          categoryId = category.id;
          categoryMap.set(categoryName, categoryId);
          console.log(`✅ Created category: ${categoryName}`);
        }

        // Create model
        const model = await prisma.model.create({
          data: {
            categoryId,
            name: modelData.name,
            description: modelData.description || '',
            shortDescription: modelData.shortDescription || '',
            imageFile: modelData.imageFile || '',
            heroImageFile: modelData.heroImageFile || '',
            contentImageFile: modelData.contentImageFile || '',
            section2Title: modelData.section2Title || '',
            section2Description: modelData.section2Description || '',
            specs: {
              create: Object.entries(modelData.specs || {}).map(([key, value]) => ({
                key,
                value: String(value)
              }))
            },
            features: {
              create: (modelData.standardFeatures || []).map((feature, index) => ({
                feature: String(feature),
                order: index
              }))
            },
            optionalFeatures: {
              create: (modelData.optionalFeatures || []).map((opt, index) => ({
                name: typeof opt === 'string' ? opt : (opt.name || ''),
                description: typeof opt === 'object' ? (opt.description || '') : '',
                category: typeof opt === 'object' ? (opt.category || '') : '',
                price: typeof opt === 'object' ? (opt.price || '') : '',
                order: index
              }))
            },
            galleryImages: {
              create: (modelData.galleryFiles || []).map((filename, index) => ({
                filename: String(filename),
                order: index
              }))
            },
            videoFiles: {
              create: (modelData.videoFiles || []).map((filename, index) => ({
                filename: String(filename),
                order: index
              }))
            },
            interiorFiles: {
              create: (modelData.interiorFiles || []).map((filename, index) => ({
                filename: String(filename),
                order: index
              }))
            }
          }
        });

        imported++;
        console.log(`✅ Imported: ${modelData.name}`);
      } catch (error) {
        errors++;
        console.error(`❌ Error importing ${modelData.name}:`, error.message);
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Successfully imported: ${imported}`);
    console.log(`   ❌ Errors: ${errors}`);

    await prisma.$disconnect();
    console.log('\n✅ Import complete!');
  } catch (error) {
    console.error('❌ Import error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Get JSON file path from command line
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.error('❌ Please provide a JSON file path');
  console.log('Usage: node scripts/importFromJson.js <path-to-json-file>');
  console.log('Example: npm run import:json all-models-data.json');
  process.exit(1);
}

// Try multiple locations
let fullPath;
if (path.isAbsolute(jsonFilePath)) {
  fullPath = jsonFilePath;
} else {
  // Try in backend root first
  const backendRoot = path.join(__dirname, '..');
  const rootPath = path.join(backendRoot, jsonFilePath);
  
  if (fs.existsSync(rootPath)) {
    fullPath = rootPath;
  } else {
    // Try relative to scripts folder
    fullPath = path.join(__dirname, jsonFilePath);
  }
}

if (!fs.existsSync(fullPath)) {
  console.error(`❌ File not found: ${fullPath}`);
  console.log('\n💡 Tried locations:');
  console.log(`   1. ${path.join(__dirname, '..', jsonFilePath)}`);
  console.log(`   2. ${path.join(__dirname, jsonFilePath)}`);
  process.exit(1);
}

console.log(`📁 Using file: ${fullPath}\n`);

importFromJson(fullPath);

