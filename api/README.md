# GeekPie Contact Form - Vercel Serverless Function

This directory contains a serverless function for handling contact form submissions with email sending capability via Nodemailer.

## Files

- `contact.js` - Main serverless function handler
- `package.json` - Dependencies (nodemailer)
- `.env.example` - Environment variables template

## Setup Instructions

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Configure Environment Variables

#### For Local Development:
1. Copy `.env.example` to `.env`
2. Fill in your SMTP credentials

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_SECURE` | Use SSL/TLS | `false` |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | `your-app-password` |
| `CONTACT_EMAIL` | Where to send form submissions | `contact@geekpie.com` |

### 3. Gmail Setup (Recommended)

For Gmail, you need to use an **App Password** instead of your regular password:

1. Go to your [Google Account](https://myaccount.google.com/)
2. Navigate to **Security** > **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords** and click it
4. Create a new app password:
   - App name: `GeekPie Contact Form`
   - Select "Mail" and your device
5. Copy the generated 16-character password
6. Use this as your `SMTP_PASS`

### 4. Deploy to Vercel

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy from project root
vercel

# Or deploy to production
vercel --prod
```

### 5. Update Frontend

After deployment, update the API endpoint in `/js/contact-form.js`:

```javascript
const CONFIG = {
    apiEndpoint: 'https://your-vercel-app.vercel.app/api/contact',
    // ...
};
```

## API Endpoint

### POST /api/contact

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Project Inquiry",
    "message": "I would like to discuss a project..."
}
```

**Success Response:**
```json
{
    "success": true,
    "message": "Your message has been sent successfully!",
    "messageId": "<unique-message-id>"
}
```

**Error Response:**
```json
{
    "success": false,
    "errors": ["Valid email address is required"]
}
```

## Testing Locally

You can test the function locally using Vercel CLI:

```bash
# From project root
vercel dev

# Or test with curl
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## Security Notes

- Never commit `.env` files to version control
- Use App Passwords for Gmail (not your main password)
- The function includes CORS headers for cross-origin requests
- Input validation is performed on all fields
- HTML is escaped to prevent XSS attacks

## Troubleshooting

### "Email service not configured"
- Check that `SMTP_USER` and `SMTP_PASS` are set in Vercel environment variables

### "Invalid login"
- For Gmail, ensure you're using an App Password, not your regular password
- Check that 2-Factor Authentication is enabled

### "Connection timeout"
- Verify `SMTP_HOST` and `SMTP_PORT` are correct
- Some hosting providers block SMTP ports; consider using port 587 with `SMTP_SECURE=false`

### Form not submitting
- Check browser console for errors
- Verify the API endpoint URL in `contact-form.js`
- Ensure the function is deployed and accessible
