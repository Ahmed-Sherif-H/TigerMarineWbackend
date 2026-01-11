# How to Populate Railway Database from Local Database

This guide will help you export your local database and import it to Railway, then remove all video file records.

## Step 1: Export Local Database

1. **Make sure you're connected to your local database:**
   - Check your `.env` file has local `DATABASE_URL`
   - Or set it: `$env:DATABASE_URL="postgresql://postgres:password@localhost:5432/tigermarine"`

2. **Run the export script:**
   ```bash
   npm run export:db database-export.json
   ```
   
   This will create `database-export.json` in your backend root folder.

3. **Verify the export:**
   - Check that `database-export.json` was created
   - It should contain all your categories, models, specs, features, etc.
   - **Note:** Video files are NOT exported (they'll be removed)

## Step 2: Remove Video Files from Local Database (Optional)

If you want to clean up your local database too:

```bash
npm run remove:videos
```

This removes all `VideoFile` records from the database (not the actual files).

## Step 3: Import to Railway Database

### Option A: Using Railway Dashboard Shell (Recommended)

1. **Upload the export file:**
   - You'll need to get `database-export.json` to Railway
   - Options:
     - Push it to GitHub (temporarily)
     - Or copy/paste the content via Railway Shell

2. **Go to Railway Dashboard Shell:**
   - Railway dashboard → Your Web Service
   - Deployments → Latest → Shell tab

3. **Run import:**
   ```bash
   # Use the import script for exported format
   npm run import:exported database-export.json
   ```

### Option B: Using Railway CLI

1. **Set Railway DATABASE_URL locally:**
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway"
   ```

2. **Run import:**
   ```bash
   npm run import:exported database-export.json
   ```

### Option C: Manual Import via Railway Shell

1. **Copy the JSON content:**
   - Open `database-export.json`
   - Copy all the content

2. **Go to Railway Shell:**
   - Railway dashboard → Web Service → Deployments → Shell

3. **Create and import:**
   ```bash
   # Create the file (you'll paste content)
   cat > database-export.json << 'EOF'
   [paste your JSON content here]
   EOF
   
   # Then import
   npm run import:exported database-export.json
   ```

## Step 4: Remove Video Files from Railway Database

After importing, remove all video file records:

### Using Railway Dashboard Shell:

1. Go to Railway dashboard → Web Service → Deployments → Shell
2. Run:
   ```bash
   npm run remove:videos
   ```

### Using Railway CLI:

```bash
railway run npm run remove:videos
```

## Step 5: Seed Admin User (If Needed)

If you need to create an admin user on Railway:

```bash
# Railway Shell
npm run prisma:seed

# Or Railway CLI
railway run npm run prisma:seed
```

## Complete Workflow Summary

```bash
# 1. Export from local (make sure DATABASE_URL points to local)
npm run export:db database-export.json

# 2. Remove videos from local (optional)
npm run remove:videos

# 3. Import to Railway (via Railway Shell or CLI)
# Set Railway DATABASE_URL, then:
npm run import:exported database-export.json

# 4. Remove videos from Railway
npm run remove:videos

# 5. Seed admin (if needed)
npm run prisma:seed
```

## Important Notes

- ✅ **Video files are NOT exported** - the export script excludes them
- ✅ **Video records are removed** - both locally and on Railway
- ✅ **Video files in filesystem** - you'll delete those manually
- ✅ **YouTube links** - can be added later through the admin dashboard

## Troubleshooting

### Export fails:
- Check `DATABASE_URL` points to local database
- Verify database is running
- Check file permissions

### Import fails:
- Verify `DATABASE_URL` points to Railway database
- Check JSON file format is valid
- Make sure migrations are run on Railway first

### Video removal fails:
- Check database connection
- Verify VideoFile table exists

## Next Steps

After populating Railway:
1. ✅ Test API endpoints
2. ✅ Verify models and categories are loaded
3. ✅ Check admin login works
4. ✅ Manually delete video files from `public/images/[ModelName]/` folders
5. ✅ Add YouTube links through admin dashboard when ready
