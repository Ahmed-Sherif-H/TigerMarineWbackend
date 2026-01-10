# Fix: .env File Overriding Environment Variable

## The Problem

Prisma is reading `DATABASE_URL` from your `.env` file instead of the environment variable you set.

The error shows:
```
at "postgres.railway.internal:5432"
```

This is the **internal** Railway URL from your `.env` file, not the public URL you set.

## Why This Happens

When you run `npx prisma migrate deploy`, Prisma:
1. Loads `.env` file first (via `dotenv`)
2. Uses `DATABASE_URL` from `.env`
3. Ignores your environment variable

## Solution 1: Comment Out DATABASE_URL in .env (Recommended)

1. Open your `.env` file
2. Find the line with `DATABASE_URL`
3. **Comment it out** by adding `#` at the start:
   ```env
   # DATABASE_URL="postgresql://postgres:password@postgres.railway.internal:5432/railway"
   ```

4. Save the file
5. Set your environment variable:
   ```powershell
   $env:DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway"
   ```

6. Run migrations:
   ```powershell
   npx prisma migrate deploy
   ```

## Solution 2: Use Railway Dashboard Shell (Easiest)

**This is the most reliable method - no .env conflicts:**

1. Go to Railway dashboard
2. Click your **Web Service**
3. Go to **Deployments** → Latest → **Shell** tab
4. Run:
   ```bash
   npx prisma migrate deploy
   npm run seed:all
   ```

**Why this works:** Railway shell has the correct DATABASE_URL pre-configured, and no .env file conflicts.

## Solution 3: Temporarily Rename .env

```powershell
# Rename .env to .env.local (temporarily)
Rename-Item .env .env.local

# Set your Railway URL
$env:DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway"

# Run migrations
npx prisma migrate deploy

# Rename back
Rename-Item .env.local .env
```

## Solution 4: Use --skip-env-check (Not Recommended)

```powershell
# This skips .env file loading
npx prisma migrate deploy --skip-env-check
```

But you still need DATABASE_URL set as environment variable.

## Recommended Approach

**For Railway, use Dashboard Shell:**
- ✅ No .env conflicts
- ✅ Always works
- ✅ Pre-configured
- ✅ Most reliable

## Quick Fix Right Now

1. **Comment out DATABASE_URL in .env:**
   ```env
   # DATABASE_URL=...
   ```

2. **Set environment variable:**
   ```powershell
   $env:DATABASE_URL="your-railway-public-url"
   ```

3. **Run migrations:**
   ```powershell
   npx prisma migrate deploy
   ```

Or just use Railway Dashboard Shell - it's easier! 🚀
