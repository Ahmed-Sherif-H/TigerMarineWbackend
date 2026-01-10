# Interior Image Update Guide

## Problem

When updating a single interior image, the image uploads successfully but:
- Doesn't reflect on the website
- Reverts to old image after dashboard refresh

## Root Cause

The backend's `updateModel` function was deleting ALL interior files and only recreating them if the full `interiorFiles` array was provided. If the frontend only sent a single image update, all interior files were deleted and nothing was recreated.

## Solution

The backend now supports two ways to update interior images:

### Option 1: Update Full Array (Recommended)

Send the complete `interiorFiles` array with all interior images:

```javascript
{
  interiorFiles: [
    "/images/Open650/Interior/new-main-image.jpg",  // First = main image
    "/images/Open650/Interior/gallery-1.jpg",
    "/images/Open650/Interior/gallery-2.jpg"
  ]
}
```

### Option 2: Update Single Main Image Only

Send only `interiorMainImage` - the backend will:
- Replace the first interior image
- Preserve all other existing interior gallery images

```javascript
{
  interiorMainImage: "/images/Open650/Interior/new-main-image.jpg"
}
```

## How It Works

### When `interiorFiles` Array is Provided:
- Deletes all existing interior files
- Creates new interior files from the array
- First item in array becomes the main interior image

### When `interiorMainImage` is Provided (but not `interiorFiles`):
- Preserves existing interior gallery images
- Replaces only the first interior image (main image)
- Keeps all other images in the gallery

### When Neither is Provided:
- Preserves all existing interior files
- No changes made

## Frontend Implementation

### Recommended Approach

When updating a model with interior images, always send the complete array:

```javascript
// After uploading new main interior image
const updateData = {
  // ... other model data
  interiorFiles: [
    newMainInteriorImagePath,  // New main image (first)
    ...existingInteriorGallery  // Existing gallery images
  ]
};

// Update model
await updateModel(modelId, updateData);
```

### Alternative: Single Image Update

If you only want to update the main image:

```javascript
const updateData = {
  // ... other model data
  interiorMainImage: "/images/Open650/Interior/new-image.jpg"
};

// Backend will:
// - Replace first interior image
// - Keep all other interior gallery images
await updateModel(modelId, updateData);
```

## Important Notes

1. **Always Include Existing Images**: When updating, make sure to include all existing interior gallery images in the `interiorFiles` array, not just the new one.

2. **Order Matters**: The first image in `interiorFiles` becomes the main interior image (`interiorMainImage`).

3. **Empty Array**: If you send `interiorFiles: []`, ALL interior images will be deleted.

4. **Path Format**: Send full paths (e.g., `/images/Open650/Interior/image.jpg`), the backend will extract just the filename.

## Example: Complete Update Flow

```javascript
// 1. Upload new main interior image
const uploadResponse = await uploadImage({
  folder: 'images',
  modelName: 'Open650',
  subfolder: 'Interior',
  file: newImageFile
});
// Returns: { filename: "new-image.jpg", path: "..." }

// 2. Get current model to preserve gallery
const currentModel = await getModel(modelId);

// 3. Update model with new main image + existing gallery
await updateModel(modelId, {
  // ... other fields
  interiorFiles: [
    uploadResponse.path,  // New main image (first)
    ...currentModel.interiorGallery  // Existing gallery (rest)
  ]
});
```

## Testing

After implementing:
1. ✅ Upload new main interior image
2. ✅ Verify it appears on website immediately
3. ✅ Refresh dashboard - image should persist
4. ✅ Check that gallery images are preserved
5. ✅ Verify API response includes correct paths

## Debugging

Check backend logs for:
- `Received interiorFiles count: X`
- `Received interiorMainImage: ...`
- `Final interiorFiles count: X`
- `Saved interiorFiles count: X`

If counts don't match, the frontend might not be sending the data correctly.

