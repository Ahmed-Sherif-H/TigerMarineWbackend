# Category Image Folder Structure

## Overview

Category images are now organized by category type in subfolders within `public/images/categories/`.

## Folder Structure

```
public/images/categories/
├── TopLine/        # All TopLine category images
├── MaxLine/        # All MaxLine category images
├── ProLine/        # All ProLine category images
├── Open/           # All Open category images
└── SportLine/      # All SportLine category images
```

## How It Works

### Upload Process

1. **Frontend sends upload request** with:
   - `folder: "categories"`
   - `categoryName: "TopLine"` (or "TopLine 650", "topline", etc.)

2. **Backend maps category name to folder type:**
   - "TopLine" → `TopLine/`
   - "TopLine 650" → `TopLine/`
   - "MaxLine" → `MaxLine/`
   - "ProLine" → `ProLine/`
   - "Open" → `Open/`
   - "SportLine" → `SportLine/`

3. **Image is saved to:**
   - `public/images/categories/[CategoryType]/[filename]`

### Category Name Mapping

The system automatically maps category names to folder types:

| Category Name Examples | Folder Type |
|------------------------|-------------|
| "TopLine" | TopLine |
| "TopLine 650" | TopLine |
| "topline" | TopLine |
| "Top Line" | TopLine |
| "MaxLine" | MaxLine |
| "ProLine" | ProLine |
| "Open" | Open |
| "SportLine" | SportLine |

### Accessing Images

Images are served via the static file route:
```
/images/categories/[CategoryType]/[filename]
```

Example:
- File: `public/images/categories/TopLine/hero-image.jpg`
- URL: `https://your-backend.com/images/categories/TopLine/hero-image.jpg`

## Database Storage

Category images are stored in the database as:
- `Category.image` - Main category image path
- `Category.heroImage` - Hero/banner image path

The paths stored should be relative to the `/images/categories/` route:
- Example: `TopLine/hero-image.jpg` (not full path)

## Automatic Folder Creation

On server startup, all category folders are automatically created:
- `TopLine/`
- `MaxLine/`
- `ProLine/`
- `Open/`
- `SportLine/`

## Frontend Usage

When uploading a category image from the frontend:

```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'categories');
formData.append('categoryName', 'TopLine'); // or 'TopLine 650', etc.

// The backend will automatically map to the correct folder
```

## Benefits

1. **Organized Structure**: All images for a category type are in one place
2. **Easy Management**: Clear separation between category types
3. **Scalable**: Easy to add new category types
4. **Consistent**: All categories of the same type share the same folder

## Notes

- The mapping is case-insensitive and handles variations
- If a category name doesn't match any known type, it uses the category name as-is
- Folders are created automatically if they don't exist
- Images persist until server restart/redeploy (see RENDER_STORAGE_ISSUE.md for cloud storage solution)

