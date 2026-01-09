# CORS Fix Guide

## Issue
CORS errors blocking requests from Netlify frontend to Render backend.

## Changes Made

1. **Improved CORS configuration:**
   - Better origin matching (handles trailing slashes)
   - Explicit OPTIONS handling
   - More allowed headers
   - Better error logging

2. **Added logging:**
   - Backend now logs allowed origins on startup
   - Logs blocked origins with details

## Verify Environment Variables in Render

Make sure these are set in your Render dashboard:

1. Go to Render dashboard → Your backend service
2. Go to **Environment** tab
3. Verify these variables exist:
   - `FRONTEND_URL` = `https://tigermarineweb.netlify.app`
   - `DATABASE_URL` = (your PostgreSQL connection string)
   - Other required variables...

## Deploy Backend Changes

After updating `server.js`:

1. **Commit and push changes:**
   ```bash
   cd backend
   git add server.js
   git commit -m "Fix CORS configuration"
   git push
   ```

2. **Render will auto-deploy** (if connected to GitHub)
   - Or manually trigger deploy in Render dashboard

3. **Check Render logs:**
   - Should see: `🌐 Allowed CORS origins: [...]`
   - Should include: `https://tigermarineweb.netlify.app`

## Test CORS

1. **Test health endpoint:**
   ```
   https://tigermarinewbackend.onrender.com/api/health
   ```
   Should return JSON with allowed origins

2. **Test CORS endpoint:**
   ```
   https://tigermarinewbackend.onrender.com/api/cors-test
   ```
   Should return CORS headers

3. **Test from browser console:**
   ```javascript
   fetch('https://tigermarinewbackend.onrender.com/api/health')
     .then(r => r.json())
     .then(console.log)
   ```

## If Still Not Working

1. **Check Render logs:**
   - Look for CORS warnings
   - Check if backend is running

2. **Verify origin:**
   - Check browser console for exact origin
   - Make sure it matches exactly (no trailing slash)

3. **Try simpler CORS config:**
   If still failing, we can temporarily allow all origins for testing:
   ```javascript
   app.use(cors({
     origin: '*',  // Allow all (for testing only!)
     credentials: false
   }));
   ```

## Common Issues

- **Backend not restarted:** Changes require backend restart
- **Environment variable not set:** `FRONTEND_URL` must be set in Render
- **Typo in URL:** Check for typos in `https://tigermarineweb.netlify.app`
- **Trailing slash:** Some browsers add trailing slashes to origins

