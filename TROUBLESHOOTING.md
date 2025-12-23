# Backend Troubleshooting Guide

## Test Endpoints

### Health Check
```
GET https://tigermarinewbackend.onrender.com/api/health
```
Should return environment status and allowed origins.

### Upload Test
```
POST https://tigermarinewbackend.onrender.com/api/upload/test
Body: { "test": "data" }
```
Tests if upload route is accessible.

### Inquiry Test
```
POST https://tigermarinewbackend.onrender.com/api/inquiries/test
Body: { "test": "data" }
```
Tests if inquiry route is accessible.

## Common Issues

### 1. Upload Not Working

**Check Render Logs:**
- Look for `📤 Upload request received`
- Check for `❌ No file in request` errors
- Verify file size (max 50MB)

**Common Causes:**
- File too large
- Invalid file type
- Missing `modelName` or `categoryName` in request body
- Directory permissions issue

**Debug:**
1. Check browser console for request details
2. Check Render logs for backend errors
3. Test with `/api/upload/test` endpoint

### 2. Emails Not Sending

**Check Environment Variables:**
- `EMAIL_USER` must be set
- `EMAIL_PASSWORD` must be set (Gmail App Password)
- `CONTACT_EMAIL` must be set

**Check Render Logs:**
- Look for `📧 Creating email transporter`
- Check for `⚠️ EMAIL_PASSWORD not set!`
- Look for `❌ Email send failed` errors

**Common Causes:**
- `EMAIL_PASSWORD` not set or incorrect
- Gmail App Password not generated
- Gmail 2-Step Verification not enabled
- Network/firewall blocking SMTP

**Debug:**
1. Check Render environment variables
2. Verify Gmail App Password is correct
3. Check Render logs for email errors
4. Test email service directly

### 3. Database Errors

**Check:**
- `DATABASE_URL` is set correctly
- Database is accessible from Render
- Prisma migrations are up to date

**Debug:**
1. Check Render logs for database connection errors
2. Verify `DATABASE_URL` format
3. Test database connection

## Checking Logs

### Render Dashboard
1. Go to your service
2. Click "Logs" tab
3. Look for:
   - `📤` - Upload requests
   - `📧` - Email attempts
   - `✅` - Success messages
   - `❌` - Error messages

### What to Look For

**Successful Request:**
```
📤 Upload request received
  Body: { folder: 'images', modelName: 'TL850' }
  File: { name: 'image.jpg', size: 12345 }
✅ File uploaded successfully: image.jpg
```

**Failed Request:**
```
📤 Upload request received
  Body: { folder: 'images' }
❌ No file in request
```

**Email Success:**
```
📧 Creating email transporter
📤 Attempting to send email...
✅ Email sent successfully
```

**Email Failure:**
```
📧 Creating email transporter
⚠️ EMAIL_PASSWORD not set! Emails will fail.
📤 Attempting to send email...
❌ Email send failed: Invalid login
```

## Environment Variables Checklist

Required in Render:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `FRONTEND_URL` - `https://tigermarineweb.netlify.app`
- [ ] `EMAIL_USER` - Your Gmail address
- [ ] `EMAIL_PASSWORD` - Gmail App Password (NOT regular password)
- [ ] `CONTACT_EMAIL` - Where to send inquiries

## Gmail Setup

1. Enable 2-Step Verification
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

## Testing

### Test Upload
```bash
curl -X POST https://tigermarinewbackend.onrender.com/api/upload/test \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

### Test Contact Form
```bash
curl -X POST https://tigermarinewbackend.onrender.com/api/inquiries/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Test message"}'
```

### Test Health
```bash
curl https://tigermarinewbackend.onrender.com/api/health
```

