# Email Service Troubleshooting Guide

## Connection Timeout Issues

If you're getting `ETIMEDOUT` or `ECONNREFUSED` errors, follow these steps:

### 1. Verify Gmail App Password

**Important:** You MUST use an App Password, not your regular Gmail password.

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with your Gmail account
3. Select "Mail" and "Other (Custom name)"
4. Enter "Tiger Marine Backend"
5. Click "Generate"
6. Copy the 16-character password (no spaces)
7. Use this in `EMAIL_PASSWORD` environment variable

### 2. Enable 2-Step Verification

App Passwords require 2-Step Verification:

1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Then generate App Password (step 1)

### 3. Check Railway Environment Variables

In Railway Dashboard → Your Web Service → Variables:

- `EMAIL_USER` = your Gmail address (e.g., `ahmed.sh.hammam@gmail.com`)
- `EMAIL_PASSWORD` = your 16-character App Password (NOT your regular password)
- `CONTACT_EMAIL` = where to send inquiries (can be same as EMAIL_USER)

### 4. Railway SMTP Configuration

Railway should allow outbound SMTP connections by default, but verify:

- Port 587 (TLS) should be open
- Port 465 (SSL) is alternative
- Current config uses port 587 with TLS

### 5. Test Email Configuration

The email service now:
- Uses explicit SMTP host/port configuration
- Has connection timeout settings (10 seconds)
- Verifies connection before sending
- Provides detailed error messages

### 6. Alternative: Use Different Email Service

If Gmail continues to have issues, consider:

**Option A: SendGrid (Recommended for Production)**
- Free tier: 100 emails/day
- More reliable for production
- Better deliverability
- Setup: https://sendgrid.com/

**Option B: Mailgun**
- Free tier: 5,000 emails/month
- Good for transactional emails
- Setup: https://www.mailgun.com/

**Option C: AWS SES**
- Very cheap ($0.10 per 1,000 emails)
- Requires AWS account
- Setup: https://aws.amazon.com/ses/

## Current Configuration

The email service is configured with:

```javascript
{
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000
}
```

## Error Codes

- `ETIMEDOUT`: Connection timeout - check network/firewall
- `ECONNREFUSED`: Connection refused - check SMTP settings
- `EAUTH`: Authentication failed - check App Password
- `EENVELOPE`: Invalid email address

## Testing

After updating environment variables in Railway:

1. Redeploy the service (or wait for auto-deploy)
2. Submit a contact form from the frontend
3. Check Railway logs for:
   - `✅ Email sent successfully` (success)
   - `❌ Email send error` (failure with details)

## Still Not Working?

1. **Check Railway Logs:**
   - Look for detailed error messages
   - Check if connection is being established

2. **Verify App Password:**
   - Generate a new App Password
   - Make sure no spaces in the password
   - Update Railway variable

3. **Test Locally:**
   - Set `EMAIL_USER` and `EMAIL_PASSWORD` in local `.env`
   - Test email sending locally
   - If local works but Railway doesn't, it's a Railway network issue

4. **Contact Railway Support:**
   - If Railway is blocking SMTP connections
   - They may need to whitelist your service
