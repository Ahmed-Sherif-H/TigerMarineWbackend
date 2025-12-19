# Email Setup Guide

## Configuration

1. **Create a `.env` file** in the backend folder (copy from `.env.example`)

2. **For Gmail:**
   - Go to your Google Account settings
   - Enable 2-Step Verification
   - Generate an "App Password" (not your regular password)
   - Use the App Password in `EMAIL_PASSWORD`

3. **Update `.env` file:**
   ```
   EMAIL_USER=ahmed.sh.hammam@gmail.com
   EMAIL_PASSWORD=your-app-password-here
   CONTACT_EMAIL=ahmed.sh.hammam@gmail.com
   ```

## Testing

1. Start the backend server
2. Submit a contact form or customizer inquiry
3. Check the email inbox for the inquiry

## Database Storage

All inquiries are stored in the `Inquiry` table with:
- Contact information
- Customization details (for customizer inquiries)
- Timestamps

## API Endpoints

- `POST /api/inquiries/contact` - Submit contact form
- `POST /api/inquiries/customizer` - Submit customizer inquiry
- `GET /api/inquiries` - Get all inquiries (for admin)


