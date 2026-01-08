/**
 * Manually create Event table in database
 * Run: node scripts/createEventTable.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createEventTable() {
  try {
    console.log('Creating Event table...\n');

    // Check if table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('Event', 'event')
    `;
    
    console.log('Existing event tables:', tables);

    // Create Event table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Event" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3),
        "description" TEXT,
        "image" TEXT,
        "website" TEXT,
        "status" TEXT NOT NULL DEFAULT 'upcoming',
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
      )
    `;

    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Event_status_idx" ON "Event"("status")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Event_startDate_idx" ON "Event"("startDate")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Event_order_idx" ON "Event"("order")`;

    console.log('✅ Event table created successfully!\n');

    // Verify
    const eventTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'Event'
    `;
    
    console.log('Verification - Event tables:', eventTables);
    console.log('\n✅ Now run: npx prisma generate');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createEventTable();
