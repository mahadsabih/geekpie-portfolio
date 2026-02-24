const nodemailer = require('nodemailer');

/**
 * Vercel Serverless Function for Contact Form
 * Handles form submissions and sends emails via SMTP
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
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Validate form data
function validateFormData(data) {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message is required and must be at least 10 characters');
  }
  
  return errors;
}

// Format email HTML
function formatEmailHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #FF6B35; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${escapeHtml(data.name)}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>
          </div>
          ${data.subject ? `
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${escapeHtml(data.subject)}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from the GeekPie contact form</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
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
    
    // Validate form data
    const errors = validateFormData(data);
    if (errors.length > 0) {
      res.status(400).json({ 
        success: false, 
        errors 
      });
      return;
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');
      res.status(500).json({ 
        success: false, 
        error: 'Email service not configured. Please set SMTP environment variables.' 
      });
      return;
    }

    // Create transporter
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: `"GeekPie Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: data.email,
      subject: data.subject ? `Contact Form: ${data.subject}` : 'New Contact Form Submission',
      text: `
Name: ${data.name}
Email: ${data.email}
${data.subject ? `Subject: ${data.subject}` : ''}

Message:
${data.message}
      `.trim(),
      html: formatEmailHTML(data),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);

    res.status(200).json({ 
      success: true, 
      message: 'Your message has been sent successfully! We will get back to you soon.',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send message. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
