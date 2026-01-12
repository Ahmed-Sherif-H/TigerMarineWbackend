# Cloudinary Images Management Guide

## Overview

All images are now stored on Cloudinary for permanent, reliable access. This guide explains how to manage and check your images.

## Accessing Cloudinary Dashboard

1. **Go to Cloudinary Console:**
   - URL: https://console.cloudinary.com/
   - Login with your Cloudinary account

2. **Navigate to Media Library:**
   - Click on your cloud name in the top right
   - Select "Media Library" from the menu
   - Or go directly to: `https://console.cloudinary.com/console/c/[YOUR_CLOUD_NAME]/media_library`

3. **View Images:**
   - Browse by folder structure:
     - `models/` - Model images
     - `categories/` - Category images
     - `customizer/` - Customizer images
   - Search by name or public_id
   - Filter by type, size, date

## Folder Structure

```
Cloudinary/
├── models/
│   ├── MaxLine 38/
│   │   ├── [main images]
│   │   └── Interior/
│   │       └── [interior images]
│   ├── ProLine620/
│   │   ├── [main images]
│   │   └── Interior/
│   │       └── [interior images]
│   └── ...
├── categories/
│   ├── TopLine/
│   ├── MaxLine/
│   ├── ProLine/
│   ├── Open/
│   └── SportLine/
└── customizer/
    └── [model]/[part]/
```

## List Images via Script

Use the provided script to list all images:

```bash
npm run list:cloudinary
```

This will:
- Show all images grouped by folder
- Display URLs, sizes, and dimensions
- Provide a summary of total images and storage used

## Image URL Format

Cloudinary URLs follow this format:
```
https://res.cloudinary.com/[CLOUD_NAME]/image/upload/v[VERSION]/[FOLDER]/[FILENAME]
```

Example:
```
https://res.cloudinary.com/dtmcjepgn/image/upload/v1768186565/models/Open850/DJI_0202.jpg
```

## Database Storage

### Models
- **Main images**: Stored as full Cloudinary URL in `imageFile`, `heroImageFile`, `contentImageFile`
- **Gallery images**: Stored as full Cloudinary URL in `GalleryImage.filename`
- **Interior images**: Stored as full Cloudinary URL in `InteriorFile.filename`
- **Interior main image**: Stored as full Cloudinary URL in `interiorMainImage`

### Categories
- **Category image**: Stored as full Cloudinary URL in `Category.image`
- **Hero image**: Stored as full Cloudinary URL in `Category.heroImage`

## Troubleshooting

### Issue: Image URL stored as filename instead of Cloudinary URL

**Cause:** Frontend might be extracting filename from Cloudinary URL before saving.

**Solution:**
1. Check browser Network tab when saving
2. Verify the request payload contains full Cloudinary URL
3. Ensure frontend stores `response.url` from upload, not `response.filename`

### Issue: Images not displaying

**Check:**
1. Verify Cloudinary URL is valid (open in browser)
2. Check CORS settings in Cloudinary (should allow your domain)
3. Verify image exists in Cloudinary dashboard

### Issue: Inconsistent storage (sometimes URL, sometimes filename)

**Cause:** Frontend inconsistency in handling upload responses.

**Solution:**
- Backend now handles both correctly:
  - Cloudinary URLs (starts with `http://` or `https://`) → stored as-is
  - Filenames → stored as filename (for backward compatibility)
- Frontend should always send full Cloudinary URL after upload

## Best Practices

1. **Always use full Cloudinary URLs** in the database after upload
2. **Don't extract filenames** from Cloudinary URLs in the frontend
3. **Store `response.url`** from upload API, not `response.filename`
4. **Check Cloudinary dashboard** regularly to manage storage
5. **Use Cloudinary transformations** for optimized delivery (if needed)

## Cloudinary Features

- **Automatic optimization**: Images are automatically optimized
- **CDN delivery**: Fast global delivery
- **Transformations**: Resize, crop, format conversion on-the-fly
- **Versioning**: Each upload gets a version number
- **Secure URLs**: Uses HTTPS by default

## API Reference

### Upload Response Format
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/.../image.jpg",
  "public_id": "models/Open850/DJI_0202",
  "filename": "DJI_0202.jpg",
  "size": 1234567,
  "format": "jpg",
  "width": 1920,
  "height": 1080
}
```

### Important Fields
- **`url`**: Full Cloudinary URL - **USE THIS** for database storage
- **`public_id`**: Cloudinary identifier (for deletion)
- **`filename`**: Original filename (for reference only)

## Support

For Cloudinary-specific issues:
- Cloudinary Docs: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com/
