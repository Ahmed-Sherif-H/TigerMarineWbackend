# Railway Database Migration Script
# This script sets the DATABASE_URL and runs migrations

Write-Host "🚀 Railway Database Setup" -ForegroundColor Cyan
Write-Host ""

# Prompt for DATABASE_URL
$databaseUrl = Read-Host "Enter your Railway DATABASE_URL (or press Enter to use existing)"

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "⚠️  No DATABASE_URL provided. Using existing .env file if available." -ForegroundColor Yellow
} else {
    # Set environment variable
    $env:DATABASE_URL = $databaseUrl
    Write-Host "✅ DATABASE_URL set" -ForegroundColor Green
    Write-Host ""
}

# Test connection
Write-Host "🔌 Testing database connection..." -ForegroundColor Cyan
npm run test:db

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Connection successful!" -ForegroundColor Green
    Write-Host ""
    
    # Run migrations
    Write-Host "📦 Running database migrations..." -ForegroundColor Cyan
    npx prisma migrate deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migrations completed!" -ForegroundColor Green
        Write-Host ""
        
        # Ask about seeding
        $seed = Read-Host "Do you want to seed the database? (y/n)"
        if ($seed -eq 'y' -or $seed -eq 'Y') {
            Write-Host ""
            Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
            npm run seed:all
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "❌ Seeding failed" -ForegroundColor Red
            }
        }
    } else {
        Write-Host ""
        Write-Host "❌ Migrations failed" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "❌ Database connection failed. Please check your DATABASE_URL." -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Cyan
