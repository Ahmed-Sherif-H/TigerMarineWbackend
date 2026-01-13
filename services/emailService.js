const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Send contact form email
const sendContactEmail = async (contactData) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set! Emails will fail.');
    console.error('   Please set RESEND_API_KEY in your .env file or Railway variables.');
    console.error('   Get your API key from: https://resend.com/api-keys');
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const toEmail = process.env.CONTACT_EMAIL || 'ahmed.sh.hammam@gmail.com';

  if (isDev) {
    console.log('📧 Sending email via Resend...');
    console.log('  From:', fromEmail);
    console.log('  To:', toEmail);
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Contact Form: ${contactData.subject || 'New Inquiry'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${contactData.subject || 'No subject'}</p>
        <p><strong>Message:</strong></p>
        <p>${contactData.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Sent from Tiger Marine Contact Form</small></p>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${contactData.name}
        Email: ${contactData.email}
        Phone: ${contactData.phone || 'Not provided'}
        Subject: ${contactData.subject || 'No subject'}
        
        Message:
        ${contactData.message}
        
        ---
        Sent from Tiger Marine Contact Form
      `,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw new Error('Failed to send email: ' + JSON.stringify(error));
    }

    if (isDev) {
      console.log('✅ Email sent successfully via Resend:', data?.id);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Send customizer inquiry email
const sendCustomizerInquiry = async (inquiryData) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set! Emails will fail.');
    console.error('   Please set RESEND_API_KEY in your .env file or Railway variables.');
    console.error('   Get your API key from: https://resend.com/api-keys');
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const toEmail = process.env.CONTACT_EMAIL || 'ahmed.sh.hammam@gmail.com';

  // Format selected colors
  const colorsList = Object.entries(inquiryData.selectedColors || {})
    .map(([part, color]) => `  • ${part}: ${color}`)
    .join('<br>');
  
  // Format optional features
  const featuresList = (inquiryData.selectedFeatures || [])
    .map(feature => `  • ${feature}`)
    .join('<br>') || 'None selected';

  if (isDev) {
    console.log('📧 Sending customizer inquiry via Resend...');
    console.log('  From:', fromEmail);
    console.log('  To:', toEmail);
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Customizer Inquiry: ${inquiryData.modelName || 'Model Inquiry'}`,
      html: `
        <h2>New Customizer Inquiry</h2>
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${inquiryData.name}</p>
        <p><strong>Email:</strong> ${inquiryData.email}</p>
        <p><strong>Phone:</strong> ${inquiryData.phone || 'Not provided'}</p>
        <p><strong>Model:</strong> ${inquiryData.modelName || 'Not specified'}</p>
        
        <h3>Customization Details</h3>
        <p><strong>Selected Colors:</strong></p>
        <p>${colorsList || 'None selected'}</p>
        
        <p><strong>Optional Features:</strong></p>
        <p>${featuresList}</p>
        
        ${inquiryData.message ? `
          <h3>Additional Message</h3>
          <p>${inquiryData.message.replace(/\n/g, '<br>')}</p>
        ` : ''}
        
        <hr>
        <p><small>Sent from Tiger Marine Customizer</small></p>
      `,
      text: `
        New Customizer Inquiry
        
        Customer Information:
        Name: ${inquiryData.name}
        Email: ${inquiryData.email}
        Phone: ${inquiryData.phone || 'Not provided'}
        Model: ${inquiryData.modelName || 'Not specified'}
        
        Customization Details:
        Selected Colors:
        ${Object.entries(inquiryData.selectedColors || {})
          .map(([part, color]) => `  • ${part}: ${color}`)
          .join('\n') || 'None selected'}
        
        Optional Features:
        ${(inquiryData.selectedFeatures || []).join('\n  • ') || 'None selected'}
        
        ${inquiryData.message ? `Additional Message:\n${inquiryData.message}` : ''}
        
        ---
        Sent from Tiger Marine Customizer
      `,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      throw new Error('Failed to send email: ' + JSON.stringify(error));
    }

    if (isDev) {
      console.log('✅ Email sent successfully via Resend:', data?.id);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

module.exports = {
  sendContactEmail,
  sendCustomizerInquiry,
};
