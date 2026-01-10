# Railway CLI - Command Line Guide

## Option 1: Railway CLI (Recommended for CLI)

### Install Railway CLI

```bash
npm install -g @railway/cli
```

### Login

```bash
railway login
```

This will open your browser to authenticate.

### Link to Your Project

```bash
railway link
```

Select your project when prompted.

### Run Commands

Once linked, you can run commands in Railway's environment:

```bash
# Run migrations
railway run npx prisma migrate deploy

# Seed database
railway run npm run seed:all

# Test connection
railway run npm run test:db

# Any other command
railway run <your-command>
```

**Note:** The `railway run` command executes in Railway's environment where the database is accessible.

## Option 2: Use Public DATABASE_URL Locally

If Railway CLI has connection issues, you can get the public DATABASE_URL and use it locally:

### Step 1: Get DATABASE_URL from Railway

1. Go to Railway dashboard
2. Click your **PostgreSQL** service (not Web Service)
3. Go to **Variables** tab
4. Find `DATABASE_URL`
5. **Copy the value** (it should be a public URL, not `postgres.railway.internal`)

### Step 2: Use It Locally

**Windows PowerShell:**
```powershell
# Set environment variable for current session
$env:DATABASE_URL="postgresql://user:password@host:port/database"

# Run commands
npx prisma migrate deploy
npm run seed:all
```

**Windows CMD:**
```cmd
set DATABASE_URL=postgresql://user:password@host:port/database
npx prisma migrate deploy
npm run seed:all
```

**Mac/Linux:**
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
npx prisma migrate deploy
npm run seed:all
```

### Step 3: Or Create .env.railway File

Create a temporary `.env.railway` file:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

Then load it:
```bash
# Windows PowerShell
Get-Content .env.railway | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') } }

# Mac/Linux
export $(cat .env.railway | xargs)
```

## Option 3: Railway CLI with Service Selection

If you have multiple services, specify which one:

```bash
# List services
railway status

# Select a service
railway service

# Then run commands
railway run npx prisma migrate deploy
```

## Troubleshooting Railway CLI

### Issue: "Can't reach database server at postgres.railway.internal"

**Solution:** Use the public DATABASE_URL instead (Option 2 above)

### Issue: "Not linked to a project"

**Solution:**
```bash
railway link
# Select your project when prompted
```

### Issue: "railway: command not found"

**Solution:**
```bash
npm install -g @railway/cli
```

### Issue: Authentication failed

**Solution:**
```bash
railway login
# This opens browser - complete authentication there
```

## Quick Comparison

| Method | Pros | Cons |
|--------|------|------|
| **Dashboard Shell** | ✅ Easiest<br>✅ Always works<br>✅ No setup | ❌ Requires browser<br>❌ Not scriptable |
| **Railway CLI** | ✅ Command line<br>✅ Scriptable | ⚠️ May have connection issues<br>❌ Requires setup |
| **Public DATABASE_URL** | ✅ Works from anywhere<br>✅ Full control | ⚠️ Need to get URL manually<br>⚠️ Security (don't commit) |

## Recommended Approach

**For one-time setup:**
- Use **Dashboard Shell** (easiest, most reliable)

**For regular use/automation:**
- Use **Railway CLI** with `railway run`
- Or use **Public DATABASE_URL** if CLI has issues

## Example: Full Workflow with CLI

```bash
# 1. Install CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link to project
railway link
# Select your project

# 4. Run migrations
railway run npx prisma migrate deploy

# 5. Seed database
railway run npm run seed:all

# 6. Test
railway run npm run test:db
```

## Security Note

⚠️ **Never commit DATABASE_URL to git!**

If using public DATABASE_URL locally:
- Use environment variables
- Don't add to `.env` if it's in git
- Use `.env.railway` and add to `.gitignore`
- Or use Railway CLI which handles this securely
