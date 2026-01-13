# Railway Variables Update for Resend

## Current Variables (Old - Gmail SMTP)

You currently have:
- ✅ `CONTACT_EMAIL` - Keep this (where emails are sent TO)
- ✅ `DATABASE_URL` - Keep this (database connection)
- ❌ `EMAIL_USER` - **Remove this** (not needed with Resend)
- ❌ `EMAIL_PASSWORD` - **Remove this** (not needed with Resend)

## New Variables Needed (Resend)

Add these:
- ✅ `RESEND_API_KEY` - Your Resend API key (get from https://resend.com/api-keys)
- ✅ `EMAIL_FROM` - Use `onboarding@resend.dev` for testing

## Updated Railway Variables

### Keep These:
```
CONTACT_EMAIL=ahmed.sh.hammam@gmail.com
DATABASE_URL=your_database_url
```

### Add These:
```
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
```

### Remove These:
```
EMAIL_USER  ❌
EMAIL_PASSWORD  ❌
```

## Step-by-Step Update

1. **Go to Railway Dashboard** → Your Web Service → Variables

2. **Add new variables:**
   - Click "New Variable"
   - Add `RESEND_API_KEY` = (your Resend API key)
   - Add `EMAIL_FROM` = `onboarding@resend.dev`

3. **Remove old variables:**
   - Delete `EMAIL_USER`
   - Delete `EMAIL_PASSWORD`

4. **Keep existing:**
   - `CONTACT_EMAIL` (this is where emails go TO - can be Gmail)
   - `DATABASE_URL`

## Important Notes

### ❌ Cannot Use Gmail as EMAIL_FROM

Resend requires verified domains. You cannot use:
- ❌ `ahmed.sh.hammam@gmail.com` as EMAIL_FROM
- ❌ Any Gmail address as sender

### ✅ Can Use Gmail as CONTACT_EMAIL

The `CONTACT_EMAIL` (where emails are sent TO) can be Gmail:
- ✅ `ahmed.sh.hammam@gmail.com` as CONTACT_EMAIL (recipient)

### Testing vs Production

**For Testing:**
- Use `EMAIL_FROM=onboarding@resend.dev` (no setup needed)

**For Production:**
- Add your domain to Resend (e.g., `tigermarine.com`)
- Verify it with DNS records
- Use `EMAIL_FROM=noreply@tigermarine.com` (or your domain)

## Quick Setup

1. Get Resend API key: https://resend.com/api-keys
2. In Railway, add:
   - `RESEND_API_KEY` = your key
   - `EMAIL_FROM` = `onboarding@resend.dev`
3. Remove:
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
4. Deploy and test!

## Summary

- **EMAIL_FROM**: Must be Resend domain or your verified domain (NOT Gmail)
- **CONTACT_EMAIL**: Can be Gmail (this is the recipient)
- **RESEND_API_KEY**: Required (get from Resend dashboard)
