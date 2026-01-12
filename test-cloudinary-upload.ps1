# Test Cloudinary Upload
# Usage: .\test-cloudinary-upload.ps1 -FilePath "path/to/image.jpg" -Folder "images" -ModelName "ML38"

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$true)]
    [string]$Folder, # "images", "categories", or "customizer"
    
    [string]$ModelName = "",
    [string]$CategoryName = "",
    [string]$Subfolder = "", # "Interior" for interior images
    [string]$PartName = "",
    [string]$Url = "https://tigermarinewbackend-production.up.railway.app"
)

Write-Host "🧪 Testing Cloudinary Upload" -ForegroundColor Cyan
Write-Host ""

# Check if file exists
if (-not (Test-Path $FilePath)) {
    Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
    exit 1
}

# Get token first (you'll need to login first)
Write-Host "📝 Note: You need to be logged in first!" -ForegroundColor Yellow
Write-Host "   Run: .\test-login.ps1 -Url $Url" -ForegroundColor Gray
Write-Host ""

$tokenFile = "auth-token.txt"
if (-not (Test-Path $tokenFile)) {
    Write-Host "❌ No auth token found. Please login first:" -ForegroundColor Red
    Write-Host "   .\test-login.ps1 -Url $Url" -ForegroundColor Yellow
    exit 1
}

$token = Get-Content $tokenFile -Raw

Write-Host "📤 Uploading file: $FilePath" -ForegroundColor Yellow
Write-Host "   Folder: $Folder" -ForegroundColor Gray
if ($ModelName) { Write-Host "   Model: $ModelName" -ForegroundColor Gray }
if ($CategoryName) { Write-Host "   Category: $CategoryName" -ForegroundColor Gray }
if ($Subfolder) { Write-Host "   Subfolder: $Subfolder" -ForegroundColor Gray }
Write-Host ""

try {
    # Create multipart form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
    $fileName = [System.IO.Path]::GetFileName($FilePath)
    
    $bodyLines = @()
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"folder`""
    $bodyLines += ""
    $bodyLines += $Folder
    
    if ($ModelName) {
        $bodyLines += "--$boundary"
        $bodyLines += "Content-Disposition: form-data; name=`"modelName`""
        $bodyLines += ""
        $bodyLines += $ModelName
    }
    
    if ($CategoryName) {
        $bodyLines += "--$boundary"
        $bodyLines += "Content-Disposition: form-data; name=`"categoryName`""
        $bodyLines += ""
        $bodyLines += $CategoryName
    }
    
    if ($Subfolder) {
        $bodyLines += "--$boundary"
        $bodyLines += "Content-Disposition: form-data; name=`"subfolder`""
        $bodyLines += ""
        $bodyLines += $Subfolder
    }
    
    if ($PartName) {
        $bodyLines += "--$boundary"
        $bodyLines += "Content-Disposition: form-data; name=`"partName`""
        $bodyLines += ""
        $bodyLines += $PartName
    }
    
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`""
    $bodyLines += "Content-Type: image/jpeg"
    $bodyLines += ""
    
    $bodyText = $bodyLines -join "`r`n"
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyText)
    
    # Add file bytes
    $bodyBytes += [System.Text.Encoding]::UTF8.GetBytes("`r`n")
    $bodyBytes += $fileBytes
    $bodyBytes += [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--`r`n")
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $response = Invoke-RestMethod -Uri "$Url/api/upload/single" `
        -Method Post `
        -Headers $headers `
        -Body $bodyBytes `
        -ErrorAction Stop
    
    Write-Host "✅ Upload successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10
    
    if ($response.url) {
        Write-Host ""
        Write-Host "🌐 Cloudinary URL:" -ForegroundColor Yellow
        Write-Host $response.url -ForegroundColor White
        Write-Host ""
        Write-Host "💡 Use this URL in your database!" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
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
