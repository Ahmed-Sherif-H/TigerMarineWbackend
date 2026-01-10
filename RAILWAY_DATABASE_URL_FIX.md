# Fix: DATABASE_URL Not Found at Runtime

## Problem

Server crashes with:
```
Environment variable not found: DATABASE_URL
```

This means `DATABASE_URL` is not set in your **Web Service** environment variables.

## Solution: Set DATABASE_URL in Web Service

### Step 1: Go to Your Web Service (Not Database Service)

1. Go to Railway dashboard: https://railway.app
2. Click on your **Web Service** (the Node.js backend service)
   - ⚠️ **NOT** the PostgreSQL service
   - It should be the service running your backend

### Step 2: Go to Variables Tab

1. In your Web Service, click **"Variables"** tab
2. You should see a list of environment variables

### Step 3: Add DATABASE_URL

**Option A: Use Railway Template Variable (Recommended)**

1. Click **"+ New Variable"** or **"Add Variable"**
2. Set:
   - **Name:** `DATABASE_URL`
   - **Value:** `${{Postgres.DATABASE_URL}}`
3. Click **"Add"** or **"Save"**

**Option B: Use Manual URL (If template doesn't work)**

1. Go to your **PostgreSQL** service (not Web Service)
2. Click **"Variables"** tab
3. Find `DATABASE_URL` or `DATABASE_PUBLIC_URL`
4. Click the **eye icon** (👁️) to reveal the value
5. **Copy the entire URL**
6. Go back to your **Web Service** → **Variables** tab
7. Click **"+ New Variable"**
8. Set:
   - **Name:** `DATABASE_URL`
   - **Value:** (paste the URL you copied)
9. Click **"Add"** or **"Save"**

### Step 4: Verify Variable is Set

In your Web Service → Variables tab, you should see:
```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
```
or
```
DATABASE_URL = postgresql://postgres:password@host:port/database
```

### Step 5: Redeploy

After setting the variable:

1. Railway will automatically redeploy, OR
2. Go to **Deployments** tab → Click **"Redeploy"**

## Important Notes

### ⚠️ Common Mistakes

1. **Setting in wrong service:**
   - ❌ Setting in PostgreSQL service
   - ✅ Must set in **Web Service**

2. **Wrong variable name:**
   - ❌ `DATABASE_PUBLIC_URL`
   - ❌ `DB_URL`
   - ✅ `DATABASE_URL` (exact name)

3. **Template variable syntax:**
   - ✅ `${{Postgres.DATABASE_URL}}`
   - ❌ `$Postgres.DATABASE_URL` (missing double braces)
   - ❌ `{{Postgres.DATABASE_URL}}` (missing $)

### ✅ Correct Setup

Your Web Service should have these variables:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.netlify.app
```

## Verify It's Working

After redeploy, check the logs. You should see:
- ✅ `✅ Database connection successful!`
- ✅ `🚀 Server running on port 3001`
- ❌ No more `DATABASE_URL not found` errors

## Still Not Working?

1. **Check service linking:**
   - In Web Service → **Settings** → **Connected Services**
   - Make sure PostgreSQL is connected/linked

2. **Try manual URL:**
   - Get the full URL from PostgreSQL service
   - Set it manually in Web Service

3. **Check variable scope:**
   - Make sure variable is set at **Service level** (not Project level)
   - Service-level variables override project-level

4. **Restart service:**
   - After setting variable, manually restart the service
