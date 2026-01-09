# Troubleshooting Local Development Connection Issues

## Common Issues and Solutions

### 1. Frontend can't connect to backend

**Symptoms:**
- `Failed to fetch` errors in browser console
- `ERR_CONNECTION_REFUSED` errors
- API calls timing out

**Solutions:**

#### Check Backend is Running
```bash
# In Backend folder
npm run dev
# Should see: "🚀 Backend running on port 3001"
```

#### Check Frontend Port
The frontend is configured to run on port **3000** (see `vite.config.js`).
Make sure your frontend dev server is running:
```bash
# In frontend folder
npm run dev
# Should open on http://localhost:3000
```

#### Verify .env File
Make sure `frontend/.env` exists with:
```
VITE_API_URL=http://localhost:3001/api
```

**Important:** After creating/updating `.env`, you MUST restart the frontend dev server!

#### Check CORS Configuration
The backend allows these origins:
- `http://localhost:3000` (frontend default)
- `http://localhost:5173` (Vite default)
- `http://localhost:5174`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

#### Test Backend Directly
Open in browser: `http://localhost:3001/api/health`
Should return JSON: `{"status":"ok",...}`

#### Test from Frontend Console
Open browser console and check:
```javascript
// Should show the correct URL
console.log('[API] Backend URL:', 'http://localhost:3001/api');
```

### 2. Port Conflicts

If port 3001 is already in use:
```bash
# Windows: Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### 3. Environment Variables Not Loading

Vite requires `.env` file to be in the `frontend` root folder.
After creating/updating `.env`, restart the dev server:
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### 4. CORS Errors

If you see CORS errors in console:
1. Check backend `server.js` includes your frontend port
2. Restart backend after changing CORS config
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### 5. Network Issues

If using a VPN or firewall:
- Try disabling temporarily
- Check if localhost is blocked
- Try using `127.0.0.1` instead of `localhost` in `.env`

## Quick Test

1. **Backend Health Check:**
   ```
   http://localhost:3001/api/health
   ```
   Should return: `{"status":"ok",...}`

2. **Frontend Console:**
   Open browser console, should see:
   ```
   [API] Backend URL: http://localhost:3001/api
   [API] VITE_API_URL env var: http://localhost:3001/api
   ```

3. **Test API Call:**
   In browser console:
   ```javascript
   fetch('http://localhost:3001/api/health')
     .then(r => r.json())
     .then(console.log)
   ```

