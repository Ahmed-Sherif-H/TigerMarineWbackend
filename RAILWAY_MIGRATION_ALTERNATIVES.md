# Railway Migration Alternatives (Without Dashboard Shell)

## Option 1: Use Railway CLI with Public DATABASE_URL (Recommended)

Instead of using `railway run`, set the public DATABASE_URL directly:

### Step 1: Get Public DATABASE_URL from Railway

1. Go to Railway dashboard
2. Click on your **PostgreSQL** service (not Web Service)
3. Go to **Variables** tab
4. Find `DATABASE_URL` or `DATABASE_PUBLIC_URL`
5. Click the **eye icon** (👁️) to reveal the value
6. **Copy the entire URL** (should look like: `postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway`)

### Step 2: Set It in PowerShell

```powershell
# Set the public DATABASE_URL
$env:DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway"

# Verify it's set
$env:DATABASE_URL
```

### Step 3: Run Migration

```bash
npx prisma migrate deploy
```

This should work now because you're using the public URL directly.

## Option 2: Add Column Directly via SQL

If migrations don't work, you can add the column directly:

### Step 1: Get DATABASE_URL (same as Option 1)

### Step 2: Connect and Add Column

**Using psql (if installed):**
```powershell
# Set DATABASE_URL
$env:DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway"

# Connect and run SQL
psql $env:DATABASE_URL -c "ALTER TABLE \"Model\" ADD COLUMN IF NOT EXISTS \"interiorMainImage\" TEXT;"
```

**Or using Node.js script:**
Create a file `add-column.js`:
```javascript
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addColumn() {
  try {
    await prisma.$executeRaw`ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "interiorMainImage" TEXT;`;
    console.log('✅ Column added successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addColumn();
```

Then run:
```bash
# Set DATABASE_URL
$env:DATABASE_URL="postgresql://postgres:password@hopper.proxy.rlwy.net:47241/railway"

# Run script
node add-column.js
```

### Step 3: Regenerate Prisma Client

After adding the column:
```bash
npx prisma generate
```

## Option 3: Use Railway's Database Interface

Some Railway plans have a database web interface:

1. Go to Railway dashboard
2. Click on your **PostgreSQL** service
3. Look for **"Data"** or **"Query"** tab
4. If available, run:
   ```sql
   ALTER TABLE "Model" ADD COLUMN IF NOT EXISTS "interiorMainImage" TEXT;
   ```

## Option 4: Create Migration and Deploy via GitHub

If Railway auto-deploys from GitHub:

1. **Create migration locally:**
   ```bash
   npx prisma migrate dev --name add_interior_main_image_back
   ```

2. **Update railway.json to run migrations:**
   Check if your build command includes migrations. If not, Railway should run them automatically on deploy.

3. **Push to GitHub:**
   ```bash
   git add prisma/migrations
   git commit -m "Add interiorMainImage column"
   git push
   ```

4. **Railway will auto-deploy** and run migrations during build (if configured)

## Recommended: Option 1 (Public DATABASE_URL)

This is the most reliable method:

```powershell
# 1. Get public URL from Railway PostgreSQL service → Variables
# 2. Set it in PowerShell
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@hopper.proxy.rlwy.net:YOUR_PORT/railway"

# 3. Run migration
npx prisma migrate deploy

# 4. Import data
npm run import:exported database-export.json
```

## Troubleshooting

### If public URL doesn't work:
- Check firewall/network settings
- Try from a different network
- Use Option 2 (direct SQL) instead

### If you get connection errors:
- Verify the URL is complete (includes username, password, host, port, database)
- Check database is running in Railway dashboard
- Try the Node.js script method (Option 2)
