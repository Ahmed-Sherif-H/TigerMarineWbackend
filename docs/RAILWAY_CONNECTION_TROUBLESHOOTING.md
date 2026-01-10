# Railway Database Connection Troubleshooting

## Error: Can't reach database server

If you're getting connection errors like:
```
Error: P1001: Can't reach database server at `hopper.proxy.rlwy.net:47241`
```

## Possible Causes

### 1. Database Service Not Running
- Check Railway dashboard → PostgreSQL service
- Make sure it's **running** (status should be "Active")

### 2. Network/Firewall Issue
- Railway's proxy URLs might be blocked by your network
- Try from a different network (mobile hotspot, etc.)
- Or use Railway Dashboard Shell (most reliable)

### 3. Wrong DATABASE_URL Format
- Make sure you copied the **entire URL**
- Should start with `postgresql://`
- Should include username, password, host, port, and database

### 4. Database Not Publicly Accessible
- Some Railway databases might only be accessible internally
- Use Railway Dashboard Shell instead

## Solutions

### Solution 1: Use Railway Dashboard Shell (Recommended)

**This is the most reliable method:**

1. Go to Railway dashboard
2. Click your **Web Service** (not database)
3. Go to **Deployments** → Latest → **Shell** tab
4. Run commands there:
   ```bash
   npx prisma migrate deploy
   npm run seed:all
   ```

**Why this works:** The shell runs inside Railway's network where the database is accessible.

### Solution 2: Check Database Status

1. Go to Railway dashboard
2. Click your **PostgreSQL** service
3. Check status - should be **"Active"**
4. If not running, start it

### Solution 3: Verify DATABASE_URL

Make sure your DATABASE_URL is correct:

```powershell
# Check if it's set
$env:DATABASE_URL

# Should look like:
# postgresql://postgres:password@host:port/database
```

### Solution 4: Try Different Network

If you're on a corporate network or VPN:
- Try disconnecting VPN
- Try from mobile hotspot
- Or use Railway Dashboard Shell (works from anywhere)

### Solution 5: Use Railway's Public URL

1. Go to Railway dashboard → PostgreSQL service
2. Go to **Connect** tab (not Variables)
3. Look for **"Public Networking"** section
4. Copy the **public connection string**
5. Use that instead

## Best Practice

**For Railway, always use Dashboard Shell for database operations:**
- ✅ Most reliable
- ✅ Always works
- ✅ No network issues
- ✅ Environment variables pre-set

## Quick Test

Try this to verify connection:

```powershell
# Test connection
npm run test:db
```

If this fails, use Railway Dashboard Shell instead.
