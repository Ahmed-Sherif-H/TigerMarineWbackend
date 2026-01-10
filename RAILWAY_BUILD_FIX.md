# Fix: Railway Build Fails - DATABASE_URL Not Found

## Problem

Railway build fails with:
```
Error: Environment variable not found: DATABASE_URL
```

This happens because `npx prisma migrate deploy` requires `DATABASE_URL`, but environment variables might not be available during the build phase.

## Solution

**Removed `npx prisma migrate deploy` from build command** because:
1. Migrations need `DATABASE_URL` which may not be available during build
2. Migrations should run **after** deployment, not during build
3. `prisma generate` doesn't need `DATABASE_URL` and can run during build

## Updated Build Command

The `railway.json` now uses:
```json
{
  "buildCommand": "npm install && npx prisma generate"
}
```

This will:
- ✅ Install dependencies
- ✅ Generate Prisma Client (no DATABASE_URL needed)
- ❌ Skip migrations (run them after deployment)

## Next Steps: Run Migrations After Deployment

After Railway successfully builds and deploys, you need to run migrations:

### Option 1: Railway Dashboard Shell (Easiest)

1. Go to Railway dashboard → Your Web Service
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Click **"Shell"** tab
5. Run:
   ```bash
   npx prisma migrate deploy
   npm run seed:all
   ```

### Option 2: Railway CLI

```bash
railway run npx prisma migrate deploy
railway run npm run seed:all
```

## Why This Works

- **Build Phase**: Only needs to generate Prisma Client (no database connection needed)
- **Runtime Phase**: DATABASE_URL is available, so migrations can run
- **Best Practice**: Separates build concerns from database operations

## Verify It Works

1. **Check build succeeds** - Should see:
   ```
   ✔ Generated Prisma Client
   ```

2. **After deployment, run migrations** - Should see:
   ```
   Applying migration `20251210011826_init`
   ...
   ✅ All migrations applied
   ```

3. **Test your API** - Should work normally

## Important Notes

- ✅ `DATABASE_URL` must still be set in Railway Variables (for runtime)
- ✅ Use `${{Postgres.DATABASE_URL}}` template variable if possible
- ✅ Migrations run once after first deployment
- ✅ Future deployments won't need migrations (unless schema changes)
