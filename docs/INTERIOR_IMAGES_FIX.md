# Interior Images Display Fix

## Problem

Interior images were uploading successfully but not displaying in the frontend because the image paths were missing the `/Interior/` subfolder.

## Root Cause

1. **Upload Location**: Images were correctly saved to `public/images/[ModelName]/Interior/`
2. **Path Building**: The `buildImagePath()` function was building paths like `/images/[ModelName]/[filename]` without the `Interior/` subfolder
3. **Result**: Frontend couldn't find images because the paths were incorrect

## Solution

### 1. Updated `buildImagePath()` Function

Added an `isInterior` parameter to include the `/Interior/` subfolder when building paths:

```javascript
buildImagePath(modelName, filename, isInterior = false) {
  // ...
  if (isInterior) {
    return `/images/${folderName}/Interior/${cleanFilename}`;
  }
  return `/images/${folderName}/${cleanFilename}`;
}
```

### 2. Updated Interior Files Path Building

Now interior files use the correct path builder:

```javascript
interiorFiles: model.interiorFiles?.map(int => {
  const path = this.buildImagePath(modelName, int.filename, true); // true = isInterior
  return path;
}).filter(Boolean) || []
```

### 3. Added Helper Fields for Frontend

Added two helper fields to make it easier for the frontend:

- `interiorMainImage`: First interior image (for single display)
- `interiorGallery`: All interior images (for carousel)

```javascript
transformed.interiorMainImage = transformed.interiorFiles.length > 0 
  ? transformed.interiorFiles[0] 
  : null;

transformed.interiorGallery = transformed.interiorFiles.length > 1
  ? transformed.interiorFiles.slice(1)
  : transformed.interiorFiles;
```

## Folder Structure

```
public/images/
├── [ModelName]/
│   ├── image.jpg              # Main model images
│   ├── hero-image.jpg
│   └── Interior/              # Interior images subfolder
│       ├── interior-1.jpg
│       ├── interior-2.jpg
│       └── interior-3.jpg
```

## API Response Format

The API now returns:

```json
{
  "id": 1,
  "name": "Open650",
  "interiorFiles": [
    "/images/Open650/Interior/interior-1.jpg",
    "/images/Open650/Interior/interior-2.jpg",
    "/images/Open650/Interior/interior-3.jpg"
  ],
  "interiorMainImage": "/images/Open650/Interior/interior-1.jpg",
  "interiorGallery": [
    "/images/Open650/Interior/interior-2.jpg",
    "/images/Open650/Interior/interior-3.jpg"
  ]
}
```

## Frontend Usage

### Single Interior Image
Use `interiorMainImage` for the single display:
```javascript
<img src={model.interiorMainImage} alt="Interior" />
```

### Interior Gallery Carousel
Use `interiorGallery` for the carousel:
```javascript
{model.interiorGallery.map((img, index) => (
  <img key={index} src={img} alt={`Interior ${index + 1}`} />
))}
```

Or use `interiorFiles` for all images:
```javascript
{model.interiorFiles.map((img, index) => (
  <img key={index} src={img} alt={`Interior ${index + 1}`} />
))}
```

## Upload Process

When uploading interior images from the admin dashboard:

1. **Frontend sends:**
   ```javascript
   formData.append('folder', 'images');
   formData.append('modelName', 'Open650');
   formData.append('subfolder', 'Interior'); // Important!
   formData.append('file', imageFile);
   ```

2. **Backend saves to:**
   - `public/images/Open650/Interior/[filename]`

3. **Database stores:**
   - Just the filename in `InteriorFile` table

4. **API returns:**
   - Full path: `/images/Open650/Interior/[filename]`

## Testing

After the fix:
1. ✅ Upload interior images - they save correctly
2. ✅ Check API response - paths include `/Interior/`
3. ✅ Frontend displays images - paths are correct
4. ✅ Images load in browser - URLs are valid

## Notes

- The `interiorMainImage` is the first image in the `interiorFiles` array
- The `interiorGallery` contains all images (or all except first if more than one)
- All interior images are stored in the `InteriorFile` table
- The order is preserved based on the `order` field in the database

