# Quick script to set Railway DATABASE_URL
# Usage: .\SET_RAILWAY_DB.ps1

Write-Host "🚀 Setting Railway DATABASE_URL" -ForegroundColor Cyan
Write-Host ""

# Get DATABASE_URL from user
$dbUrl = Read-Host "Paste your Railway DATABASE_URL here"

if ([string]::IsNullOrWhiteSpace($dbUrl)) {
    Write-Host "❌ No URL provided. Exiting." -ForegroundColor Red
    exit 1
}

# Set environment variable
$env:DATABASE_URL = $dbUrl

Write-Host ""
Write-Host "✅ DATABASE_URL set!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifying..." -ForegroundColor Cyan
Write-Host "URL: $($dbUrl.Substring(0, [Math]::Min(50, $dbUrl.Length)))..." -ForegroundColor Gray
Write-Host ""

# Test connection
Write-Host "🔌 Testing connection..." -ForegroundColor Cyan
npm run test:db

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Connection successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run:" -ForegroundColor Yellow
    Write-Host "  npx prisma migrate deploy" -ForegroundColor Green
    Write-Host "  npm run seed:all" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Connection failed. Please check your DATABASE_URL." -ForegroundColor Red
    Write-Host ""
    Write-Host "Tip: Use Railway Dashboard Shell instead (most reliable)" -ForegroundColor Yellow
}
