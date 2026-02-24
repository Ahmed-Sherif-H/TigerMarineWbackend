const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Migration script to import dealers data into the database
 * 
 * Usage:
 * 1. Create a dealers.json file with your dealers data
 * 2. Run: node scripts/migrateDealers.js
 * 
 * Expected JSON format:
 * [
 *   {
 *     "company": "Donar Boats",
 *     "country": "Croatia",
 *     "address": "Riva 1, 52100 Pula, Croatia",
 *     "telephone": "+385 98 802 328",
 *     "fax": "+385 52 350 822",
 *     "email": "donarboats@gmail.com",
 *     "website": "http://www.donarboats.hr/hr"
 *   },
 *   ...
 * ]
 */

async function migrateDealers() {
  try {
    console.log('🔄 Starting dealers migration...\n');

    // Option 1: Load from JSON file
    let dealersData = [];
    try {
      const fs = require('fs');
      const path = require('path');
      const dealersFile = path.join(__dirname, 'dealers.json');
      
      if (fs.existsSync(dealersFile)) {
        const fileContent = fs.readFileSync(dealersFile, 'utf8');
        dealersData = JSON.parse(fileContent);
        console.log(`📄 Loaded ${dealersData.length} dealers from dealers.json\n`);
      } else {
        console.log('⚠️  dealers.json not found. Using sample data or you can pass data directly.\n');
        console.log('💡 To migrate your dealers:');
        console.log('   1. Create a dealers.json file in the scripts/ folder');
        console.log('   2. Add your dealers data in JSON format');
        console.log('   3. Run this script again\n');
        
        // You can also hardcode dealers here if needed
        // dealersData = [
        //   {
        //     company: "Donar Boats",
        //     country: "Croatia",
        //     address: "Riva 1, 52100 Pula, Croatia",
        //     telephone: "+385 98 802 328",
        //     fax: "+385 52 350 822",
        //     email: "donarboats@gmail.com",
        //     website: "http://www.donarboats.hr/hr"
        //   }
        // ];
      }
    } catch (error) {
      console.error('❌ Error reading dealers.json:', error.message);
      console.log('\n💡 You can also pass dealers data directly in this script.\n');
    }

    if (dealersData.length === 0) {
      console.log('⚠️  No dealers data to migrate. Exiting...');
      return;
    }

    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Import each dealer
    for (const dealer of dealersData) {
      try {
        // Validate required fields
        if (!dealer.company || !dealer.country) {
          console.log(`⚠️  Skipping dealer: Missing company or country`);
          console.log(`   Data:`, dealer);
          skipped++;
          continue;
        }

        // Check if dealer already exists (by company and country)
        const existing = await prisma.dealer.findFirst({
          where: {
            company: dealer.company.trim(),
            country: dealer.country.trim()
          }
        });

        if (existing) {
          console.log(`⏭️  Skipping: ${dealer.company} (${dealer.country}) - already exists`);
          skipped++;
          continue;
        }

        // Create dealer
        const createdDealer = await prisma.dealer.create({
          data: {
            company: dealer.company.trim(),
            country: dealer.country.trim(),
            address: dealer.address?.trim() || null,
            telephone: dealer.telephone?.trim() || null,
            fax: dealer.fax?.trim() || null,
            email: dealer.email?.trim() || null,
            website: dealer.website?.trim() || null
          }
        });

        console.log(`✅ Created: ${createdDealer.company} (${createdDealer.country})`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating dealer ${dealer.company}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total: ${dealersData.length}\n`);

    // Show current count
    const totalCount = await prisma.dealer.count();
    console.log(`📈 Total dealers in database: ${totalCount}\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateDealers()
    .then(() => {
      console.log('✅ Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration error:', error);
      process.exit(1);
    });
}

module.exports = { migrateDealers };
