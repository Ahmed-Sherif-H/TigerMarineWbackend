# Set Local Database URL for Export

## The Problem

The export script found 0 models because `DATABASE_URL` in your `.env` file is pointing to Railway (online database) instead of your local database.

## Solution: Update .env File

### Step 1: Check Current DATABASE_URL

Open your `.env` file and check what `DATABASE_URL` is set to.

If it looks like:
```
DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway"
```
This is your **Railway database** (online) - you need to change it to your **local database**.

### Step 2: Set Local Database URL

Update your `.env` file with your local database connection:

```env
# Local Database (for development/export)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/tigermarine?schema=public"
```

**Replace:**
- `your_password` with your local PostgreSQL password
- `tigermarine` with your local database name (if different)

### Step 3: Verify Local Database is Running

Make sure your local PostgreSQL is running:
- Check PostgreSQL service is started
- Test connection: `npm run test:db`

### Step 4: Run Export Again

After updating `.env`:
```bash
npm run export:db database-export.json
```

## Alternative: Use Environment Variable (Temporary)

If you don't want to change `.env` permanently, you can set it temporarily in PowerShell:

```powershell
# Set local database URL for this session
$env:DATABASE_URL="postgresql://postgres:password@localhost:5432/tigermarine?schema=public"

# Run export
npm run export:db database-export.json
```

## After Export: Switch Back to Railway (If Needed)

If you need to use Railway database after export, you can:

1. **Comment out local URL in .env:**
   ```env
   # DATABASE_URL="postgresql://postgres:password@localhost:5432/tigermarine?schema=public"
   DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway"
   ```

2. **Or use separate .env files:**
   - `.env.local` for local development
   - `.env.production` for Railway
   - Load the appropriate one

## Quick Checklist

- [ ] `.env` file has local `DATABASE_URL`
- [ ] Local PostgreSQL is running
- [ ] Database name matches (usually `tigermarine`)
- [ ] Password is correct
- [ ] Port is correct (usually `5432`)
- [ ] Run export: `npm run export:db database-export.json`

## Expected Result

After setting local `DATABASE_URL`, the export should show:
```
📦 Found 7 categories
📦 Found [number] models  ← Should be > 0
```

If you still see 0 models, check:
1. Local database actually has models
2. Database name is correct
3. Connection is working (`npm run test:db`)
