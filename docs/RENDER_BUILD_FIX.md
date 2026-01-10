# Fix Render Build Error - Missing mainGroup Column

## Problem

Render deployment fails with:
```
The column `Category.mainGroup` does not exist in the current database.
```

## Root Cause

The Prisma schema has `mainGroup` field, but the database doesn't have this column because migrations weren't run.

## Solution

### Update Render Build Command

Go to Render Dashboard → Your Web Service → Settings → Build Command

**Change from:**
```bash
npm install && npx prisma generate && npm run seed:all
```

**Change to:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run seed:all
```

This will:
1. Install dependencies
2. Generate Prisma Client
3. **Run migrations** (adds `mainGroup` column)
4. Seed database

### After First Deploy

Once the first deployment succeeds, you can optionally remove `npx prisma migrate deploy` from the build command since migrations only need to run once (or when new migrations are added).

**Recommended for production:**
```bash
npm install && npx prisma generate
```

Then run migrations manually when needed via Render Shell:
```bash
npx prisma migrate deploy
```

## Migration Created

A new migration has been created:
- `prisma/migrations/20260110054733_add_main_group_to_category/migration.sql`

This migration adds the `mainGroup` column to the `Category` table.

## Verification

After updating the build command and redeploying:

1. Check Render logs - should see migration running
2. Check for errors - should not see "mainGroup does not exist"
3. Verify deployment succeeds
4. Test API endpoints

## Alternative: Remove mainGroup (Not Recommended)

If you don't need `mainGroup`, you could remove it from the schema, but this requires:
1. Removing from schema.prisma
2. Creating a migration to drop the column
3. Updating any code that uses it

Since the migration is already created, it's easier to just run it.

