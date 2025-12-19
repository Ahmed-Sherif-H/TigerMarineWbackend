/**
 * Direct migration from frontend models.js
 * This script uses Node.js to execute the models.js file and extract data
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs-extra');
const path = require('path');

const prisma = new PrismaClient();

// Path to frontend models.js
const MODELS_JS_PATH = path.join(__dirname, '../../frontend/src/data/models.js');

async function migrateDirect() {
  try {
    console.log('🚀 Starting direct migration from models.js...\n');

    // Read the models.js file
    const fileContent = await fs.readFile(MODELS_JS_PATH, 'utf8');
    
    // Extract categories using regex
    console.log('📖 Extracting categories...\n');
    
    const categoryRegex = /createCategory\(\{[\s\S]*?id:\s*(\d+),[\s\S]*?name:\s*["']([^"']+)["'],[\s\S]*?description:\s*["']([^"']*)["']/g;
    const categories = [];
    let match;
    
    while ((match = categoryRegex.exec(fileContent)) !== null) {
      categories.push({
        id: parseInt(match[1]),
        name: match[2],
        description: match[3] || ''
      });
    }
    
    console.log(`✅ Found ${categories.length} categories\n`);
    
    // Import categories
    for (const cat of categories) {
      try {
        const existing = await prisma.category.findUnique({
          where: { name: cat.name }
        });
        
        if (existing) {
          console.log(`⏭️  Category "${cat.name}" already exists`);
          continue;
        }
        
        const created = await prisma.category.create({
          data: {
            name: cat.name,
            description: cat.description,
            order: cat.id
          }
        });
        
        console.log(`✅ Created category: ${created.name} (ID: ${created.id})`);
      } catch (error) {
        console.error(`❌ Error with category ${cat.name}:`, error.message);
      }
    }
    
    // Get category map
    const dbCategories = await prisma.category.findMany();
    const categoryMap = new Map();
    dbCategories.forEach(c => categoryMap.set(c.name, c.id));
    
    console.log('\n📦 Extracting models...\n');
    console.log('⚠️  Models extraction is complex due to nested structure');
    console.log('💡 Best approach: Export from AdminDashboard, then import JSON\n');
    
    console.log('\n✅ Categories imported successfully!');
    console.log('\n📝 To import models:');
    console.log('1. Go to http://localhost:5173/admin');
    console.log('2. Click "Export All Models"');
    console.log('3. Run: npm run import:json <path-to-file>\n');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

migrateDirect();


