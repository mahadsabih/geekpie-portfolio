const nodemailer = require('nodemailer');

/**
 * Vercel Serverless Function for Newsletter Subscription
 * Handles email subscriptions and sends confirmation emails
 */

// Set CORS headers on response (Vercel-compatible)
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

// Create Nodemailer transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Validate email
function validateEmail(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return false;
  }
  return true;
}

// Format confirmation email HTML
function formatConfirmationHTML(email) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to GeekPie Newsletter!</h1>
        </div>
        <div class="content">
          <p>Thank you for subscribing to our newsletter!</p>
          <p>You'll now receive the latest news, updates, and special offers from GeekPie.</p>
          <p>If you didn't subscribe, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} GeekPie. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Format notification email for admin
function formatAdminNotificationHTML(email) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .email-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #FF6B35; font-size: 18px; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Newsletter Subscriber</h1>
        </div>
        <div class="content">
          <p>A new user has subscribed to the GeekPie newsletter:</p>
          <div class="email-box">${email}</div>
          <p style="margin-top: 20px;">Date: ${new Date().toLocaleString()}</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from GeekPie</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Main handler
module.exports = async (req, res) => {
  // Set CORS headers for all responses
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
    return;
  }

  try {
    // Parse request body
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const email = data.email?.trim();
    
    // Validate email
    if (!validateEmail(email)) {
      res.status(400).json({ 
        success: false, 
        error: 'Please enter a valid email address' 
      });
      return;
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');
      res.status(500).json({ 
        success: false, 
        error: 'Email service not configured' 
      });
      return;
    }

    // Create transporter
    const transporter = createTransporter();

    // Send confirmation email to subscriber
    const confirmationMail = {
      from: `"GeekPie" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to GeekPie Newsletter!',
      html: formatConfirmationHTML(email),
    };

    // Send notification to admin
    const adminMail = {
      from: `"GeekPie Newsletter" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: 'New Newsletter Subscriber',
      html: formatAdminNotificationHTML(email),
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(confirmationMail),
      transporter.sendMail(adminMail)
    ]);
    
    console.log('Newsletter subscription processed:', email);

    res.status(200).json({ 
      success: true, 
      message: 'Thank you for subscribing! Check your inbox for a confirmation email.'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to subscribe. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
