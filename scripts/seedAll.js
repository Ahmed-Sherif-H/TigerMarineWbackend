/**
 * Complete database seeding - Admin user + Models/Categories import
 * 
 * Usage: node scripts/seedAll.js
 * Or: npm run seed:all
 * 
 * This script:
 * 1. Creates admin user (if doesn't exist)
 * 2. Imports all models and categories from all-models-data.json
 * 
 * Safe to run multiple times - won't create duplicates
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs-extra');
const path = require('path');

const prisma = new PrismaClient();

// Import the importFromJson function logic
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

        // Check if model already exists
        const existingModel = await prisma.model.findUnique({
          where: {
            categoryId_name: {
              categoryId: categoryId,
              name: modelData.name
            }
          }
        });

        if (existingModel) {
          console.log(`⏭️  Model "${modelData.name}" already exists, skipping...`);
          continue;
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
  } catch (error) {
    console.error('❌ Import error:', error);
    throw error;
  }
}

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin user seed...\n');

    // Default admin credentials (CHANGE THESE AFTER FIRST LOGIN!)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tigermarine.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // CHANGE THIS!
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin user with email "${adminEmail}" already exists.`);
      console.log('   Skipping admin creation.\n');
      return;
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed\n');

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName
      }
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📋 Admin Details:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name || 'N/A'}`);
    console.log(`   ID: ${admin.id}\n`);
    console.log('⚠️  IMPORTANT: Change the default password after first login!\n');
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    throw error;
  }
}

async function seedAll() {
  try {
    console.log('🚀 Starting complete database seeding...\n');
    console.log('='.repeat(50));
    console.log('STEP 1: Creating Admin User');
    console.log('='.repeat(50));
    
    // Step 1: Create admin user
    await seedAdmin();
    
    console.log('\n' + '='.repeat(50));
    console.log('STEP 2: Importing Models and Categories');
    console.log('='.repeat(50));
    
    // Step 2: Import models and categories
    const jsonFilePath = path.join(__dirname, '..', 'all-models-data.json');
    
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`❌ File not found: ${jsonFilePath}`);
      console.log('⚠️  Skipping models import. Make sure all-models-data.json exists in the root directory.');
    } else {
      await importFromJson(jsonFilePath);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ Complete seeding finished successfully!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the complete seed
seedAll()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

