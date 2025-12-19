# Data Migration Guide

## Current Situation
- ✅ Backend API is working
- ✅ Database is set up
- ✅ All tables created
- ❌ Database is empty (no data yet)
- ✅ Frontend has all the data in `models.js`

## Migration Options

### Option 1: Export from AdminDashboard (RECOMMENDED) ⭐

**Why this is best:**
- Uses the actual processed data from frontend
- Handles all edge cases
- Easy to verify before importing
- Can be done incrementally

**Steps:**
1. Make sure frontend is running: `cd frontend && npm run dev`
2. Open AdminDashboard: http://localhost:5173/admin
3. Go to "Export Data" tab
4. Click "Export All Models" button
5. Save the JSON file (e.g., `all-models-data.json`)
6. Import to database:
   ```bash
   cd backend
   npm run import:json ../frontend/downloads/all-models-data.json
   ```
   (Adjust path to where you saved the file)

### Option 2: Direct Migration Script

**Steps:**
1. Run categories migration:
   ```bash
   cd backend
   node scripts/migrateDirect.js
   ```
   This will import categories first.

2. Then export models from AdminDashboard and import JSON (as in Option 1)

### Option 3: Manual Import via API

Use Postman or curl to create models one by one via API endpoints.

## Verification

After migration, verify data:

1. **Check in Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   Opens at http://localhost:5555

2. **Check via API:**
   ```bash
   curl http://localhost:3001/api/models
   curl http://localhost:3001/api/categories
   ```

3. **Count records:**
   - Should have 5 categories (MaxLine, TopLine, ProLine, SportLine, Open)
   - Should have ~12 models total

## Troubleshooting

**If import fails:**
- Check JSON file format is valid
- Verify categories exist first
- Check categoryId in model data matches database
- Look at error messages in terminal

**If data looks wrong:**
- Check Prisma Studio to see what was imported
- Delete and re-import if needed
- Verify source data in AdminDashboard export

## Next Steps After Migration

1. ✅ Data migrated to database
2. Update frontend to use API instead of models.js
3. Test all CRUD operations
4. Add authentication for admin routes


