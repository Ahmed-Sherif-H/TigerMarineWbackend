# Script to update .env file with local database
# Run this script and enter your PostgreSQL password when prompted

Write-Host "Updating .env file to use local database..." -ForegroundColor Yellow
Write-Host ""

# Get PostgreSQL password
$password = Read-Host "Enter your PostgreSQL password (for user 'postgres')"

# Read current .env file
if (Test-Path .env) {
    $content = Get-Content .env -Raw
    
    # Replace DATABASE_URL line
    $newDatabaseUrl = "DATABASE_URL=`"postgresql://postgres:$password@localhost:5432/tigermarine?schema=public`""
    
    if ($content -match 'DATABASE_URL="[^"]+"') {
        $content = $content -replace 'DATABASE_URL="[^"]+"', $newDatabaseUrl
        Set-Content .env -Value $content -NoNewline
        Write-Host "✅ .env file updated successfully!" -ForegroundColor Green
        Write-Host "New DATABASE_URL: postgresql://postgres:***@localhost:5432/tigermarine?schema=public" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Could not find DATABASE_URL in .env file" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
}

