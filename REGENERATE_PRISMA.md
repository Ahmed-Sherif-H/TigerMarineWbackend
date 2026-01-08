# How to Regenerate Prisma Client

## Problem
You're getting errors like:
- "Event model not available. Please regenerate Prisma Client."
- "Cannot read properties of undefined (reading 'findMany')"

This happens when you add a new model to `schema.prisma` but Prisma Client hasn't been regenerated.

## Solution

### Step 1: Stop the Backend Server
In your backend terminal where `npm run dev` is running:
- Press `Ctrl+C` to stop the server
- Wait for it to fully stop

### Step 2: Regenerate Prisma Client
```bash
npx prisma generate
```

You should see:
```
✔ Generated Prisma Client (v5.22.0) to .\node_modules\@prisma\client
```

### Step 3: Restart the Backend Server
```bash
npm run dev
```

### Step 4: Verify It Works
1. Open: `http://localhost:3001/api/events`
   - Should return: `[]` (empty array, no errors)

2. Check backend console:
   - Should NOT see any errors about "Event model not available"

3. Try creating an event in Admin Dashboard:
   - Should work without errors

## Why This Is Needed

When you add a new model to `prisma/schema.prisma`, Prisma Client needs to be regenerated to include the new model. The Prisma Client is generated code that provides TypeScript/JavaScript methods for each model in your schema.

If you don't regenerate:
- `prisma.event` will be `undefined`
- You'll get errors when trying to use it
- The API will fail

## Troubleshooting

If `npx prisma generate` fails with "operation not permitted":
1. Make sure the backend server is completely stopped
2. Close any other programs that might be using the Prisma Client files
3. Try again

If it still doesn't work after regenerating:
1. Delete `node_modules/.prisma` folder
2. Run `npx prisma generate` again
3. Restart the server

