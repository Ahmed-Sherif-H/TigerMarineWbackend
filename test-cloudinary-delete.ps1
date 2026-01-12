# Test Cloudinary Delete
# Usage: .\test-cloudinary-delete.ps1 -Url "https://res.cloudinary.com/.../image.jpg"

param(
    [Parameter(Mandatory=$true)]
    [string]$Url, # Cloudinary URL or public_id
    
    [string]$PublicId = "",
    [string]$ApiUrl = "https://tigermarinewbackend-production.up.railway.app"
)

Write-Host "🧪 Testing Cloudinary Delete" -ForegroundColor Cyan
Write-Host ""

# Get token
$tokenFile = "auth-token.txt"
if (-not (Test-Path $tokenFile)) {
    Write-Host "❌ No auth token found. Please login first:" -ForegroundColor Red
    Write-Host "   .\test-login.ps1 -Url $ApiUrl" -ForegroundColor Yellow
    exit 1
}

$token = Get-Content $tokenFile -Raw

Write-Host "🗑️  Deleting file from Cloudinary" -ForegroundColor Yellow
Write-Host "   URL: $Url" -ForegroundColor Gray
if ($PublicId) { Write-Host "   Public ID: $PublicId" -ForegroundColor Gray }
Write-Host ""

try {
    $body = @{
        url = $Url
    }
    
    if ($PublicId) {
        $body.public_id = $PublicId
    }
    
    $bodyJson = $body | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/upload/delete" `
        -Method Delete `
        -Headers $headers `
        -Body $bodyJson `
        -ErrorAction Stop
    
    Write-Host "✅ Delete successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Delete failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error:" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody -ForegroundColor Red
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    exit 1
}
