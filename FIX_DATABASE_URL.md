# Fix: DATABASE_PUBLIC_URL vs DATABASE_URL

## The Issue

You set `DATABASE_PUBLIC_URL`, but Prisma needs `DATABASE_URL` specifically.

Prisma looks for `DATABASE_URL` in your `schema.prisma` file:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ← Looking for this!
}
```

## Quick Fix

In PowerShell, run:

```powershell
# If you already set DATABASE_PUBLIC_URL, copy it to DATABASE_URL
$env:DATABASE_URL = $env:DATABASE_PUBLIC_URL

# Or set DATABASE_URL directly with your Railway URL
$env:DATABASE_URL="postgresql://postgres:password@host:port/database"
```

## Verify It's Set

```powershell
# Check if DATABASE_URL is set
$env:DATABASE_URL

# Should show your Railway database URL
```

## Then Run Migrations

```powershell
# Test connection
npm run test:db

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed:all
```

## Why This Happens

- Railway provides `DATABASE_PUBLIC_URL` as a variable name
- But Prisma specifically looks for `DATABASE_URL`
- You need to use `DATABASE_URL` for Prisma to work

## Solution

**Option 1: Set DATABASE_URL directly**
```powershell
$env:DATABASE_URL="your-railway-public-url-here"
```

**Option 2: Copy from DATABASE_PUBLIC_URL**
```powershell
$env:DATABASE_URL = $env:DATABASE_PUBLIC_URL
```

Both work! Just make sure `DATABASE_URL` is set. ✅
