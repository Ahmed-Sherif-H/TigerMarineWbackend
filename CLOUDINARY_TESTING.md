# Cloudinary Testing Guide

## Prerequisites

1. **Login first** to get authentication token:
   ```powershell
   .\test-login.ps1 -Url "https://tigermarinewbackend-production.up.railway.app"
   ```

2. **Set Cloudinary credentials** in Railway:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Test 1: Upload Single Image

### Upload Model Image
```powershell
.\test-cloudinary-upload.ps1 `
  -FilePath "C:\path\to\image.jpg" `
  -Folder "images" `
  -ModelName "ML38"
```

### Upload Category Image
```powershell
.\test-cloudinary-upload.ps1 `
  -FilePath "C:\path\to\category-hero.jpg" `
  -Folder "categories" `
  -CategoryName "TopLine"
```

### Upload Interior Image
```powershell
.\test-cloudinary-upload.ps1 `
  -FilePath "C:\path\to\interior.jpg" `
  -Folder "images" `
  -ModelName "ML38" `
  -Subfolder "Interior"
```

### Upload Customizer Image
```powershell
.\test-cloudinary-upload.ps1 `
  -FilePath "C:\path\to\part.jpg" `
  -Folder "customizer" `
  -ModelName "ML38" `
  -PartName "Hull"
```

## Expected Response

On success, you'll get:
```json
{
  "success": true,
  "message": "File uploaded successfully to Cloudinary",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/models/MaxLine%2038/image.jpg",
  "public_id": "models/MaxLine 38/image",
  "filename": "image.jpg",
  "size": 123456,
  "format": "jpg",
  "width": 1920,
  "height": 1080
}
```

**Important:** Use the `url` field when saving to database!

## Test 2: Verify Image Display

1. **Upload an image** using the test script above
2. **Copy the Cloudinary URL** from the response
3. **Open it in browser** - should display the image
4. **Check database** - verify the URL is stored correctly

## Test 3: Delete Image

```powershell
.\test-cloudinary-delete.ps1 `
  -Url "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/models/MaxLine%2038/image.jpg"
```

Or using public_id:
```powershell
.\test-cloudinary-delete.ps1 `
  -Url "https://res.cloudinary.com/..." `
  -PublicId "models/MaxLine 38/image"
```

## Test 4: Using Admin Dashboard

1. **Login** to admin dashboard
2. **Go to a model** (e.g., ML38)
3. **Upload an image** via the upload button
4. **Check the response** - should contain Cloudinary URL
5. **Save the model** - URL should be stored in database
6. **Refresh** - Image should display from Cloudinary

## Manual Testing with PowerShell

### Test Upload (without script)

```powershell
# First, get your token
$token = Get-Content auth-token.txt -Raw

# Then upload
$filePath = "C:\path\to\image.jpg"
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileName = [System.IO.Path]::GetFileName($filePath)

$boundary = [System.Guid]::NewGuid().ToString()
$body = @"
--$boundary
Content-Disposition: form-data; name="folder"

images
--$boundary
Content-Disposition: form-data; name="modelName"

ML38
--$boundary
Content-Disposition: form-data; name="file"; filename="$fileName"
Content-Type: image/jpeg

"@

$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$bodyBytes += $fileBytes
$bodyBytes += [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--`r`n")

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

Invoke-RestMethod -Uri "https://tigermarinewbackend-production.up.railway.app/api/upload/single" `
    -Method Post `
    -Headers $headers `
    -Body $bodyBytes | ConvertTo-Json
```

### Test Delete (without script)

```powershell
$token = Get-Content auth-token.txt -Raw

$body = @{
    url = "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/models/MaxLine%2038/image.jpg"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://tigermarinewbackend-production.up.railway.app/api/upload/delete" `
    -Method Delete `
    -Headers $headers `
    -Body $body | ConvertTo-Json
```

## Troubleshooting

### "Cloudinary is not configured"
- Check environment variables are set in Railway
- Verify variable names are correct (no typos)
- Restart Railway service after adding variables

### "401 Unauthorized"
- Token expired or invalid
- Run `.\test-login.ps1` again to get new token

### "File upload failed"
- Check file size (max 50MB)
- Verify file is an image (jpg, png, gif, webp)
- Check Railway logs for detailed error

### Image not displaying
- Verify Cloudinary URL is stored in database (not just filename)
- Check URL is accessible in browser
- Frontend might need to be updated to use `url` field

## Next Steps After Testing

1. ✅ Verify uploads work
2. ✅ Verify images display correctly
3. ✅ Update frontend to use `url` from upload response
4. ✅ Re-upload existing images to get Cloudinary URLs
5. ✅ Test delete functionality
