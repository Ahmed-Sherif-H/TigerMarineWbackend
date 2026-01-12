# Check if Admin User Exists in Railway Database
# Usage: .\check-admin-railway.ps1 -DatabaseUrl "your-public-database-url"

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl
)

Write-Host "🔍 Checking Admin User in Railway Database" -ForegroundColor Cyan
Write-Host ""

# Set the DATABASE_URL
$env:DATABASE_URL = $DatabaseUrl

Write-Host "✅ DATABASE_URL set" -ForegroundColor Green
Write-Host ""

# Create a temporary script to check admin
$checkScript = @"
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Checking for admin users...\n');
    
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in database!');
      console.log('   You need to run: npm run prisma:seed');
      process.exit(1);
    } else {
      console.log(\`✅ Found \${admins.length} admin user(s):\n\`);
      admins.forEach(admin => {
        console.log(\`   ID: \${admin.id}\`);
        console.log(\`   Email: \${admin.email}\`);
        console.log(\`   Name: \${admin.name || 'N/A'}\`);
        console.log(\`   Created: \${admin.createdAt}\`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error checking admin:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

checkAdmin();
"@

# Write temporary script
$checkScript | Out-File -FilePath "temp-check-admin.js" -Encoding UTF8

Write-Host "Running check script..." -ForegroundColor Yellow
Write-Host ""

# Run the check script
node temp-check-admin.js

# Clean up
Remove-Item "temp-check-admin.js" -ErrorAction SilentlyContinue
