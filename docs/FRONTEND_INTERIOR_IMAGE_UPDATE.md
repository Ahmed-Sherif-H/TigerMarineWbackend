# Frontend: Interior Main Image Update Guide

## Problem

When uploading a new interior main image:
- Image uploads successfully ✅
- But `interiorMainImage` shows as empty string `""` in debug data ❌
- Image doesn't update in database ❌

## Root Cause

The frontend is not including the uploaded image path in the `interiorMainImage` field when updating the model.

## Solution

After uploading the interior main image, you MUST include the uploaded file path in the update request.

### Step-by-Step Process

#### 1. Upload the Image

```javascript
// Upload interior main image
const uploadFormData = new FormData();
uploadFormData.append('folder', 'images');
uploadFormData.append('modelName', 'Open650');
uploadFormData.append('subfolder', 'Interior');
uploadFormData.append('file', imageFile);

const uploadResponse = await fetch('/api/upload/single', {
  method: 'POST',
  body: uploadFormData
});

const uploadResult = await uploadResponse.json();
// Returns: { success: true, filename: "new-image.jpg", path: "..." }
```

#### 2. Update Model with Uploaded Image Path

**IMPORTANT**: You must include the uploaded image path in the update:

```javascript
// Get current model to preserve gallery
const currentModel = await getModel(modelId);

// Update model - include the uploaded image path
const updateData = {
  // ... other model fields
  interiorMainImage: uploadResult.path, // ✅ Include the uploaded path here!
  interiorFiles: currentModel.interiorGallery || [] // Preserve gallery
};

// OR: Put it as first in interiorFiles array
const updateData = {
  // ... other model fields
  interiorFiles: [
    uploadResult.path, // ✅ New main image (first)
    ...(currentModel.interiorGallery || []) // Existing gallery
  ]
};

await updateModel(modelId, updateData);
```

## Two Ways to Update

### Option 1: Using `interiorMainImage` Field (Recommended)

```javascript
{
  interiorMainImage: "/images/Open650/Interior/new-main-image.jpg",
  interiorFiles: [
    "/images/Open650/Interior/gallery-1.jpg",
    "/images/Open650/Interior/gallery-2.jpg"
  ]
}
```

**Backend behavior:**
- Uses `interiorMainImage` as the first item
- Uses `interiorFiles` as the gallery (rest)
- Final array: `[mainImage, ...gallery]`

### Option 2: Using `interiorFiles` Array Only

```javascript
{
  interiorFiles: [
    "/images/Open650/Interior/new-main-image.jpg", // First = main
    "/images/Open650/Interior/gallery-1.jpg",
    "/images/Open650/Interior/gallery-2.jpg"
  ]
}
```

**Backend behavior:**
- First item in array becomes main image
- Rest become gallery

## Common Mistakes

### ❌ Wrong: Not Including Uploaded Path

```javascript
// Upload succeeds
const uploadResult = await uploadImage(file);

// But update doesn't include the path!
const updateData = {
  interiorMainImage: "", // ❌ Empty string!
  interiorFiles: existingGallery
};
```

### ✅ Correct: Include Uploaded Path

```javascript
// Upload succeeds
const uploadResult = await uploadImage(file);

// Include the path in update
const updateData = {
  interiorMainImage: uploadResult.path, // ✅ Use the uploaded path!
  interiorFiles: existingGallery
};
```

## Debug Checklist

When updating interior main image, check:

1. **Upload Response:**
   ```javascript
   console.log('Upload result:', uploadResult);
   // Should show: { success: true, filename: "...", path: "..." }
   ```

2. **Update Data:**
   ```javascript
   console.log('Update data:', updateData);
   // Should show: { interiorMainImage: "/images/...", ... }
   ```

3. **Backend Logs:**
   Look for:
   - `Received interiorMainImage: "/images/..."`
   - `Processing interiorMainImage: "..."`
   - `Final interiorFiles count: X`

## Example: Complete Flow

```javascript
async function updateInteriorMainImage(modelId, newImageFile) {
  // 1. Upload image
  const formData = new FormData();
  formData.append('folder', 'images');
  formData.append('modelName', 'Open650');
  formData.append('subfolder', 'Interior');
  formData.append('file', newImageFile);
  
  const uploadRes = await fetch('/api/upload/single', {
    method: 'POST',
    body: formData
  });
  const uploadData = await uploadRes.json();
  
  console.log('Uploaded:', uploadData.path); // Should show path
  
  // 2. Get current model
  const currentModel = await fetch(`/api/models/${modelId}`).then(r => r.json());
  
  // 3. Update model with new main image + existing gallery
  const updateData = {
    // ... other fields
    interiorMainImage: uploadData.path, // ✅ CRITICAL: Include this!
    interiorFiles: currentModel.data.interiorGallery || []
  };
  
  console.log('Updating with:', updateData); // Verify path is included
  
  const updateRes = await fetch(`/api/models/${modelId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  
  return updateRes.json();
}
```

## Backend Expectations

The backend expects:

1. **If `interiorMainImage` is provided (non-empty):**
   - Uses it as the first interior image
   - If `interiorFiles` is also provided, uses it as gallery
   - If `interiorFiles` is not provided, preserves existing gallery

2. **If `interiorMainImage` is empty string `""`:**
   - Treats it as "clear main image"
   - Keeps gallery if exists

3. **If `interiorMainImage` is not provided:**
   - Preserves existing main image
   - Only updates if `interiorFiles` is provided

## Quick Fix

Make sure your frontend code does this:

```javascript
// After upload
const uploadResult = await uploadInteriorImage(file);

// When updating model
await updateModel(modelId, {
  interiorMainImage: uploadResult.path, // ✅ Don't forget this!
  // ... other fields
});
```

The key is: **Always include the uploaded file path in `interiorMainImage` when updating!**

