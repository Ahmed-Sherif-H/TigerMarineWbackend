# Railway Deployment Guide

## Migration from Render to Railway

This guide will help you deploy your backend to Railway instead of Render.

## Prerequisites

- ✅ GitHub repository updated
- ✅ Code pushed to GitHub
- Railway account (sign up at https://railway.app)

## Step 1: Create Railway Project

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Select your repository: `TigerMarineWbackend`
6. Railway will automatically detect it's a Node.js project

## Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will create a PostgreSQL database
4. **Important:** Note the database connection details (you'll need them)

## Step 3: Configure Environment Variables

In your Railway project, go to **Variables** tab and add:

### Required Variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.netlify.app
```

### Optional Variables (if you use them):

```env
ADMIN_EMAIL=admin@tigermarine.com
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=Admin User
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
JWT_SECRET=your_jwt_secret_key
```

### Important Notes:

- **DATABASE_URL**: Railway automatically provides this via `${{Postgres.DATABASE_URL}}`
- **PORT**: Railway sets `PORT` automatically, but you can override it
- **FRONTEND_URL**: Update with your actual frontend URL

## Step 4: Configure Build Settings

Railway usually auto-detects Node.js projects, but verify:

1. Go to your service → **Settings**
2. Check **Build Command**: Should be empty or `npm install`
3. Check **Start Command**: Should be `npm start` or `node server.js`

### Recommended Build Command:

```bash
npm install && npx prisma generate
```

### Recommended Start Command:

```bash
npm start
```

## Step 5: Add Build Script (Optional but Recommended)

You can add a build script to your `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate",
    "start": "node server.js"
  }
}
```

Railway will automatically run `npm run build` if it exists.

## Step 6: Database Setup

After deployment, you need to run migrations and seed:

### Option 1: Railway CLI (Recommended)

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

5. Seed database:
   ```bash
   railway run npm run seed:all
   ```

### Option 2: Railway Dashboard Shell

1. Go to your service in Railway dashboard
2. Click on **"Deployments"** tab
3. Click on a deployment
4. Click **"View Logs"** → **"Shell"**
5. Run commands:
   ```bash
   npx prisma migrate deploy
   npm run seed:all
   ```

### Option 3: Add to Build Command (One-time)

Temporarily add to build command:
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run seed:all
```

**⚠️ Warning:** This runs migrations/seeding on every deploy. Remove after first deployment.

## Step 7: Configure Custom Domain (Optional)

1. Go to your service → **Settings** → **Networking**
2. Click **"Generate Domain"** for a Railway domain
3. Or add your custom domain

## Step 8: Deploy

Railway automatically deploys when you push to your main branch.

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. Railway will automatically:
   - Detect the push
   - Build your project
   - Deploy it

3. Check deployment status in Railway dashboard

## Step 9: Verify Deployment

1. **Check Health Endpoint:**
   ```
   https://your-railway-url.railway.app/api/health
   ```

2. **Test API:**
   ```
   https://your-railway-url.railway.app/api/models
   https://your-railway-url.railway.app/api/categories
   ```

3. **Check Logs:**
   - Go to Railway dashboard → Your service → **Deployments** → **View Logs**

## Railway vs Render Differences

| Feature | Render | Railway |
|---------|--------|---------|
| **Free Tier** | ✅ Yes | ✅ Yes (with $5 credit) |
| **Database** | Separate service | Built-in PostgreSQL |
| **Auto-deploy** | ✅ Yes | ✅ Yes |
| **Custom Domain** | ✅ Yes | ✅ Yes |
| **Environment Variables** | ✅ Yes | ✅ Yes (with templates) |
| **Build Logs** | ✅ Yes | ✅ Yes |
| **CLI** | ❌ No | ✅ Yes |
| **File Storage** | Ephemeral | Ephemeral (same issue) |

## Important: File Storage Issue

⚠️ **Same as Render:** Railway's filesystem is also ephemeral. Files uploaded will be lost on redeploy.

**Solution:** Use cloud storage (Cloudinary, AWS S3, etc.) for production.

## Troubleshooting

### Issue: Build Fails

**Check:**
- Build logs in Railway dashboard
- Ensure `package.json` has correct scripts
- Check Node.js version (Railway auto-detects, but you can specify in `package.json`)

### Issue: Database Connection Fails

**Check:**
- `DATABASE_URL` environment variable is set
- Database service is running
- Connection string format is correct

### Issue: Migrations Don't Run

**Solution:**
- Use Railway CLI: `railway run npx prisma migrate deploy`
- Or add to build command temporarily

### Issue: Port Error

**Solution:**
- Railway sets `PORT` automatically
- Make sure your `server.js` uses `process.env.PORT`

## Quick Checklist

- [ ] Railway account created
- [ ] Project created from GitHub repo
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] Build/Start commands verified
- [ ] Database migrations run
- [ ] Database seeded
- [ ] Deployment successful
- [ ] API endpoints tested
- [ ] Frontend URL updated (if needed)

## Next Steps After Deployment

1. **Update Frontend:**
   - Change API URL from Render to Railway
   - Update CORS settings if needed

2. **Test Everything:**
   - Admin login
   - Image uploads
   - Model creation/editing
   - Category management

3. **Monitor:**
   - Check Railway dashboard for usage
   - Monitor logs for errors
   - Set up alerts if needed

## Railway CLI Commands Reference

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Run command in Railway environment
railway run <command>

# View logs
railway logs

# Open shell
railway shell

# Deploy
railway up
```

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

