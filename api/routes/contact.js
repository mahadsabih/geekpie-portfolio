/**
 * Contact and Newsletter Routes for GeekPie Portfolio
 * Handles contact form submissions and newsletter subscriptions
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// ============================================
// Contact Form Submission
// ============================================
router.post('/contact', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => err.msg)
      });
    }

    const { name, email, subject, message } = req.body;

    // Log the contact submission (in production, you'd send an email or save to DB)
    console.log('=== New Contact Form Submission ===');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Subject: ${subject || 'No subject'}`);
    console.log(`Message: ${message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('===================================');

    // TODO: In production, implement one of these options:
    // 1. Send email using SendGrid, Mailgun, AWS SES, etc.
    // 2. Save to database for admin review
    // 3. Send to Slack/Discord webhook
    // 4. Use a service like Formspree or EmailJS

    // For now, we'll simulate a successful submission
    // In production, replace this with actual email sending logic
    
    // Example: Save to a Contact model (if you create one)
    // const Contact = require('../models/Contact');
    // await Contact.create({ name, email, subject, message });

    // Example: Send email notification
    // await sendEmail({
    //   to: 'admin@geekpie.com',
    //   subject: `New Contact Form: ${subject || 'No Subject'}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${message}</p>
    //   `
    // });

    res.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// Newsletter Subscription
// ============================================
router.post('/newsletter', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg
      });
    }

    const { email } = req.body;

    // Log the subscription (in production, save to DB or send to email service)
    console.log('=== New Newsletter Subscription ===');
    console.log(`Email: ${email}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('===================================');

    // TODO: In production, implement one of these options:
    // 1. Save to Newsletter model in database
    // 2. Subscribe via Mailchimp, ConvertKit, etc.
    // 3. Send confirmation email

    // Example: Save to database
    // const Newsletter = require('../models/Newsletter');
    // await Newsletter.create({ email });

    // Example: Subscribe to Mailchimp
    // await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
    //   email_address: email,
    //   status: 'subscribed'
    // });

    res.json({
      success: true,
      message: 'Thank you for subscribing! Check your inbox for confirmation.'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'This email is already subscribed to our newsletter.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to subscribe. Please try again later.'
    });
  }
});

// ============================================
// Get Contact Submissions (Admin Only)
// ============================================
router.get('/contact/submissions', async (req, res) => {
  try {
    // TODO: Add authentication middleware for admin access
    // For now, return a placeholder response
    
    res.json({
      success: true,
      message: 'Contact submissions endpoint - requires admin authentication',
      note: 'Implement authentication middleware to access submissions'
    });

    // In production with authentication:
    // const Contact = require('../models/Contact');
    // const submissions = await Contact.find().sort({ createdAt: -1 });
    // res.json({ success: true, data: submissions });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submissions'
    });
  }
});

module.exports = router;
