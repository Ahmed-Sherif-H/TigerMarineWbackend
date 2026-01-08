# Fix: Event Model Not Available

## Problem
You're getting: `"Event model not available. Please regenerate Prisma Client."`

## Root Cause
The Prisma Client was generated **before** the Event model was added to the schema, or the regeneration failed because the server was running.

## Solution (Do These Steps in Order)

### Step 1: Stop ALL Node Processes
**IMPORTANT**: The backend server MUST be completely stopped before regenerating Prisma Client.

**Option A: Stop via Terminal**
- In the backend terminal where `npm run dev` is running
- Press `Ctrl+C`
- Wait until you see the prompt (no more output)

**Option B: Force Stop (if Ctrl+C doesn't work)**
```powershell
# Find Node processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object Id, ProcessName, Path

# Kill all Node processes (replace <PID> with actual process ID)
Stop-Process -Id <PID> -Force
```

Or kill all Node processes at once:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 2: Clear Prisma Cache
```powershell
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 3: Regenerate Prisma Client
```powershell
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client (v5.x.x) to .\node_modules\@prisma\client
```

**If you get "EPERM: operation not permitted":**
- The server is still running → Go back to Step 1
- Close VS Code/Cursor if it's locking files
- Try again

### Step 4: Verify Event Model Exists
```powershell
node scripts/checkPrismaEvent.js
```

**Should show:**
```
Event model available: ✅ YES
```

### Step 5: Restart Backend Server
```powershell
npm run dev
```

### Step 6: Test in Admin Dashboard
1. Go to Admin Dashboard → Events tab
2. Try creating an event
3. Should work without errors!

## Quick Verification Commands

**Check if server is running:**
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

**Check if Event model exists:**
```powershell
node scripts/checkPrismaEvent.js
```

**Check Prisma schema:**
```powershell
Get-Content prisma\schema.prisma | Select-String -Pattern "model Event"
```

## Why This Happens

1. You added `model Event` to `schema.prisma`
2. But Prisma Client was generated **before** this change
3. Prisma Client is generated code - it needs to be regenerated after schema changes
4. If the server is running, it locks the Prisma Client files, preventing regeneration

## Still Not Working?

1. **Check schema file:**
   ```powershell
   Get-Content prisma\schema.prisma | Select-String -Pattern "model Event" -Context 5
   ```

2. **Check if migration is needed:**
   ```powershell
   npx prisma migrate status
   ```

3. **Run migration if needed:**
   ```powershell
   npx prisma migrate dev --name add_event_model
   ```

4. **Then regenerate:**
   ```powershell
   npx prisma generate
   ```

