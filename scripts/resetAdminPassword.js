/**
 * Reset Admin Password
 * 
 * Usage: node scripts/resetAdminPassword.js
 * 
 * This script resets the admin password to the default or specified password.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...\n');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tigermarine.com';
    // Force use admin123 unless explicitly set
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log(`📧 Admin email: ${adminEmail}`);
    console.log(`🔑 Password to set: ${adminPassword}\n`);

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email: adminEmail }
    });

    if (!admin) {
      console.log(`❌ Admin user with email "${adminEmail}" not found.`);
      console.log('   Run: npm run prisma:seed to create admin user first.');
      process.exit(1);
    }

    console.log(`📧 Found admin: ${admin.email}`);
    console.log(`🆔 Admin ID: ${admin.id}\n`);

    // Hash the new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed\n');

    // Update password
    console.log('💾 Updating password...');
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });

    console.log('✅ Password reset successfully!\n');
    console.log('📋 Admin Details:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   ID: ${admin.id}\n`);
    console.log('⚠️  IMPORTANT: Change the password after first login!\n');

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
resetAdminPassword()
  .then(() => {
    console.log('✨ Password reset completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Password reset failed:', error);
    process.exit(1);
  });
