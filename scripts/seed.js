/**
 * Seed database with initial admin user
 * 
 * Usage: node scripts/seed.js
 * Or: npm run prisma:seed
 * 
 * This script creates a default admin user for accessing the admin panel.
 * Make sure to change the default password after first login!
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

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
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('✨ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });

