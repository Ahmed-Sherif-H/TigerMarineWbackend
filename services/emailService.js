const nodemailer = require('nodemailer');

// Create transporter - configure with your email service
// For Gmail, you'll need an App Password
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || 'ahmed.sh.hammam@gmail.com';
  const emailPass = process.env.EMAIL_PASSWORD || '';
  
  console.log('📧 Creating email transporter');
  console.log('  Email user:', emailUser);
  console.log('  Has password:', !!emailPass);
  
  if (!emailPass) {
    console.warn('⚠️ EMAIL_PASSWORD not set! Emails will fail.');
  }
  
  return nodemailer.createTransport({
    service: 'gmail', // You can use 'gmail', 'outlook', 'yahoo', etc.
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

// Send contact form email
const sendContactEmail = async (contactData) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'ahmed.sh.hammam@gmail.com',
    to: process.env.CONTACT_EMAIL || 'ahmed.sh.hammam@gmail.com',
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
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Send customizer inquiry email
const sendCustomizerInquiry = async (inquiryData) => {
  const transporter = createTransporter();
  
  // Format selected colors
  const colorsList = Object.entries(inquiryData.selectedColors || {})
    .map(([part, color]) => `  • ${part}: ${color}`)
    .join('<br>');
  
  // Format optional features
  const featuresList = (inquiryData.selectedFeatures || [])
    .map(feature => `  • ${feature}`)
    .join('<br>') || 'None selected';

  const mailOptions = {
    from: process.env.EMAIL_USER || 'ahmed.sh.hammam@gmail.com',
    to: process.env.CONTACT_EMAIL || 'ahmed.sh.hammam@gmail.com',
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
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

module.exports = {
  sendContactEmail,
  sendCustomizerInquiry,
};


