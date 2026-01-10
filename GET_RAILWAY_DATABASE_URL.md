# How to Get Railway Public DATABASE_URL

## Step-by-Step

### Step 1: Go to Railway Dashboard
1. Open https://railway.app
2. Login to your account

### Step 2: Find Your PostgreSQL Service
1. Click on your **project**
2. You'll see your services listed
3. **Click on your PostgreSQL service** (not the Web Service)
   - It might be named "Postgres" or "PostgreSQL"

### Step 3: Get DATABASE_URL
1. Click on the **"Variables"** tab
2. Look for `DATABASE_URL` in the list
3. **Click on the eye icon** (👁️) to reveal the value
4. **Copy the entire URL**
   - It should look like: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`
   - NOT: `postgresql://postgres:password@postgres.railway.internal:5432/railway`

### Step 4: Use It Locally

**Windows PowerShell:**
```powershell
# Replace with your actual DATABASE_URL
$env:DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"

# Now run your commands
npx prisma migrate deploy
npm run seed:all
```

**Windows CMD:**
```cmd
set DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
npx prisma migrate deploy
npm run seed:all
```

## Alternative: Create .env.railway File

1. Create a file named `.env.railway` in your project root
2. Add:
   ```env
   DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```
3. Load it in PowerShell:
   ```powershell
   Get-Content .env.railway | ForEach-Object { 
     if ($_ -match '^([^=]+)=(.*)$') { 
       [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') 
     } 
   }
   npx prisma migrate deploy
   npm run seed:all
   ```

## Quick Test

After setting DATABASE_URL, test the connection:
```powershell
npm run test:db
```

If it works, you're good to go! ✅
