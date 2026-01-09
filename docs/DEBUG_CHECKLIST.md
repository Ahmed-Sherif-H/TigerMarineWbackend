# Debug Checklist

## Step 1: Check Backend is Running

1. **Test health endpoint:**
   ```
   https://tigermarinewbackend.onrender.com/api/health
   ```
   Should return JSON with status: "ok"

2. **Check Render dashboard:**
   - Service status should be "Live"
   - Check logs for any startup errors

## Step 2: Check Environment Variables

In Render dashboard → Environment tab, verify:
- [ ] `DATABASE_URL` is set
- [ ] `FRONTEND_URL` is set to `https://tigermarineweb.netlify.app`
- [ ] `EMAIL_USER` is set
- [ ] `EMAIL_PASSWORD` is set (Gmail App Password)
- [ ] `CONTACT_EMAIL` is set

## Step 3: Test Upload

1. **Test upload endpoint:**
   - Go to Admin Dashboard
   - Try uploading an image
   - Check browser console for errors
   - Check Render logs for:
     - `📤 Upload request received`
     - `✅ File uploaded successfully` OR `❌` errors

2. **Common upload errors:**
   - `❌ No file in request` - Check FormData is being sent correctly
   - `❌ Multer error: LIMIT_FILE_SIZE` - File too large
   - `❌ Upload error: Only image and video files are allowed!` - Invalid file type

## Step 4: Test Email

1. **Test contact form:**
   - Fill out contact form
   - Submit
   - Check browser console
   - Check Render logs for:
     - `📧 Contact form request received`
     - `📧 Creating email transporter`
     - `✅ Email sent successfully` OR `❌ Email send failed`

2. **Common email errors:**
   - `⚠️ EMAIL_PASSWORD not set!` - Password not configured
   - `❌ Email send failed: Invalid login` - Wrong password
   - `❌ Email send failed: Connection timeout` - Network issue

## Step 5: Check Logs

### In Render Dashboard:
1. Go to your service
2. Click "Logs" tab
3. Look for emoji indicators:
   - 📤 = Upload request
   - 📧 = Email request
   - ✅ = Success
   - ❌ = Error
   - ⚠️ = Warning

### What to Look For:

**If you see nothing:**
- Request might not be reaching backend
- Check CORS configuration
- Check frontend API URL

**If you see errors:**
- Read the error message
- Check the stack trace
- Verify environment variables

## Step 6: Test Endpoints Directly

### Using curl or Postman:

**Test upload:**
```bash
curl -X POST https://tigermarinewbackend.onrender.com/api/upload/test \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

**Test contact:**
```bash
curl -X POST https://tigermarinewbackend.onrender.com/api/inquiries/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test"}'
```

**Test health:**
```bash
curl https://tigermarinewbackend.onrender.com/api/health
```

## Common Solutions

### Upload Not Working:
1. Check file size (max 50MB)
2. Check file type (images/videos only)
3. Verify `modelName` or `categoryName` is sent
4. Check Render logs for specific error

### Email Not Working:
1. Verify `EMAIL_PASSWORD` is set (Gmail App Password)
2. Check Gmail 2-Step Verification is enabled
3. Verify App Password was generated correctly
4. Check Render logs for email errors

### Nothing Working:
1. Verify backend is running (check health endpoint)
2. Check CORS configuration
3. Verify environment variables are set
4. Check Render logs for startup errors

