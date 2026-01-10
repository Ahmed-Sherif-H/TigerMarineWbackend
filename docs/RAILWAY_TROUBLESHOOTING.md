# Railway Troubleshooting Guide

## Issue: Can't reach database server at `postgres.railway.internal:5432`

This error occurs when Railway CLI tries to use the internal database URL, which may not be accessible from your local machine.

## Solutions

### Solution 1: Use Public DATABASE_URL (Recommended)

Instead of using `railway run`, connect directly using the public DATABASE_URL:

1. **Get your Railway DATABASE_URL:**
   - Go to Railway dashboard
   - Click on your PostgreSQL service
   - Go to **Variables** tab
   - Copy the `DATABASE_URL` value (it should be a public URL, not `postgres.railway.internal`)

2. **Set it locally and run:**
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="postgresql://user:password@host:port/database"
   npx prisma migrate deploy
   
   # Or create a temporary .env.railway file
   ```

### Solution 2: Use Railway Dashboard Shell

1. Go to Railway dashboard
2. Click on your **Web Service** (not database)
3. Go to **Deployments** tab
4. Click on the latest deployment
5. Click **"View Logs"** → **"Shell"** tab
6. Run commands directly in Railway's environment:
   ```bash
   npx prisma migrate deploy
   npm run seed:all
   ```

### Solution 3: Fix Railway CLI Link

Make sure Railway CLI is properly linked:

```bash
# Check current project
railway status

# If not linked, link to your project
railway link

# Select your project when prompted
```

### Solution 4: Use Railway's Public URL

Railway provides both internal and public URLs. Make sure you're using the public one:

1. Go to Railway dashboard → PostgreSQL service
2. Go to **Variables** tab
3. Check `DATABASE_URL` - it should be a public URL like:
   ```
   postgresql://user:pass@containers-us-west-xxx.railway.app:5432/railway
   ```
   NOT:
   ```
   postgresql://user:pass@postgres.railway.internal:5432/railway
   ```

4. If it's internal, you can:
   - Use the public URL from the **Connect** tab
   - Or use Railway dashboard shell (Solution 2)

## Recommended Approach for First-Time Setup

### Step 1: Deploy to Railway First

Let Railway deploy your code first (it will fail, but that's OK).

### Step 2: Run Migrations via Dashboard Shell

1. Go to Railway dashboard → Your Web Service
2. **Deployments** → Latest deployment → **View Logs** → **Shell**
3. Run:
   ```bash
   npx prisma migrate deploy
   npm run seed:all
   ```

### Step 3: Redeploy

After migrations succeed, trigger a new deployment or wait for auto-deploy.

## Alternative: Add Migrations to Build Command

You can temporarily add migrations to your build command:

1. Go to Railway dashboard → Your service → **Settings**
2. Find **Build Command** (if it exists)
3. Or create `railway.json` with:
   ```json
   {
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "npm install && npx prisma generate && npx prisma migrate deploy"
     }
   }
   ```

**Note:** This runs migrations on every deploy. Remove `npx prisma migrate deploy` after first successful deployment.

## Verify Database Connection

Test if you can connect:

```bash
# Using Railway CLI (if properly linked)
railway run npm run test:db

# Or using public URL directly
DATABASE_URL="your-public-url" npm run test:db
```

## Common Issues

### Issue: "railway: command not found"
**Solution:** Install Railway CLI:
```bash
npm i -g @railway/cli
railway login
```

### Issue: "Not linked to a project"
**Solution:**
```bash
railway link
# Select your project when prompted
```

### Issue: Internal URL not accessible
**Solution:** Use Railway dashboard shell or public DATABASE_URL

## Best Practice

For production:
1. ✅ Use Railway dashboard shell for one-time migrations
2. ✅ Let Railway auto-deploy handle code updates
3. ✅ Keep migrations in git (already done)
4. ✅ Railway will run migrations automatically if configured

