/**
 * Script to add mainGroup field to existing categories
 * Run this after updating the Prisma schema
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMainGroupToCategories() {
  try {
    console.log('Adding mainGroup field to categories...');
    
    // Get all categories
    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} categories`);
    
    // Update each category
    for (const category of categories) {
      // Determine mainGroup based on category name
      // Infinity should be "boats", everything else defaults to "inflatableBoats"
      let mainGroup = 'inflatableBoats';
      if (category.name.toLowerCase().includes('infinity')) {
        mainGroup = 'boats';
      }
      
      await prisma.category.update({
        where: { id: category.id },
        data: { mainGroup }
      });
      
      console.log(`Updated ${category.name}: mainGroup = ${mainGroup}`);
    }
    
    console.log('✅ Successfully added mainGroup to all categories!');
  } catch (error) {
    console.error('❌ Error adding mainGroup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addMainGroupToCategories();

