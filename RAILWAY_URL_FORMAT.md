# Railway DATABASE_URL Format

## Yes, `hopper.proxy.rlwy.net` is Railway's Public Proxy URL

Railway uses proxy URLs like `hopper.proxy.rlwy.net` for public database access.

## Complete DATABASE_URL Format

Your DATABASE_URL should be in this format:

```
postgresql://USERNAME:PASSWORD@hopper.proxy.rlwy.net:PORT/DATABASE
```

### Example:
```
postgresql://postgres:abc123xyz@hopper.proxy.rlwy.net:47241/railway
```

## Components:

1. **Protocol:** `postgresql://`
2. **Username:** Usually `postgres`
3. **Password:** Your database password
4. **Host:** `hopper.proxy.rlwy.net` (Railway's proxy)
5. **Port:** Usually `47241` or similar
6. **Database:** Usually `railway`

## How to Get the Complete URL

### From Railway Dashboard:

1. Go to Railway dashboard
2. Click your **PostgreSQL** service
3. Go to **Variables** tab
4. Find `DATABASE_URL` or `DATABASE_PUBLIC_URL`
5. Click the **eye icon** (👁️) to reveal the full URL
6. Copy the **entire URL** (it should include username, password, host, port, database)

### The URL Should Look Like:

```
postgresql://postgres:your_password_here@hopper.proxy.rlwy.net:47241/railway
```

## Set It in PowerShell

```powershell
$env:DATABASE_URL="postgresql://postgres:your_password@hopper.proxy.rlwy.net:47241/railway"
```

**Replace:**
- `your_password` with your actual password
- `47241` with your actual port (if different)

## Verify Connection

After setting DATABASE_URL:

```powershell
# Test connection
npm run test:db

# If successful, run migrations
npx prisma migrate deploy
```

## Troubleshooting

### If connection still fails:

1. **Check the URL is complete:**
   - Should start with `postgresql://`
   - Should include `@` before the host
   - Should include `:` before the port
   - Should include `/` before the database name

2. **Try Railway Dashboard Shell instead:**
   - Most reliable method
   - No connection issues
   - Database is pre-configured

3. **Check database is running:**
   - Railway dashboard → PostgreSQL service
   - Status should be "Active"

## Quick Test

```powershell
# Set URL (replace with your actual values)
$env:DATABASE_URL="postgresql://postgres:PASSWORD@hopper.proxy.rlwy.net:47241/railway"

# Test
npm run test:db
```

If this works, you're good to go! ✅
