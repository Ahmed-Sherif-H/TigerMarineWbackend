# Test Verify Token Endpoint
# Usage: .\test-verify.ps1 -Token "your-jwt-token-here"
# Or: .\test-verify.ps1 (reads from auth-token.txt)

param(
    [string]$Url = "http://localhost:3001",
    [string]$Token = ""
)

if ([string]::IsNullOrEmpty($Token)) {
    if (Test-Path "auth-token.txt") {
        $Token = Get-Content "auth-token.txt" -Raw
        Write-Host "📖 Reading token from auth-token.txt" -ForegroundColor Gray
    } else {
        Write-Host "❌ No token provided and auth-token.txt not found" -ForegroundColor Red
        Write-Host "Usage: .\test-verify.ps1 -Token 'your-jwt-token'" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "🔍 Verifying Token" -ForegroundColor Cyan
Write-Host "URL: $Url/api/auth/verify" -ForegroundColor Gray
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    
    Write-Host "📤 Sending verify request..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$Url/api/auth/verify" `
        -Method Get `
        -Headers $headers `
        -ErrorAction Stop

    Write-Host "✅ Token is valid!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Token verification failed!" -ForegroundColor Red
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
    Write-Host "Possible reasons:" -ForegroundColor Cyan
    Write-Host "  1. Token is expired" -ForegroundColor Gray
    Write-Host "  2. Token is invalid" -ForegroundColor Gray
    Write-Host "  3. Token format is incorrect" -ForegroundColor Gray
    exit 1
}
