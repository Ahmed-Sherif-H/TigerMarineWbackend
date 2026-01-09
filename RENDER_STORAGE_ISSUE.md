# Render Storage Issue - Image Uploads

## Problem

Images uploaded to categories (and other uploads) disappear after refresh on Render. This happens because:

1. **Ephemeral Filesystem**: Render's filesystem is temporary and gets reset on:
   - Service restarts
   - Deployments
   - Container recreation

2. **Local Storage**: Images are currently saved to `public/images/categories/` which is part of the local filesystem.

## Current Status

✅ **Fixed**: 
- Categories folder is now created on server startup
- Static file serving is configured correctly
- Upload functionality works

❌ **Still an Issue**:
- Files are lost on Render redeploy/restart
- This is a limitation of Render's free tier

## Solutions

### Option 1: Use Cloud Storage (Recommended for Production)

Use a cloud storage service to store uploaded images:

#### A. AWS S3
- Free tier: 5GB storage, 20,000 GET requests/month
- Setup: Create S3 bucket, configure IAM, use AWS SDK

#### B. Cloudinary
- Free tier: 25GB storage, 25GB bandwidth/month
- Easy setup, image optimization included
- Best for quick implementation

#### C. Google Cloud Storage
- Free tier: 5GB storage
- Similar to S3

### Option 2: Render Disk (Paid)

Render offers persistent disk storage on paid plans, but this is more expensive than cloud storage.

### Option 3: Accept Limitation (Development Only)

For development/testing, you can accept that images will be lost on redeploy. Images will work until the next deployment.

## Quick Fix for Development

The current setup will work temporarily. Images will:
- ✅ Upload successfully
- ✅ Display correctly
- ❌ Disappear on next deployment/restart

## Implementation Guide for Cloud Storage

### Using Cloudinary (Easiest)

1. Sign up at https://cloudinary.com
2. Get your API credentials
3. Install: `npm install cloudinary`
4. Update upload route to use Cloudinary instead of local storage
5. Store image URLs in database instead of file paths

### Using AWS S3

1. Create AWS account and S3 bucket
2. Install: `npm install @aws-sdk/client-s3`
3. Configure credentials
4. Update upload route to upload to S3
5. Store S3 URLs in database

## Current File Structure

```
public/
  images/
    categories/          ← Category images saved here (EPHEMERAL on Render)
      [CategoryName]/
        image.jpg
    [ModelName]/         ← Model images
  Customizer-images/     ← Customizer images
```

## Next Steps

1. **For Production**: Implement cloud storage (Cloudinary recommended)
2. **For Development**: Current setup works but images are temporary
3. **Database**: Image paths are stored correctly, but files don't persist

## Testing

To test if images persist:
1. Upload an image
2. Verify it displays
3. Restart Render service (or wait for auto-deploy)
4. Check if image still exists (it won't on Render)

---

**Note**: This is a common issue with cloud platforms. Most production apps use cloud storage for user-uploaded content.

