# Render Deployment Checklist

## Before Pushing to GitHub

✅ **Code Changes Committed**
- Interior images path fix
- Category folder structure update
- Codebase cleanup
- Documentation organization

## After Pushing to GitHub

### 1. Verify Render Auto-Deploy

Render should automatically detect the push and start deploying. Check:
- Go to your Render dashboard
- Look for "Deploying..." status
- Wait for deployment to complete

### 2. Check Build Command in Render

Make sure your Render service has the correct build command:

**Recommended Build Command:**
```bash
npm install && npx prisma generate
```

**If you want to seed on every deploy (not recommended for production):**
```bash
npm install && npx prisma generate && npm run seed:all
```

**To check/update:**
1. Go to Render dashboard → Your Web Service
2. Click "Settings"
3. Find "Build Command"
4. Update if needed
5. Save changes

### 3. Run Database Migrations

After deployment, you need to run migrations on Render:

**Option A: Via Render Shell (if available)**
```bash
npx prisma migrate deploy
```

**Option B: Add to Build Command (one-time)**
Temporarily add to build command:
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**Option C: Manual SQL (if needed)**
If migrations fail, you can run the SQL manually in your Render database.

### 4. Verify Environment Variables

Make sure these are set in Render:
- `DATABASE_URL` - Your PostgreSQL connection string
- `PORT` - Usually set automatically by Render
- `FRONTEND_URL` - Your Netlify frontend URL
- `EMAIL_USER` - Email for sending inquiries
- `EMAIL_PASSWORD` - Email app password
- `ADMIN_EMAIL` - Admin user email (optional)
- `ADMIN_PASSWORD` - Admin user password (optional)

**To check:**
1. Render dashboard → Your Web Service
2. Click "Environment"
3. Verify all variables are set

### 5. Test the Deployment

After deployment completes:

1. **Health Check:**
   ```
   https://your-render-url.onrender.com/api/health
   ```

2. **Test Interior Images:**
   - Upload an interior image
   - Check API response includes `/Interior/` in path
   - Verify image displays in frontend

3. **Test Category Images:**
   - Upload a category image
   - Verify it saves to correct folder (TopLine, MaxLine, etc.)
   - Check image displays

4. **Test Events:**
   - Create an event
   - Verify it saves correctly

### 6. Regenerate Prisma Client (if needed)

If you get Prisma errors after deployment:
1. Go to Render Shell (or add to build command)
2. Run: `npx prisma generate`

### 7. Seed Database (if needed)

If your database is empty:
1. Go to Render Shell
2. Run: `npm run seed:all`

Or add to build command temporarily:
```bash
npm install && npx prisma generate && npm run seed:all
```

## Common Issues

### Issue: "Prisma Client not generated"
**Fix:** Add `npx prisma generate` to build command

### Issue: "Migration errors"
**Fix:** Run `npx prisma migrate deploy` manually

### Issue: "Images not displaying"
**Fix:** 
- Check image paths in API response
- Verify static file serving is working
- Remember: Images are ephemeral on Render (see RENDER_STORAGE_ISSUE.md)

### Issue: "Database connection failed"
**Fix:**
- Check DATABASE_URL in environment variables
- Verify database is running
- Check database credentials

## Quick Deployment Steps

1. ✅ Commit changes: `git commit -m "Your message"`
2. ✅ Push to GitHub: `git push origin main`
3. ✅ Wait for Render to auto-deploy
4. ✅ Check deployment logs for errors
5. ✅ Run migrations if needed: `npx prisma migrate deploy`
6. ✅ Test API endpoints
7. ✅ Verify images are working

## Notes

- **Auto-deploy**: Render automatically deploys when you push to main branch
- **Build time**: Usually takes 2-5 minutes
- **Database migrations**: Run manually after first deployment
- **Environment variables**: Must be set in Render dashboard
- **Image storage**: Remember images are ephemeral (use cloud storage for production)

