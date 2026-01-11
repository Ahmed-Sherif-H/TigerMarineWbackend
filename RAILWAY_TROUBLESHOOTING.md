# Railway Troubleshooting: "Application Failed to Respond"

## 🔍 Step-by-Step Debugging

### 1. Check Railway Logs

**Most Important First Step!**

1. Go to Railway Dashboard → Your Service
2. Click on **"Logs"** tab
3. Look for error messages

Common errors you might see:
- `❌ Server failed to start: ...`
- Database connection errors
- `Prisma Client not generated`
- Port binding errors

---

## 🚨 Common Issues & Fixes

### Issue 1: Database Connection Failed

**Error in logs:**
```
Error: Can't reach database server
or
P1001: Can't reach database server
```

**Fix:**
1. Make sure you have a PostgreSQL service added to your Railway project
2. Check that `DATABASE_URL` environment variable exists (Railway sets this automatically)
3. Verify the database service is running (green status)

---

### Issue 2: Prisma Client Not Generated

**Error in logs:**
```
@prisma/client did not initialize yet
or
Cannot find module '@prisma/client'
```

**Fix:**
Railway needs to run `prisma generate` before starting the app.

**Solution:** Update your Railway service settings:

1. Go to Railway → Your Service → Settings
2. Find **"Build Command"** or **"Start Command"**
3. Set it to:
   ```bash
   npx prisma generate && npm start
   ```
   
   Or if Railway has separate build/start:
   - **Build Command:** `npx prisma generate`
   - **Start Command:** `npm start`

---

### Issue 3: Port Configuration

**Error in logs:**
```
Error: listen EADDRINUSE: address already in use
or
Port 3001 is not accessible
```

**Fix:**
Railway automatically sets `PORT` environment variable. Your app should use it:

```javascript
const PORT = process.env.PORT || 3001; // ✅ This is correct
```

**In Railway Networking:**
- Target Port: Leave as **8080** (Railway's default) OR set to match `PORT` env var
- Railway will route traffic from port 8080 to your app's `PORT`

---

### Issue 4: Missing Environment Variables

**Check these in Railway → Variables:**

Required:
- ✅ `DATABASE_URL` (auto-set by Railway when you add PostgreSQL)
- ✅ `PORT` (auto-set by Railway)

Optional but recommended:
- `FRONTEND_URL` = `https://tigermarineweb.netlify.app`
- `NODE_ENV` = `production`

---

### Issue 5: Build Script Not Running

**Check Railway Build Settings:**

1. Railway → Your Service → Settings
2. Verify:
   - **Build Command:** `npx prisma generate` (or leave empty if using start command)
   - **Start Command:** `npm start`
   - **Root Directory:** (leave empty unless your backend is in a subfolder)

---

## ✅ Quick Fix Checklist

1. **Check Logs:**
   - [ ] Open Railway → Service → Logs
   - [ ] Look for red error messages
   - [ ] Copy any error messages

2. **Verify Database:**
   - [ ] PostgreSQL service is added and running
   - [ ] `DATABASE_URL` exists in environment variables

3. **Verify Build Process:**
   - [ ] Railway runs `npx prisma generate` before starting
   - [ ] Start command is `npm start`

4. **Verify Port:**
   - [ ] App listens on `process.env.PORT` (Railway sets this)
   - [ ] Networking target port is set correctly

5. **Redeploy:**
   - [ ] After fixing issues, trigger a new deployment
   - [ ] Watch logs during deployment

---

## 🔧 Recommended Railway Configuration

### Service Settings:

**Build Command:**
```bash
npx prisma generate
```

**Start Command:**
```bash
npm start
```

**Root Directory:**
(Leave empty - your backend is in the root)

### Environment Variables:

```
DATABASE_URL=postgresql://... (auto-set by Railway)
PORT=3001 (optional - Railway sets this automatically)
FRONTEND_URL=https://tigermarineweb.netlify.app
NODE_ENV=production
```

### Networking:

- **Public Networking:** ✅ Enabled
- **Target Port:** 8080 (or leave default)
- **Service Domain:** Generated (e.g., `tigermarinewbackend-production.up.railway.app`)

---

## 🆘 Still Not Working?

1. **Share the error from Railway logs** - this will help identify the exact issue
2. **Check if the service is actually deployed:**
   - Railway → Deployments tab
   - Look for successful deployment (green checkmark)
3. **Try accessing the health endpoint:**
   - `https://tigermarinewbackend-production.up.railway.app/api/health`
   - Should return JSON, not "failed to respond"

---

## 📝 What to Share for Help

If you need more help, share:
1. Error messages from Railway logs
2. Your Railway service settings (Build/Start commands)
3. Environment variables (hide sensitive values)
4. Deployment status (successful or failed)
