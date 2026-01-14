# Resend Domain Setup for tigermarine.com

## Domain Verification

Once you've added `tigermarine.com` to Resend:

1. **Go to Resend Dashboard:** https://resend.com/domains
2. **Check domain status:**
   - Should show "Verified" ✅
   - If not verified, follow DNS setup instructions

## Update Railway Variables

### Change EMAIL_FROM

**Old (for testing):**
```
EMAIL_FROM=onboarding@resend.dev
```

**New (with your domain):**
```
EMAIL_FROM=noreply@tigermarine.com
```

Or you can use:
- `contact@tigermarine.com`
- `info@tigermarine.com`
- `hello@tigermarine.com`
- Any email address on your verified domain

### Complete Railway Variables

Your Railway variables should now be:

```
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@tigermarine.com
CONTACT_EMAIL=ahmed.sh.hammam@gmail.com
DATABASE_URL=your_database_url
```

## Email Address Options

You can use any email address on your verified domain:

- ✅ `noreply@tigermarine.com` (recommended for automated emails)
- ✅ `contact@tigermarine.com`
- ✅ `info@tigermarine.com`
- ✅ `hello@tigermarine.com`
- ✅ `support@tigermarine.com`

**Note:** You don't need to create these email addresses in your email provider. Resend handles sending from any address on your verified domain.

## Testing

1. **Update Railway variable:**
   - Change `EMAIL_FROM` from `onboarding@resend.dev` to `noreply@tigermarine.com`

2. **Test email sending:**
   - Submit a contact form
   - Check that emails come from `noreply@tigermarine.com`
   - Verify emails arrive in your inbox

## DNS Records (If Not Verified Yet)

If your domain isn't verified yet, you need to add these DNS records:

1. **SPF Record:**
   ```
   Type: TXT
   Name: @ (or tigermarine.com)
   Value: v=spf1 include:resend.com ~all
   ```

2. **DKIM Record:**
   - Resend will provide specific DKIM records
   - Add them as TXT records in your DNS

3. **DMARC Record (Optional but Recommended):**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@tigermarine.com
   ```

## Benefits of Using Your Domain

- ✅ Professional sender address
- ✅ Better deliverability
- ✅ Branded emails
- ✅ Higher trust from recipients
- ✅ No "via resend.dev" in email headers

## Troubleshooting

### Domain Not Verified
- Check DNS records are correct
- Wait 24-48 hours for DNS propagation
- Verify records in Resend dashboard

### Emails Not Sending
- Check `EMAIL_FROM` matches your verified domain
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for error logs

### Emails Going to Spam
- Make sure SPF and DKIM records are set
- Add DMARC record
- Warm up your domain (send gradually)
