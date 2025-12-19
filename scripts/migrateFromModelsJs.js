/**
 * Migration script to import data from frontend/models.js to PostgreSQL
 * 
 * This script reads the models.js file and imports all data into the database
 * 
 * Usage: node scripts/migrateFromModelsJs.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs-extra');
const path = require('path');
const vm = require('vm');

const prisma = new PrismaClient();

// Path to frontend models.js
const MODELS_JS_PATH = path.join(__dirname, '../../frontend/src/data/models.js');

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from models.js...\n');

    // Read models.js file
    console.log('📖 Reading models.js file...');
    const fileContent = await fs.readFile(MODELS_JS_PATH, 'utf8');
    
    // Extract categories and models using regex patterns
    console.log('🔍 Parsing models.js data...\n');
    
    // Find all createCategory calls
    const categoryPattern = /createCategory\(\{([^}]+(?:{[^}]*}[^}]*)*)\}\)/g;
    const categories = [];
    let categoryMatch;
    
    while ((categoryMatch = categoryPattern.exec(fileContent)) !== null) {
      const categoryContent = categoryMatch[1];
      
      // Extract category properties
      const idMatch = categoryContent.match(/id:\s*(\d+)/);
      const nameMatch = categoryContent.match(/name:\s*["']([^"']+)["']/);
      const descMatch = categoryContent.match(/description:\s*["']([^"']+)["']/);
      
      if (idMatch && nameMatch) {
        categories.push({
          id: parseInt(idMatch[1]),
          name: nameMatch[1],
          description: descMatch ? descMatch[1] : '',
          order: parseInt(idMatch[1])
        });
      }
    }
    
    console.log(`📦 Found ${categories.length} categories\n`);
    
    // Import categories first
    for (const catData of categories) {
      try {
        // Check if category exists
        const existing = await prisma.category.findUnique({
          where: { name: catData.name }
        });
        
        if (existing) {
          console.log(`⏭️  Category "${catData.name}" already exists, skipping...`);
          continue;
        }
        
        const category = await prisma.category.create({
          data: {
            name: catData.name,
            description: catData.description,
            order: catData.order
          }
        });
        
        console.log(`✅ Created category: ${category.name} (ID: ${category.id})`);
      } catch (error) {
        console.error(`❌ Error creating category ${catData.name}:`, error.message);
      }
    }
    
    // Now we need to parse models - this is more complex
    // We'll use a simpler approach: extract model data from the file
    console.log('\n📦 Extracting models...\n');
    
    // Get all categories from database for mapping
    const dbCategories = await prisma.category.findMany();
    const categoryMap = new Map();
    dbCategories.forEach(cat => categoryMap.set(cat.name, cat.id));
    
    // Find model objects in the file
    // Look for patterns like: { name: "MODELNAME", ... }
    const modelPattern = /\{\s*name:\s*["']([^"']+)["']/g;
    const modelsFound = [];
    let modelMatch;
    
    while ((modelMatch = modelPattern.exec(fileContent)) !== null) {
      const modelName = modelMatch[1];
      if (!modelsFound.includes(modelName)) {
        modelsFound.push(modelName);
      }
    }
    
    console.log(`📋 Found ${modelsFound.length} unique model names in file`);
    console.log('⚠️  Note: Full model parsing requires more complex parsing');
    console.log('💡 Recommendation: Use AdminDashboard to export JSON, then import that\n');
    
    console.log('\n✅ Category migration complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to http://localhost:5173/admin');
    console.log('2. Click "Export All Models" to download JSON');
    console.log('3. Run: npm run import:json <path-to-json-file>');
    console.log('   Example: npm run import:json ../frontend/downloads/all-models-data.json\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Migration error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run migration
migrateData();
