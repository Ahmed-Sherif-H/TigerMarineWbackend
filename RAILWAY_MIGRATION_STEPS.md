# Steps to Add interiorMainImage Column on Railway

## Step 1: Create Migration Locally

First, create the migration on your local machine:

```bash
npx prisma migrate dev --name add_interior_main_image_back
```

This will:
- Create a new migration file in `prisma/migrations/`
- Add the column to your **local** database
- Update Prisma Client

## Step 2: Commit and Push to GitHub

```bash
git add prisma/migrations
git commit -m "Add interiorMainImage column back"
git push
```

## Step 3: Run Migration on Railway (Use Dashboard Shell)

**Don't use Railway CLI from local machine** - it can't connect to internal URLs.

Instead, use **Railway Dashboard Shell**:

1. Go to Railway dashboard: https://railway.app
2. Click on your **Web Service** (not PostgreSQL)
3. Go to **Deployments** tab
4. Click on the **latest deployment**
5. Click **"Shell"** tab (next to "Logs")
6. Run:
   ```bash
   npx prisma migrate deploy
   ```

This will run all pending migrations, including the new one that adds `interiorMainImage`.

## Step 4: Verify Column Exists

In the same Railway Shell, test that the column exists:

```bash
# This should work without errors
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => console.log('✅ Connected - column should exist')).catch(e => console.error('❌ Error:', e.message));"
```

## Step 5: Import Data

Now that the column exists, import your data:

**In Railway Shell:**
```bash
npm run import:exported database-export.json
```

Or if you need to upload the file first, you can:
1. Push `database-export.json` to GitHub (temporarily)
2. Then in Railway Shell: `npm run import:exported database-export.json`

## Why Dashboard Shell?

- ✅ Runs **inside Railway's environment**
- ✅ Has access to internal database URLs
- ✅ No connection issues
- ✅ Pre-configured environment

## Alternative: Add Column Directly (Quick Fix)

If you want to skip the migration file, you can add the column directly:

**In Railway Dashboard Shell:**
```bash
# Connect to database and add column
psql $DATABASE_URL -c "ALTER TABLE \"Model\" ADD COLUMN IF NOT EXISTS \"interiorMainImage\" TEXT;"

# Regenerate Prisma Client
npx prisma generate
```

Then import data as in Step 5.

## Complete Workflow Summary

1. ✅ Create migration locally: `npx prisma migrate dev --name add_interior_main_image_back`
2. ✅ Push to GitHub: `git add . && git commit -m "..." && git push`
3. ✅ Run migration on Railway: Use Dashboard Shell → `npx prisma migrate deploy`
4. ✅ Import data: Railway Shell → `npm run import:exported database-export.json`

After this, `interiorMainImage` will work on Railway! 🎉
