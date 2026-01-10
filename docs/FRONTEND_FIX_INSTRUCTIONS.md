# Frontend Fix Instructions - Interior Main Image Update

## Step-by-Step Instructions

### Step 1: Find Where You Upload Interior Main Image

Look for the code that handles uploading the interior main image. It's probably in:
- Admin Dashboard component
- Model edit/form component
- Image upload handler

**What to look for:**
- Code that calls `/api/upload/single` with `subfolder: 'Interior'`
- Function that handles interior main image upload
- State variable that stores the uploaded image

### Step 2: Find Where You Update the Model

Look for the code that updates the model after upload. It's probably:
- A `handleSave` or `updateModel` function
- Code that calls `PUT /api/models/:id`
- The function that sends the model data to the backend

### Step 3: Check the Upload Response

After uploading, make sure you're getting the file path:

```javascript
// After upload, you should have something like:
const uploadResponse = await fetch('/api/upload/single', {
  method: 'POST',
  body: formData
});
const uploadData = await uploadResponse.json();

// Check what you're getting:
console.log('Upload response:', uploadData);
// Should show: { success: true, filename: "...", path: "..." }
```

### Step 4: Fix the Model Update

When updating the model, you need to include the uploaded image path in `interiorMainImage`:

**Find this code (or similar):**
```javascript
// When updating model
const updateData = {
  // ... other fields
  interiorMainImage: "", // ❌ This is probably empty!
  interiorFiles: galleryImages
};
```

**Change it to:**
```javascript
// After upload, store the path
const uploadedMainImagePath = uploadData.path; // or uploadData.filename

// When updating model
const updateData = {
  // ... other fields
  interiorMainImage: uploadedMainImagePath, // ✅ Use the uploaded path!
  interiorFiles: galleryImages
};
```

## Complete Example Fix

### Before (Broken):
```javascript
// Upload interior main image
const handleInteriorMainUpload = async (file) => {
  const formData = new FormData();
  formData.append('folder', 'images');
  formData.append('modelName', modelName);
  formData.append('subfolder', 'Interior');
  formData.append('file', file);
  
  const res = await fetch('/api/upload/single', {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  
  // ❌ Problem: Not storing the path!
  // Just updating local state, but not including in model update
  setInteriorMainImage(file.name); // Wrong!
};

// Update model
const handleSave = async () => {
  const updateData = {
    // ...
    interiorMainImage: "", // ❌ Empty!
    interiorFiles: interiorGallery
  };
  await updateModel(modelId, updateData);
};
```

### After (Fixed):
```javascript
// Upload interior main image
const handleInteriorMainUpload = async (file) => {
  const formData = new FormData();
  formData.append('folder', 'images');
  formData.append('modelName', modelName);
  formData.append('subfolder', 'Interior');
  formData.append('file', file);
  
  const res = await fetch('/api/upload/single', {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  
  // ✅ Store the full path from upload response
  const imagePath = data.path || `/images/${modelName}/Interior/${data.filename}`;
  
  // Update local state with the path
  setInteriorMainImage(imagePath);
  
  // ✅ Also store it for the model update
  setUploadedInteriorMainPath(imagePath);
  
  return imagePath; // Return it so it can be used
};

// Update model
const handleSave = async () => {
  // Get the uploaded path (from state or variable)
  const mainImagePath = uploadedInteriorMainPath || interiorMainImage;
  
  const updateData = {
    // ...
    interiorMainImage: mainImagePath, // ✅ Include the uploaded path!
    interiorFiles: interiorGallery
  };
  
  console.log('Updating with:', updateData); // Debug: check this!
  
  await updateModel(modelId, updateData);
};
```

## What to Check in Your Code

### 1. Upload Handler
- [ ] Does it get the response from upload?
- [ ] Does it extract the file path?
- [ ] Does it store the path somewhere (state/variable)?

### 2. Model Update Handler
- [ ] Does it include `interiorMainImage` in the update data?
- [ ] Is `interiorMainImage` set to the uploaded path (not empty string)?
- [ ] Is it using the path from the upload response?

### 3. State Management
- [ ] Is there a state variable for the uploaded main image path?
- [ ] Is it being set after upload?
- [ ] Is it being used when updating the model?

## Quick Debug Steps

1. **Add console.log after upload:**
   ```javascript
   const uploadData = await uploadResponse.json();
   console.log('Upload result:', uploadData);
   console.log('Image path:', uploadData.path);
   ```

2. **Add console.log before update:**
   ```javascript
   console.log('Update data:', updateData);
   console.log('interiorMainImage:', updateData.interiorMainImage);
   ```

3. **Check browser Network tab:**
   - Look at the PUT request to `/api/models/:id`
   - Check the request payload
   - Verify `interiorMainImage` has a value (not empty string)

## Common Issues to Fix

### Issue 1: Not Storing Upload Response
```javascript
// ❌ Wrong
await uploadImage(file);
// Path is lost!

// ✅ Correct
const uploadResult = await uploadImage(file);
const imagePath = uploadResult.path; // Store it!
```

### Issue 2: Using File Name Instead of Path
```javascript
// ❌ Wrong
interiorMainImage: file.name // Just filename

// ✅ Correct
interiorMainImage: uploadResult.path // Full path
```

### Issue 3: Not Including in Update
```javascript
// ❌ Wrong
const updateData = {
  interiorMainImage: "", // Empty!
};

// ✅ Correct
const updateData = {
  interiorMainImage: uploadedPath, // From upload response!
};
```

## Expected Flow

1. User selects image file
2. Frontend uploads to `/api/upload/single`
3. Backend returns: `{ success: true, filename: "image.jpg", path: "..." }`
4. Frontend stores the `path` in state/variable
5. When saving model, frontend includes that `path` in `interiorMainImage`
6. Backend receives the path and updates the database

## Test After Fix

1. Upload a new interior main image
2. Check browser console - should see the path
3. Save the model
4. Check Network tab - PUT request should have `interiorMainImage` with the path
5. Refresh dashboard - image should persist
6. Check website - image should display

## Still Not Working?

If it's still not working after fixing:

1. **Check the upload response format:**
   - What does `uploadData.path` contain?
   - Is it a full path like `/images/Open650/Interior/image.jpg`?

2. **Check the update request:**
   - Open browser DevTools → Network tab
   - Find the PUT request to `/api/models/:id`
   - Check the payload - does `interiorMainImage` have a value?

3. **Check backend logs:**
   - Look for: `Received interiorMainImage: "..."`
   - Should NOT be empty string

Let me know what you find and I can help further!

