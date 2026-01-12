# Create Admin User on Railway Database
# Usage: .\create-admin-railway.ps1

Write-Host "🔧 Creating Admin User on Railway" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue

if ($railwayInstalled) {
    Write-Host "✅ Railway CLI found" -ForegroundColor Green
    Write-Host ""
    Write-Host "Running seed script on Railway..." -ForegroundColor Yellow
    Write-Host ""
    
    railway run npm run prisma:seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Default credentials:" -ForegroundColor Cyan
        Write-Host "  Email: admin@tigermarine.com" -ForegroundColor White
        Write-Host "  Password: admin123" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Change the password after first login!" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "❌ Failed to create admin user" -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternative: Set DATABASE_URL and run locally" -ForegroundColor Yellow
        Write-Host '  $env:DATABASE_URL="your-railway-database-url"' -ForegroundColor Gray
        Write-Host "  npm run prisma:seed" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Railway CLI not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1: Install Railway CLI" -ForegroundColor Yellow
    Write-Host "  npm i -g @railway/cli" -ForegroundColor Gray
    Write-Host "  railway login" -ForegroundColor Gray
    Write-Host "  railway link" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2: Use Railway DATABASE_URL locally" -ForegroundColor Yellow
    Write-Host "  1. Get DATABASE_URL from Railway dashboard" -ForegroundColor White
    Write-Host "  2. Set it:" -ForegroundColor White
    Write-Host '     $env:DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:port/railway"' -ForegroundColor Gray
    Write-Host "  3. Run:" -ForegroundColor White
    Write-Host "     npm run prisma:seed" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After setting DATABASE_URL, run:" -ForegroundColor Cyan
    Write-Host "  npm run prisma:seed" -ForegroundColor White
}
