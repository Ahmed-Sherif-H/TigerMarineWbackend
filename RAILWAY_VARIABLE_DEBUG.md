# Debug: DATABASE_URL Still Not Found

## The Problem

Even after setting `DATABASE_URL` in Railway, Prisma still can't find it. This suggests the variable isn't being passed to the runtime environment.

## Common Causes

### 1. Variable Set in Wrong Place

Railway has two levels:
- **Project-level variables** (shared across services)
- **Service-level variables** (specific to one service)

**Solution:** Make sure `DATABASE_URL` is set in your **Web Service** variables, not just project-level.

### 2. PostgreSQL Service Name Mismatch

The template `${{Postgres.DATABASE_URL}}` requires your PostgreSQL service to be named exactly **"Postgres"**.

**Check:**
1. Go to Railway dashboard
2. Look at your PostgreSQL service name
3. If it's not "Postgres", either:
   - Rename it to "Postgres", OR
   - Use the manual URL instead

### 3. Services Not Linked

The template variable only works if services are linked.

**Check:**
1. Go to your **Web Service** → **Settings**
2. Look for **"Connected Services"** or **"Service Dependencies"**
3. Make sure PostgreSQL is listed/connected

### 4. Variable Not Saved/Redeployed

After setting the variable, Railway needs to redeploy.

**Solution:**
1. After setting variable, manually trigger redeploy
2. Go to **Deployments** → Click **"Redeploy"**

## Step-by-Step Fix

### Step 1: Verify Service Names

1. Go to Railway dashboard
2. Note your PostgreSQL service name (e.g., "Postgres", "PostgreSQL", "Database")
3. Note your Web Service name

### Step 2: Set Variable in Web Service (Not Project Level)

1. Click on your **Web Service** (the Node.js backend)
2. Click **"Variables"** tab
3. Look for `DATABASE_URL` in the list
4. If it's not there, click **"+ New Variable"**
5. Set:
   - **Name:** `DATABASE_URL`
   - **Value:** Use one of these options:

**Option A: If PostgreSQL service is named "Postgres":**
```
${{Postgres.DATABASE_URL}}
```

**Option B: If PostgreSQL service has different name:**
1. Go to PostgreSQL service → **Variables** tab
2. Find `DATABASE_URL` or `DATABASE_PUBLIC_URL`
3. Click eye icon to reveal
4. Copy the full URL
5. Paste it as the value in Web Service

**Option C: Manual URL (Always works):**
```
postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway
```
(Replace with your actual URL)

### Step 3: Verify Variable is Set

In Web Service → Variables tab, you should see:
```
DATABASE_URL = [your value here]
```

### Step 4: Link Services (If Using Template)

1. Go to Web Service → **Settings**
2. Look for **"Connected Services"** or **"Service Dependencies"**
3. If PostgreSQL is not listed:
   - Click **"Connect Service"** or **"Add Dependency"**
   - Select your PostgreSQL service

### Step 5: Force Redeploy

1. Go to Web Service → **Deployments** tab
2. Click **"Redeploy"** button
3. Wait for deployment to complete

### Step 6: Check Logs

After redeploy, check logs. You should see:
- ✅ `✅ Database connected successfully`
- ❌ No more `DATABASE_URL not found` errors

## Alternative: Add Debug Logging

If it still doesn't work, we can add logging to see what environment variables are available:

```javascript
// In server.js, before connecting to database
console.log('🔍 Environment variables check:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
console.log('All env vars starting with DB:', 
  Object.keys(process.env).filter(k => k.includes('DB')));
```

## Quick Checklist

- [ ] Variable set in **Web Service** (not project level)
- [ ] Variable name is exactly `DATABASE_URL` (case-sensitive)
- [ ] PostgreSQL service is linked to Web Service
- [ ] If using template, PostgreSQL service is named "Postgres"
- [ ] Redeployed after setting variable
- [ ] Checked logs for connection success

## Still Not Working?

Try this diagnostic:

1. **Add this to server.js temporarily** (before database connection):
   ```javascript
   console.log('🔍 DATABASE_URL check:');
   console.log('Exists:', !!process.env.DATABASE_URL);
   console.log('Value:', process.env.DATABASE_URL ? '***SET***' : 'NOT SET');
   console.log('All DB vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')));
   ```

2. **Redeploy and check logs** - This will show if the variable is reaching the runtime.

3. **If variable shows as NOT SET:**
   - Double-check it's in Web Service variables
   - Try setting it manually with full URL
   - Check if there's a typo in variable name

4. **If variable shows as SET but Prisma still fails:**
   - Check the URL format is correct
   - Verify database is accessible
   - Check if URL needs to be URL-encoded
