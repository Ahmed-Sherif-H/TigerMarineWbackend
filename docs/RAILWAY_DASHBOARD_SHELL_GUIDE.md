# Railway Dashboard Shell - Step-by-Step Guide

## What is Railway Dashboard Shell?

The Railway Dashboard Shell is a terminal/command line interface that runs **inside Railway's environment**. This means:
- ✅ It has access to your database (internal URLs work)
- ✅ It has all your environment variables set
- ✅ It's the easiest way to run database commands

## Step-by-Step Instructions

### Step 1: Go to Railway Dashboard

1. Open your browser
2. Go to **https://railway.app**
3. **Login** to your account

### Step 2: Select Your Project

1. You'll see a list of your projects
2. **Click on the project** that contains your backend service
   - It should be named something like "TigerMarineWbackend" or similar

### Step 3: Select Your Web Service

1. In your project, you'll see your services listed:
   - Your **Web Service** (the Node.js backend)
   - Your **PostgreSQL** database service
2. **Click on your Web Service** (the one running your Node.js app)
   - NOT the PostgreSQL service
   - It might be named "web" or "api" or your repo name

### Step 4: Open Deployments Tab

1. At the top of the service page, you'll see tabs:
   - **Overview**
   - **Deployments** ← Click this one
   - **Metrics**
   - **Settings**
   - **Variables**
   - **Networking**

2. **Click on "Deployments"**

### Step 5: Select a Deployment

1. You'll see a list of deployments (each time you deploy, a new one is created)
2. **Click on the latest deployment** (usually the top one)
   - It will show status like "Building", "Deploying", or "Live"
   - Click on it to open details

### Step 6: Open Shell

1. In the deployment details page, you'll see:
   - **Logs** tab (default)
   - **Shell** tab ← Click this one
   - **Metrics** tab

2. **Click on "Shell" tab**

### Step 7: Use the Shell

1. You'll see a terminal/command prompt
2. You can now type commands just like in your local terminal
3. **Important:** This shell runs in Railway's environment, so:
   - Environment variables are already set
   - Database is accessible
   - You're in your project directory

## Example: Running Migrations

Once you're in the shell:

```bash
# Check you're in the right directory
pwd
# Should show something like: /app or /opt/render/project/src

# List files
ls

# Run Prisma migrations
npx prisma migrate deploy

# Seed the database
npm run seed:all

# Check database connection
npm run test:db
```

## Visual Guide (What You'll See)

```
Railway Dashboard
├── Projects
    └── Your Project
        ├── Web Service (Node.js) ← Click this
        │   ├── Overview
        │   ├── Deployments ← Click this
        │   │   └── Latest Deployment ← Click this
        │   │       ├── Logs tab
        │   │       ├── Shell tab ← Click this (YOU ARE HERE!)
        │   │       └── Metrics tab
        │   ├── Metrics
        │   ├── Settings
        │   ├── Variables
        │   └── Networking
        └── PostgreSQL Database
```

## Common Commands to Run

### First-Time Setup

```bash
# 1. Run database migrations
npx prisma migrate deploy

# 2. Seed the database
npm run seed:all

# 3. Verify it worked
npm run test:db
```

### Check Database

```bash
# Test connection
npm run test:db

# Check database contents
npm run check:db
```

### View Prisma Studio (Optional)

```bash
# This won't work in Railway shell (needs GUI)
# But you can check data via API instead
```

## Troubleshooting

### Issue: "Shell tab not visible"

**Possible reasons:**
- You're looking at the wrong service (make sure it's the Web Service, not Database)
- Deployment hasn't completed yet (wait for it to finish)
- Try refreshing the page

**Solution:**
1. Make sure deployment status is "Live" or "Deployed"
2. Click on the deployment again
3. Look for "Shell" tab next to "Logs"

### Issue: "Command not found"

**Solution:**
```bash
# Make sure you're in the project directory
pwd
ls

# If needed, navigate to project root
cd /app  # or wherever your code is
```

### Issue: "Can't connect to database"

**This shouldn't happen in Railway shell**, but if it does:
1. Check that PostgreSQL service is running
2. Verify DATABASE_URL is set (it should be auto-set by Railway)
3. Try: `echo $DATABASE_URL` (will show masked, but confirms it's set)

### Issue: "npx: command not found"

**Solution:**
```bash
# Use npm instead
npm exec prisma migrate deploy

# Or install globally first
npm install -g prisma
prisma migrate deploy
```

## Alternative: Using Railway CLI (Advanced)

If you prefer command line, you can use Railway CLI, but you need to get the public DATABASE_URL:

```bash
# Get DATABASE_URL from Railway dashboard
# Go to: Service → Variables → DATABASE_URL
# Copy the value

# Set it locally
export DATABASE_URL="postgresql://..."

# Run commands
npx prisma migrate deploy
npm run seed:all
```

**But dashboard shell is easier!** ✅

## Quick Reference

| Action | Location |
|--------|----------|
| Open Shell | Dashboard → Project → Web Service → Deployments → Latest → Shell tab |
| Run Migrations | In shell: `npx prisma migrate deploy` |
| Seed Database | In shell: `npm run seed:all` |
| Check Logs | Same page, but "Logs" tab instead of "Shell" |

## Tips

1. **Keep the shell open** while running commands to see output
2. **Commands run in real-time** - you'll see results immediately
3. **Environment variables are pre-set** - no need to configure
4. **Multiple shell sessions** - you can open multiple tabs/windows
5. **History works** - use arrow keys to repeat commands

## Next Steps After Using Shell

1. ✅ Run migrations: `npx prisma migrate deploy`
2. ✅ Seed database: `npm run seed:all`
3. ✅ Test API endpoints
4. ✅ Verify everything works
5. ✅ You're done! 🎉

The shell is your best friend for Railway database operations!
