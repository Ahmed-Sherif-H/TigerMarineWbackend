# Seed Railway Database with Admin User
# Usage: .\seed-railway.ps1 -DatabaseUrl "your-public-database-url"

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl
)

Write-Host "🔧 Seeding Railway Database" -ForegroundColor Cyan
Write-Host ""

# Set the DATABASE_URL
$env:DATABASE_URL = $DatabaseUrl

Write-Host "✅ DATABASE_URL set" -ForegroundColor Green
Write-Host ""

# Verify it's set
if ($env:DATABASE_URL -like "*railway*" -or $env:DATABASE_URL -like "*rlwy.net*") {
    Write-Host "📡 Database URL looks correct (contains 'railway' or 'rlwy.net')" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Database URL doesn't look like a Railway URL" -ForegroundColor Yellow
    Write-Host "   Make sure you're using the PUBLIC database URL, not the internal one" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Running seed script..." -ForegroundColor Yellow
Write-Host ""

# Run the seed script
npm run prisma:seed

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Default credentials:" -ForegroundColor Cyan
    Write-Host "  Email: admin@tigermarine.com" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Change the password after first login!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Now you can test login:" -ForegroundColor Cyan
    Write-Host '  .\test-login.ps1 -Url "https://tigermarinewbackend-production.up.railway.app"' -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Failed to create admin user" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify DATABASE_URL is correct (public URL, not internal)" -ForegroundColor White
    Write-Host "  2. Check if database is accessible" -ForegroundColor White
    Write-Host "  3. Make sure migrations are run on Railway first" -ForegroundColor White
}
