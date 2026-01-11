# Add interiorMainImage Column to Railway Database

## The Problem

Your Prisma schema has `interiorMainImage` field, but Railway database doesn't have this column because:
1. Migration `20260108021008_add_interior_main_image` added it
2. Migration `20260108040000_remove_interior_main_image` removed it
3. But the schema still has it, so we need to add it back

## Solution: Create and Run Migration

### Step 1: Create New Migration Locally

Run this command to create a migration that adds the column back:

```bash
npx prisma migrate dev --name add_interior_main_image_back
```

This will:
- Create a new migration file
- Add the column to your local database
- Update Prisma Client

### Step 2: Push Migration to Railway

After creating the migration, push it to Railway:

**Option A: Railway Dashboard Shell (Recommended)**

1. Go to Railway dashboard → Your Web Service
2. Go to Deployments → Latest → Shell tab
3. Run:
   ```bash
   npx prisma migrate deploy
   ```

**Option B: Railway CLI**

```bash
railway run npx prisma migrate deploy
```

### Step 3: Verify Column Exists

After running migrations, verify the column exists:

**In Railway Shell:**
```bash
# Test that Prisma can query the column
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.model.findFirst({ select: { interiorMainImage: true } }).then(() => console.log('✅ Column exists')).catch(e => console.error('❌ Error:', e.message));"
```

### Step 4: Import Data

Now that the column exists, import your data:

```bash
# In Railway Shell or CLI
npm run import:exported database-export.json
```

## Alternative: Quick Fix Without Migration

If you want to add the column directly without creating a migration file:

**In Railway Shell:**
```sql
ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "interiorMainImage" TEXT;
```

Then regenerate Prisma Client:
```bash
npx prisma generate
```

## Recommended Workflow

1. ✅ **Create migration locally:**
   ```bash
   npx prisma migrate dev --name add_interior_main_image_back
   ```

2. ✅ **Commit and push to GitHub:**
   ```bash
   git add prisma/migrations
   git commit -m "Add interiorMainImage column back"
   git push
   ```

3. ✅ **Run migrations on Railway:**
   - Railway Shell: `npx prisma migrate deploy`
   - Or Railway CLI: `railway run npx prisma migrate deploy`

4. ✅ **Import data:**
   ```bash
   npm run import:exported database-export.json
   ```

## Why This Approach?

- ✅ Keeps migrations in sync
- ✅ Railway will have the column
- ✅ Import will work with interiorMainImage
- ✅ Future deployments will include the column

## After Import

Once data is imported, the `interiorMainImage` field will work correctly on Railway, and you can use it in your admin dashboard.
