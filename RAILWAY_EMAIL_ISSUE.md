# Railway Email Connection Timeout - Solutions

## Problem

Railway is blocking outbound SMTP connections, causing `ETIMEDOUT` errors when trying to send emails via Gmail.

## Why This Happens

Many cloud platforms (including Railway) block outbound SMTP connections (ports 25, 587, 465) to prevent spam. This is a common security measure.

## Solutions

### Option 1: Use SendGrid (Recommended) ⭐

SendGrid is designed for cloud platforms and is more reliable:

1. **Sign up for SendGrid:**
   - Go to: https://sendgrid.com/
   - Free tier: 100 emails/day

2. **Get API Key:**
   - Dashboard → Settings → API Keys
   - Create API Key with "Mail Send" permissions

3. **Update Email Service:**
   - Replace Gmail SMTP with SendGrid API
   - More reliable for production
   - Better deliverability

### Option 2: Use Mailgun

Alternative email service:

1. **Sign up for Mailgun:**
   - Go to: https://www.mailgun.com/
   - Free tier: 5,000 emails/month

2. **Get SMTP credentials:**
   - Dashboard → Sending → Domain Settings
   - Use SMTP credentials

### Option 3: Contact Railway Support

Ask Railway to whitelist SMTP ports for your service:

1. Contact Railway support
2. Request outbound SMTP access (ports 587, 465)
3. Explain you need it for transactional emails

### Option 4: Use Railway's Email Service (if available)

Check if Railway offers an email service or addon.

## Current Configuration

The email service now:
- Uses port 465 (SSL) instead of 587 (TLS)
- Has increased timeout (15 seconds)
- Provides better error messages
- Auto-removes spaces from App Password

## Quick Test

To verify if Railway is blocking SMTP:

1. Check Railway logs for connection timeout
2. If timeout persists, Railway is likely blocking SMTP
3. Switch to SendGrid or Mailgun

## Recommended: SendGrid Integration

I can help you integrate SendGrid, which is:
- ✅ More reliable for cloud platforms
- ✅ Better deliverability
- ✅ Free tier available
- ✅ Designed for transactional emails
- ✅ No SMTP port blocking issues

Would you like me to update the email service to use SendGrid instead?
