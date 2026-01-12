# Cloudinary Integration Setup Guide

## Overview

The backend has been updated to use Cloudinary for image storage instead of the local filesystem. This ensures images persist across Railway deployments.

## What Changed

### 1. Upload Routes (`routes/upload.js`)
- ✅ Changed from `multer.diskStorage` to `multer.memoryStorage`
- ✅ Uploads now go directly to Cloudinary
- ✅ Returns Cloudinary URL and `public_id` instead of local file paths
- ✅ Delete endpoint now removes files from Cloudinary

### 2. Image Path Handling (`services/modelsService.js`)
- ✅ `buildImagePath()` now detects Cloudinary URLs and returns them as-is
- ✅ `extractFilename()` preserves Cloudinary URLs when storing in database
- ✅ Backward compatible: still handles legacy filenames

### 3. Database Storage
- **New uploads**: Store Cloudinary URLs directly in database
- **Existing records**: Legacy filenames still work (will build local paths)
- **Migration**: Existing images will need to be re-uploaded to get Cloudinary URLs

## Setup Steps

### Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Go to Dashboard → Settings → Product Environment Credentials
4. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Set Environment Variables

Add these to your `.env` file and Railway variables:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**In Railway:**
1. Go to Railway Dashboard → Your Web Service
2. Click "Variables" tab
3. Add all three Cloudinary variables

### Step 3: Test Upload

After setting environment variables:

1. Deploy to Railway (or restart locally)
2. Login to admin dashboard
3. Try uploading an image
4. Check that it returns a Cloudinary URL

## How It Works Now

### Upload Flow

1. **Frontend** sends file via `POST /api/upload/single` or `/multiple`
2. **Backend** receives file in memory (multer memoryStorage)
3. **Cloudinary Service** uploads file to Cloudinary
4. **Response** returns:
   ```json
   {
     "success": true,
     "url": "https://res.cloudinary.com/.../image.jpg",
     "public_id": "models/MaxLine 38/image",
     "filename": "image.jpg"
   }
   ```
5. **Frontend** stores the `url` in database (not just filename)

### Image Serving

- **Cloudinary URLs**: Returned directly to frontend
- **Legacy filenames**: Still converted to local paths (for backward compatibility)
- **Frontend**: Can use Cloudinary URLs directly in `<img src="...">`

## Database Migration Strategy

### Option 1: Gradual Migration (Recommended)
- New uploads automatically use Cloudinary
- Existing images continue to work (if files exist locally)
- Re-upload images as needed via dashboard

### Option 2: Bulk Migration
- Create a script to upload all existing images to Cloudinary
- Update database records with Cloudinary URLs
- Remove local files

## Frontend Changes Needed

The frontend needs to handle the new upload response format:

**Old response:**
```json
{
  "filename": "image.jpg",
  "path": "/path/to/file"
}
```

**New response:**
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "public_id": "models/MaxLine 38/image",
  "filename": "image.jpg"
}
```

**Frontend should:**
1. Store `url` (not `filename`) when saving to database
2. Use `url` directly in image tags
3. Handle both formats for backward compatibility

## Testing

1. **Test upload:**
   ```bash
   POST /api/upload/single
   # Should return Cloudinary URL
   ```

2. **Test image display:**
   - Upload an image via dashboard
   - Check database stores Cloudinary URL
   - Verify image displays in frontend

3. **Test delete:**
   ```bash
   DELETE /api/upload/delete
   Body: { "url": "https://res.cloudinary.com/.../image.jpg" }
   # Should delete from Cloudinary
   ```

## Troubleshooting

### Images not uploading
- Check Cloudinary credentials are set correctly
- Check Railway logs for Cloudinary errors
- Verify file size is under 50MB

### Images not displaying
- Check if URL is stored correctly in database
- Verify Cloudinary URL is accessible
- Check frontend is using the `url` field

### Legacy images broken
- Legacy images (stored as filenames) won't work on Railway
- Re-upload them via dashboard to get Cloudinary URLs

## Benefits

✅ **Permanent storage** - Images persist across deployments  
✅ **CDN delivery** - Cloudinary serves images via CDN (faster)  
✅ **Image optimization** - Automatic format conversion and optimization  
✅ **Scalable** - No filesystem limitations  
✅ **Backward compatible** - Existing code still works


testt