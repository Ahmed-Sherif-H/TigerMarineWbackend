# Fix: DATABASE_URL Not Found - Step by Step

## The Issue

You mentioned setting it in "shared variables" - that might be the problem! Railway has:
- **Project-level variables** (shared across all services)
- **Service-level variables** (specific to one service)

**The variable MUST be set in your Web Service, not just project-level!**

## Step-by-Step Fix

### Step 1: Go to Your Web Service

1. Go to Railway dashboard: https://railway.app
2. **Click on your Web Service** (the Node.js backend service)
   - This is the service running your backend
   - NOT the PostgreSQL service
   - NOT the project settings

### Step 2: Check Variables Tab

1. In your **Web Service**, click **"Variables"** tab
2. Look for `DATABASE_URL` in the list

### Step 3: Add DATABASE_URL (If Not There)

If `DATABASE_URL` is NOT in the list:

1. Click **"+ New Variable"** or **"Add Variable"** button
2. Set:
   - **Name:** `DATABASE_URL` (exact, case-sensitive)
   - **Value:** Choose one:

**Option A: Template Variable (If PostgreSQL service is named "Postgres")**
```
${{Postgres.DATABASE_URL}}
```

**Option B: Manual URL (Always works - Recommended)**
1. Go to your **PostgreSQL** service → **Variables** tab
2. Find `DATABASE_URL` or `DATABASE_PUBLIC_URL`
3. Click the **eye icon** (👁️) to reveal the value
4. **Copy the ENTIRE URL** (should look like: `postgresql://postgres:password@host:port/database`)
5. Go back to your **Web Service** → **Variables** tab
6. Paste it as the value

### Step 4: Verify It's Set

In your Web Service → Variables tab, you should see:
```
DATABASE_URL = [your value]
```

**Important:** Make sure it's in the **Web Service** variables, not just project-level!

### Step 5: Link Services (If Using Template)

If you used `${{Postgres.DATABASE_URL}}`:

1. Go to Web Service → **Settings** tab
2. Look for **"Connected Services"** or **"Service Dependencies"**
3. If PostgreSQL is not listed:
   - Click **"Connect Service"** or **"Add Dependency"**
   - Select your PostgreSQL service

### Step 6: Force Redeploy

1. Go to Web Service → **Deployments** tab
2. Click **"Redeploy"** button (or wait for auto-redeploy)
3. Wait for deployment to complete

### Step 7: Check Logs

After redeploy, check the logs. You should see:
```
🔍 Environment variables check:
DATABASE_URL exists: true
DATABASE_URL length: [some number]
All DB-related vars: [ 'DATABASE_URL' ]
✅ Database connected successfully
🚀 Backend running on port 3001
```

If you see `DATABASE_URL exists: false`, the variable is still not set correctly.

## Common Mistakes

### ❌ Wrong: Setting in Project/Shared Variables Only
- Project-level variables might not be available to all services
- Always set in **Web Service** variables

### ❌ Wrong: Setting in PostgreSQL Service
- Variables in PostgreSQL service are for the database itself
- You need it in **Web Service** for your Node.js app

### ❌ Wrong: Wrong Service Name in Template
- `${{Postgres.DATABASE_URL}}` requires service named exactly "Postgres"
- If your service has a different name, use manual URL instead

### ✅ Correct: Set in Web Service Variables
- Go to **Web Service** → **Variables** tab
- Add `DATABASE_URL` there
- Use manual URL if template doesn't work

## Quick Checklist

- [ ] Went to **Web Service** (not PostgreSQL, not project settings)
- [ ] Clicked **"Variables"** tab in Web Service
- [ ] Added `DATABASE_URL` variable (exact name, case-sensitive)
- [ ] Set value (template or manual URL)
- [ ] Saved the variable
- [ ] Redeployed the service
- [ ] Checked logs for `DATABASE_URL exists: true`

## Still Not Working?

The debug logging I added will show in the logs:
- Whether `DATABASE_URL` exists
- What other DB-related variables are available
- The length of the variable (to verify it's not empty)

Check the Railway logs after redeploy and share what you see in the "Environment variables check" section.
