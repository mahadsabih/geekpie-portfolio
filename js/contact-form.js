/**
 * GeekPie Contact Form & Newsletter Handler
 * Handles form submission to Vercel serverless functions
 */

(function() {
    'use strict';

    // Configuration - Update this URL after deploying to Vercel
    const CONFIG = {
        // Replace with your Vercel deployment URL
        contactEndpoint: window.location.origin + '/api/contact',
        newsletterEndpoint: window.location.origin + '/api/newsletter',
        // For local development or different deployment:
        // contactEndpoint: 'https://your-vercel-app.vercel.app/api/contact',
        // newsletterEndpoint: 'https://your-vercel-app.vercel.app/api/newsletter',
        
        // Form selectors
        formSelector: '.wpcf7-form',
        submitButtonSelector: '.wpcf7-submit',
        responseOutputSelector: '.wpcf7-response-output',
        
        // Messages
        messages: {
            contact: {
                sending: 'Sending your message...',
                success: 'Thank you for your message. We will get back to you soon!',
                error: 'There was an error sending your message. Please try again.',
                validation: 'Please fill in all required fields correctly.'
            },
            newsletter: {
                sending: 'Subscribing...',
                success: 'Thank you for subscribing! Check your inbox for confirmation.',
                error: 'Failed to subscribe. Please try again.',
                validation: 'Please enter a valid email address.'
            }
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        const forms = document.querySelectorAll(CONFIG.formSelector);
        
        forms.forEach(form => {
            // Determine form type based on class
            const isNewsletter = form.classList.contains('form-style4');
            
            if (isNewsletter) {
                form.addEventListener('submit', handleNewsletterSubmit);
            } else {
                form.addEventListener('submit', handleSubmit);
            }
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector(CONFIG.submitButtonSelector);
        const responseOutput = form.querySelector(CONFIG.responseOutputSelector);
        
        // Get form data
        const formData = {
            name: form.querySelector('input[name="your-name"]')?.value?.trim() || '',
            email: form.querySelector('input[name="your-email"]')?.value?.trim() || '',
            subject: form.querySelector('input[name="your-subject"]')?.value?.trim() || '',
            message: form.querySelector('textarea[name="your-message"]')?.value?.trim() || ''
        };

        // Debug logging
        console.log('=== Contact Form Debug ===');
        console.log('Form element:', form);
        console.log('Form class:', form.className);
        console.log('Form data extracted:', formData);
        console.log('Name length:', formData.name.length);
        console.log('Email:', formData.email, 'Valid:', validateEmail(formData.email));
        console.log('Message length:', formData.message.length);
        console.log('Name input element:', form.querySelector('input[name="your-name"]'));
        console.log('Email input element:', form.querySelector('input[name="your-email"]'));
        console.log('Message input element:', form.querySelector('textarea[name="your-message"]'));

        // Validate
        if (!validateContactForm(formData)) {
            console.log('Validation FAILED');
            showResponse(responseOutput, CONFIG.messages.contact.validation, 'error');
            return;
        }
        console.log('Validation PASSED - sending to API');

        // Show sending state
        setSubmittingState(submitBtn, true);
        showResponse(responseOutput, CONFIG.messages.contact.sending, 'sending');

        try {
            const response = await fetch(CONFIG.contactEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                showResponse(responseOutput, result.message || CONFIG.messages.contact.success, 'success');
                form.reset();
            } else {
                const errorMsg = result.errors ? result.errors.join(', ') : result.error || CONFIG.messages.contact.error;
                showResponse(responseOutput, errorMsg, 'error');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            showResponse(responseOutput, CONFIG.messages.contact.error, 'error');
        } finally {
            setSubmittingState(submitBtn, false);
        }
    }

    async function handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector(CONFIG.submitButtonSelector);
        const responseOutput = form.querySelector(CONFIG.responseOutputSelector);
        
        // Get email from form
        const email = form.querySelector('input[name="your-email"]')?.value?.trim() || '';

        // Validate email
        if (!validateEmail(email)) {
            showResponse(responseOutput, CONFIG.messages.newsletter.validation, 'error');
            return;
        }

        // Show sending state
        setSubmittingState(submitBtn, true);
        showResponse(responseOutput, CONFIG.messages.newsletter.sending, 'sending');

        try {
            const response = await fetch(CONFIG.newsletterEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (result.success) {
                showResponse(responseOutput, result.message || CONFIG.messages.newsletter.success, 'success');
                form.reset();
            } else {
                showResponse(responseOutput, result.error || CONFIG.messages.newsletter.error, 'error');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            showResponse(responseOutput, CONFIG.messages.newsletter.error, 'error');
        } finally {
            setSubmittingState(submitBtn, false);
        }
    }

    function validateContactForm(data) {
        // Name validation
        if (!data.name || data.name.length < 2) return false;
        
        // Email validation
        if (!validateEmail(data.email)) return false;
        
        // Message validation
        if (!data.message || data.message.length < 10) return false;
        
        return true;
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email && emailRegex.test(email);
    }

    function showResponse(element, message, type) {
        if (!element) return;
        
        element.textContent = message;
        element.style.display = 'block';
        
        // Remove all status classes
        element.classList.remove('wpcf7-mail-sent-ok', 'wpcf7-validation-errors', 'wpcf7-spam-blocked');
        
        // Add appropriate class
        switch (type) {
            case 'success':
                element.classList.add('wpcf7-mail-sent-ok');
                element.style.borderColor = '#46b450';
                element.style.color = '#46b450';
                break;
            case 'error':
                element.classList.add('wpcf7-validation-errors');
                element.style.borderColor = '#dc3232';
                element.style.color = '#dc3232';
                break;
            case 'sending':
                element.style.borderColor = '#ffb900';
                element.style.color = '#ffb900';
                break;
        }
    }

    function setSubmittingState(button, isSubmitting) {
        if (!button) return;
        
        button.disabled = isSubmitting;
        
        if (isSubmitting) {
            button.dataset.originalText = button.value;
            button.value = 'Sending...';
        } else {
            button.value = button.dataset.originalText || 'Submit';
        }
    }

})();
