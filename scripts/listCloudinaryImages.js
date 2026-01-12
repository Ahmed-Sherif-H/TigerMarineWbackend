require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function listCloudinaryImages() {
  try {
    console.log('🔍 Listing Cloudinary images...\n');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set');
    console.log('');

    // Check for placeholder values
    if (process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name') {
      console.error('❌ Cloud Name is set to placeholder value!');
      console.error('Please update CLOUDINARY_CLOUD_NAME in your .env file with your actual Cloudinary cloud name.');
      console.error('Get it from: https://console.cloudinary.com/settings/product-environment');
      process.exit(1);
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary credentials not configured!');
      console.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file');
      console.error('\nGet your credentials from:');
      console.error('https://console.cloudinary.com/settings/product-environment');
      process.exit(1);
    }

    // List all resources
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      prefix: '' // Start from root
    });

    console.log(`📊 Found ${result.resources.length} images in Cloudinary\n`);

    // Group by folder (extract from public_id path)
    const folders = {};
    result.resources.forEach(resource => {
      // Extract folder from public_id (e.g., "models/Open850/DJI_0202" -> "models/Open850")
      const publicId = resource.public_id;
      let folder = 'root';
      
      if (publicId.includes('/')) {
        // Get the folder path (everything except the filename)
        const parts = publicId.split('/');
        parts.pop(); // Remove filename
        folder = parts.join('/');
      }
      
      if (!folders[folder]) {
        folders[folder] = [];
      }
      folders[folder].push({
        public_id: resource.public_id,
        url: resource.secure_url,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes,
        created_at: resource.created_at,
        filename: publicId.split('/').pop() // Extract just the filename
      });
    });

    // Display by folder (group by main folder first)
    const mainFolders = {};
    Object.keys(folders).forEach(folder => {
      const mainFolder = folder.split('/')[0] || 'root';
      if (!mainFolders[mainFolder]) {
        mainFolders[mainFolder] = {};
      }
      mainFolders[mainFolder][folder] = folders[folder];
    });

    // Display organized by main folder
    Object.keys(mainFolders).sort().forEach(mainFolder => {
      console.log(`\n📁 ${mainFolder.toUpperCase()}/`);
      Object.keys(mainFolders[mainFolder]).sort().forEach(folder => {
        const subFolder = folder.replace(mainFolder + '/', '') || 'root';
        console.log(`   📂 ${subFolder}/ (${mainFolders[mainFolder][folder].length} images)`);
        mainFolders[mainFolder][folder].forEach(img => {
          console.log(`      - ${img.filename}.${img.format}`);
          console.log(`        URL: ${img.url}`);
          console.log(`        Size: ${(img.bytes / 1024).toFixed(2)} KB, ${img.width}x${img.height}`);
        });
        console.log('');
      });
    });

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Total images: ${result.resources.length}`);
    console.log(`   Main folders: ${Object.keys(mainFolders).length} (${Object.keys(mainFolders).join(', ')})`);
    console.log(`   Total subfolders: ${Object.keys(folders).length}`);
    console.log(`   Total size: ${(result.resources.reduce((sum, r) => sum + r.bytes, 0) / 1024 / 1024).toFixed(2)} MB`);
    
    // Count by main folder
    console.log('\n📈 Images by folder:');
    Object.keys(mainFolders).sort().forEach(mainFolder => {
      const count = Object.values(mainFolders[mainFolder]).reduce((sum, imgs) => sum + imgs.length, 0);
      console.log(`   ${mainFolder}: ${count} images`);
    });

    // Cloudinary Dashboard URL
    console.log('\n🌐 Access Cloudinary Dashboard:');
    console.log(`   https://console.cloudinary.com/console/c/${process.env.CLOUDINARY_CLOUD_NAME}/media_library`);

  } catch (error) {
    console.error('❌ Error listing Cloudinary images:');
    console.error('   Message:', error.message || 'Unknown error');
    console.error('   Error:', error);
    
    if (error.http_code === 401) {
      console.error('\n   🔐 Authentication failed!');
      console.error('   Please check your Cloudinary API credentials in .env file:');
      console.error('   - CLOUDINARY_CLOUD_NAME');
      console.error('   - CLOUDINARY_API_KEY');
      console.error('   - CLOUDINARY_API_SECRET');
    } else if (error.http_code === 404) {
      console.error('\n   📦 Cloud not found!');
      console.error('   Check that CLOUDINARY_CLOUD_NAME is correct.');
    } else if (process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name') {
      console.error('\n   ⚠️  Cloud Name is still set to placeholder!');
      console.error('   Please update CLOUDINARY_CLOUD_NAME in your .env file with your actual Cloudinary cloud name.');
      console.error('   Get it from: https://console.cloudinary.com/settings/product-environment');
    }
    
    if (error.stack && process.env.NODE_ENV !== 'production') {
      console.error('\n   Stack trace:', error.stack);
    }
    
    process.exit(1);
  }
}

listCloudinaryImages();
