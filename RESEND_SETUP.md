# Resend Email Service Setup Guide

## Overview

The email service has been updated to use Resend instead of Gmail SMTP. Resend is a modern email API that:
- ✅ Works reliably on cloud platforms (no SMTP port blocking)
- ✅ Simple API (no SMTP configuration needed)
- ✅ Free tier: 3,000 emails/month
- ✅ Better deliverability
- ✅ Fast and reliable

## Setup Steps

### 1. Create Resend Account

1. Go to: https://resend.com/
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key

1. Go to: https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "Tiger Marine Backend"
4. Copy the API key (starts with `re_`)

### 3. Add Domain (Optional but Recommended)

For production, you should add your own domain:

1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Add your domain (e.g., `tigermarine.com`)
4. Follow DNS setup instructions
5. Wait for verification (usually a few minutes)

**Note:** For testing, you can use `onboarding@resend.dev` as the sender email.

### 4. Set Environment Variables

#### In Railway:

1. Go to Railway Dashboard → Your Web Service → Variables
2. **Add these NEW variables:**

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev  # Use this for testing (or your verified domain)
CONTACT_EMAIL=ahmed.sh.hammam@gmail.com  # Where to send inquiries (can be Gmail)
```

3. **Remove these OLD Gmail variables** (no longer needed):
   - `EMAIL_USER` ❌
   - `EMAIL_PASSWORD` ❌

**Important Notes:**
- ❌ **You CANNOT use Gmail as `EMAIL_FROM`** - Resend requires verified domains
- ✅ **Use `onboarding@resend.dev` for testing** (no setup needed)
- ✅ **`CONTACT_EMAIL` can be Gmail** - this is where emails are sent TO
- ✅ **For production**, add and verify your own domain in Resend

#### In Local `.env`:

```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
CONTACT_EMAIL=ahmed.sh.hammam@gmail.com
```

### 5. Remove Old Gmail Variables

**Remove these from Railway** (they're not needed with Resend):
- `EMAIL_USER` ❌
- `EMAIL_PASSWORD` ❌

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_abc123...` |
| `EMAIL_FROM` | Sender email address | `onboarding@resend.dev` or `noreply@yourdomain.com` |
| `CONTACT_EMAIL` | Where to send inquiries | `ahmed.sh.hammam@gmail.com` |

## Testing

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables** in `.env` file

3. **Test locally:**
   - Start the server: `npm run dev`
   - Submit a contact form
   - Check your email inbox

4. **Test on Railway:**
   - Push to GitHub
   - Wait for deployment
   - Submit a contact form
   - Check Railway logs for success/error messages

## Email Limits

- **Free tier:** 3,000 emails/month
- **Paid plans:** Start at $20/month for 50,000 emails

## Benefits Over Gmail SMTP

1. **No SMTP port blocking** - Uses HTTPS API instead
2. **Better reliability** - Designed for cloud platforms
3. **Better deliverability** - Professional email service
4. **Easier setup** - Just an API key, no SMTP configuration
5. **Better analytics** - Track email opens, clicks, etc.

## Troubleshooting

### Error: "RESEND_API_KEY not set"
- Make sure you've set `RESEND_API_KEY` in Railway variables
- Check that the variable name is exactly `RESEND_API_KEY`

### Error: "Invalid API key"
- Verify your API key is correct
- Make sure it starts with `re_`
- Check that you copied the full key

### Error: "Domain not verified"
- If using a custom domain, make sure it's verified in Resend
- For testing, use `onboarding@resend.dev` as `EMAIL_FROM`

### Emails not arriving
- Check spam folder
- Verify `CONTACT_EMAIL` is correct
- Check Resend dashboard for delivery status
- Check Railway logs for errors

## Migration from Gmail

1. ✅ Code already updated to use Resend
2. ✅ Install Resend package: `npm install`
3. ✅ Get Resend API key
4. ✅ Set `RESEND_API_KEY` in Railway
5. ✅ Set `EMAIL_FROM` (use `onboarding@resend.dev` for testing)
6. ✅ Remove old Gmail variables (optional)
7. ✅ Test and deploy

## Next Steps

1. **Get Resend API key** from https://resend.com/api-keys
2. **Set variables in Railway**
3. **Push code to GitHub**
4. **Test email sending**

That's it! Resend is much simpler than SMTP. 🎉
