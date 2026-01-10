# Railway Database Connection Fix

## Problem

When running `railway run npx prisma migrate deploy`, you get:
```
Error: P1001: Can't reach database server at `postgres.railway.internal:5432`
```

## Why This Happens

Railway CLI tries to use the internal database URL (`postgres.railway.internal`), which is only accessible from within Railway's network, not from your local machine.

## ✅ Solution: Use Railway Dashboard Shell (Easiest)

**This is the recommended way for first-time setup:**

1. **Go to Railway Dashboard:**
   - https://railway.app
   - Click on your **Web Service** (not the database)

2. **Open Shell:**
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Click **"View Logs"** → **"Shell"** tab

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   npm run seed:all
   ```

This runs commands directly in Railway's environment where the database is accessible.

## Alternative: Update Build Command

I've updated `railway.json` to automatically run migrations during build. This means:

1. **First deployment:** Migrations will run automatically
2. **After first deploy:** You can remove `npx prisma migrate deploy` from build command

**Current railway.json:**
```json
"buildCommand": "npm install && npx prisma generate && npx prisma migrate deploy"
```

**After first successful deploy, you can change it to:**
```json
"buildCommand": "npm install && npx prisma generate"
```

## Steps to Deploy

### Option 1: Let Railway Auto-Deploy (Recommended)

1. **Push your code** (already done ✅)
2. **Railway will automatically:**
   - Detect the push
   - Run build command (includes migrations)
   - Deploy your service
3. **After deployment succeeds:**
   - Migrations are done ✅
   - Run seeding via dashboard shell:
     ```bash
     npm run seed:all
     ```

### Option 2: Manual Deploy + Shell

1. **Trigger deployment** in Railway dashboard
2. **Wait for it to complete** (may fail if migrations needed)
3. **Use dashboard shell** to run:
   ```bash
   npx prisma migrate deploy
   npm run seed:all
   ```
4. **Redeploy** if needed

## Verify It Works

After migrations run, check:

1. **Railway logs** - should show migration success
2. **Test API:**
   - `https://your-app.railway.app/api/health`
   - `https://your-app.railway.app/api/models`

## Quick Checklist

- [ ] Code pushed to GitHub ✅
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables set (DATABASE_URL auto-set by Railway)
- [ ] Deployment triggered (or auto-deployed)
- [ ] Migrations run (via build command or shell)
- [ ] Database seeded (via shell: `npm run seed:all`)
- [ ] API tested

## Next Steps

1. **Let Railway deploy** with the updated `railway.json` (migrations included)
2. **If deployment succeeds:** Run `npm run seed:all` via dashboard shell
3. **If deployment fails:** Check logs, then run migrations via shell
4. **Test your API** endpoints

The updated `railway.json` should handle migrations automatically on the first deploy!

