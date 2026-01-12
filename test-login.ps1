# Test Login Endpoint
# Usage: .\test-login.ps1
# Or: .\test-login.ps1 -Url "https://your-railway-url.up.railway.app"

param(
    [string]$Url = "http://localhost:3001",
    [string]$Email = "admin@tigermarine.com",
    [string]$Password = "admin123"
)

Write-Host "🔐 Testing Login Endpoint" -ForegroundColor Cyan
Write-Host "URL: $Url/api/auth/login" -ForegroundColor Gray
Write-Host "Email: $Email" -ForegroundColor Gray
Write-Host ""

try {
    $body = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    Write-Host "📤 Sending login request..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$Url/api/auth/login" `
        -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    if ($response.success -and $response.data.token) {
        Write-Host ""
        Write-Host "🔑 Your JWT Token:" -ForegroundColor Yellow
        Write-Host $response.data.token -ForegroundColor White
        Write-Host ""
        Write-Host "💡 Use this token in Authorization header:" -ForegroundColor Cyan
        Write-Host "   Authorization: Bearer $($response.data.token)" -ForegroundColor Gray
        Write-Host ""
        
        # Save token to file for easy access
        $tokenFile = "auth-token.txt"
        $response.data.token | Out-File -FilePath $tokenFile -NoNewline
        Write-Host "💾 Token saved to: $tokenFile" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody -ForegroundColor Red
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "  1. Make sure the server is running" -ForegroundColor Gray
    Write-Host "  2. Check if admin user exists (run: npm run prisma:seed)" -ForegroundColor Gray
    Write-Host "  3. Verify email and password are correct" -ForegroundColor Gray
    exit 1
}
