# How to Start the Server

## PowerShell (Windows)

Since PowerShell doesn't support `&&`, use separate commands:

```powershell
cd backend
npm run dev
```

Or use semicolon:
```powershell
cd backend; npm run dev
```

## Check if Server is Running

1. Look for this message in terminal:
   ```
   🚀 Tiger Marine Backend API running on http://localhost:3001
   ```

2. Test in browser:
   - http://localhost:3001/api
   - http://localhost:3001/api/health

3. If you see "Cannot GET /api", the server might not be running or there's an error.

## Troubleshooting

### Server won't start?
- Check if port 3001 is already in use
- Check for errors in terminal
- Make sure database is connected (check .env file)

### Database connection error?
- Run: `npm run test:db`
- Verify DATABASE_URL in .env
- Make sure PostgreSQL is running

### Still having issues?
- Check terminal for error messages
- Verify all dependencies installed: `npm install`
- Try: `npx prisma generate` again


