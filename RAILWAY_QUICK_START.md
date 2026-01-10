# Railway Quick Start Guide

## 🚀 Quick Deployment Steps

### 1. Create Railway Account & Project

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select `TigerMarineWbackend` repository

### 2. Add PostgreSQL Database

1. In Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait for database to be created

### 3. Set Environment Variables

Go to your service → **Variables** tab → Add these:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://tigermarineweb.netlify.app
```

**Important:** `DATABASE_URL` uses Railway's template variable `${{Postgres.DATABASE_URL}}` which automatically connects to your PostgreSQL service.

### 4. Configure Service Settings

Go to your service → **Settings**:

- **Build Command:** (leave empty, Railway will use `npm run build`)
- **Start Command:** `npm start` (or leave empty, uses package.json)

### 5. Deploy

Railway automatically deploys when you push to GitHub. Or manually:

1. Go to Railway dashboard
2. Your service should show "Deploying..."
3. Wait for deployment to complete

### 6. Run Database Migrations & Seed

After first deployment, you need to set up the database:

#### Option A: Railway CLI (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project (select your project when prompted)
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed database
railway run npm run seed:all
```

#### Option B: Railway Dashboard Shell

1. Go to your service → **Deployments** → Click latest deployment
2. Click **"View Logs"** → **"Shell"** tab
3. Run:
   ```bash
   npx prisma migrate deploy
   npm run seed:all
   ```

### 7. Get Your URL

1. Go to your service → **Settings** → **Networking**
2. Click **"Generate Domain"** to get a Railway URL
3. Or add your custom domain

### 8. Test

Visit your Railway URL:
- Health: `https://your-app.railway.app/api/health`
- Models: `https://your-app.railway.app/api/models`
- Categories: `https://your-app.railway.app/api/categories`

## ✅ Verification Checklist

- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Migrations run
- [ ] Database seeded
- [ ] API endpoints working
- [ ] Frontend URL updated (if needed)

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Ensure `package.json` has `build` script

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Check database service is running
- Use `${{Postgres.DATABASE_URL}}` template variable

### Port Error
- Railway sets `PORT` automatically
- Your `server.js` already uses `process.env.PORT` ✅

### Migrations Don't Run
- Use Railway CLI: `railway run npx prisma migrate deploy`
- Or use Railway dashboard shell

## 📝 Next Steps

1. **Update Frontend:**
   - Change API URL from Render to Railway
   - Update in your frontend environment variables

2. **Test Everything:**
   - Admin login
   - Image uploads
   - CRUD operations

3. **Monitor:**
   - Check Railway dashboard for usage
   - Monitor logs for errors

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

