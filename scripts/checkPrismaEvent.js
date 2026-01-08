/**
 * Check if Prisma Client has Event model
 * Run: node scripts/checkPrismaEvent.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('Checking Prisma Client for Event model...\n');

// Check if event model exists
const hasEvent = typeof prisma.event !== 'undefined';
console.log(`Event model available: ${hasEvent ? '✅ YES' : '❌ NO'}`);

if (!hasEvent) {
  console.log('\nAvailable models:');
  const models = Object.keys(prisma).filter(k => 
    !k.startsWith('$') && 
    !k.startsWith('_') && 
    typeof prisma[k] === 'object' &&
    prisma[k] !== null
  );
  models.forEach(model => {
    console.log(`  - ${model}`);
  });
  
  console.log('\n❌ Event model is missing!');
  console.log('\nTo fix:');
  console.log('1. Stop the backend server (Ctrl+C)');
  console.log('2. Run: npx prisma generate');
  console.log('3. Restart the server: npm run dev');
} else {
  console.log('\n✅ Event model is available!');
  console.log('Event model methods:', Object.keys(prisma.event).slice(0, 5).join(', '), '...');
}

prisma.$disconnect();

