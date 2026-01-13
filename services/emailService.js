const nodemailer = require('nodemailer');

// Create transporter - configure with your email service
// For Gmail, you'll need an App Password
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || 'ahmed.sh.hammam@gmail.com';
  let emailPass = process.env.EMAIL_PASSWORD || '';
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Remove spaces from App Password (Gmail displays with spaces but needs without)
  if (emailPass) {
    emailPass = emailPass.replace(/\s+/g, ''); // Remove all spaces
  }
  
  if (isDev) {
    console.log('📧 Creating email transporter');
    console.log('  Email user:', emailUser);
    console.log('  Has password:', !!emailPass);
    console.log('  Password length:', emailPass ? emailPass.length : 0);
  }
  
  if (!emailPass) {
    console.error('❌ EMAIL_PASSWORD not set! Emails will fail.');
    console.error('   Please set EMAIL_PASSWORD in your .env file or Railway variables.');
    console.error('   For Gmail: Use an App Password (not your regular password)');
    console.error('   Note: Remove spaces from App Password (16 characters, no spaces)');
    throw new Error('EMAIL_PASSWORD environment variable is not set');
  }
  
  // Validate App Password format (should be 16 characters)
  if (emailPass.length !== 16) {
    console.warn('⚠️  Warning: App Password should be 16 characters. Current length:', emailPass.length);
    console.warn('   Make sure you removed all spaces from the App Password');
  }
  
  // Use explicit SMTP configuration for better reliability
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    // Retry configuration
    pool: true,
    maxConnections: 1,
    maxMessages: 3,
  });
};

// Send contact form email
const sendContactEmail = async (contactData) => {
  const transporter = createTransporter();
  const isDev = process.env.NODE_ENV !== 'production';
  
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
    // Verify connection first
    if (isDev) {
      console.log('🔍 Verifying SMTP connection...');
    }
    await transporter.verify();
    
    if (isDev) {
      console.log('✅ SMTP connection verified');
      console.log('📤 Sending email...');
    }
    
    const info = await transporter.sendMail(mailOptions);
    
    if (isDev) {
      console.log('✅ Email sent successfully:', info.messageId);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    
    // More detailed error logging
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('   Connection timeout/refused. Check:');
      console.error('   1. Gmail App Password is correct');
      console.error('   2. 2-Step Verification is enabled');
      console.error('   3. Network/firewall allows SMTP connections');
      console.error('   4. Railway allows outbound SMTP (port 587)');
    } else if (error.code === 'EAUTH') {
      console.error('   Authentication failed. Check:');
      console.error('   1. EMAIL_USER is correct');
      console.error('   2. EMAIL_PASSWORD is a valid App Password (not regular password)');
    }
    
    throw new Error('Failed to send email: ' + error.message);
  } finally {
    // Close the transporter connection
    transporter.close();
  }
};

// Send customizer inquiry email
const sendCustomizerInquiry = async (inquiryData) => {
  const transporter = createTransporter();
  const isDev = process.env.NODE_ENV !== 'production';
  
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
    // Verify connection first
    if (isDev) {
      console.log('🔍 Verifying SMTP connection...');
    }
    await transporter.verify();
    
    if (isDev) {
      console.log('✅ SMTP connection verified');
      console.log('📤 Sending email...');
    }
    
    const info = await transporter.sendMail(mailOptions);
    
    if (isDev) {
      console.log('✅ Email sent successfully:', info.messageId);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    
    // More detailed error logging
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('   Connection timeout/refused. Check:');
      console.error('   1. Gmail App Password is correct');
      console.error('   2. 2-Step Verification is enabled');
      console.error('   3. Network/firewall allows SMTP connections');
      console.error('   4. Railway allows outbound SMTP (port 587)');
    } else if (error.code === 'EAUTH') {
      console.error('   Authentication failed. Check:');
      console.error('   1. EMAIL_USER is correct');
      console.error('   2. EMAIL_PASSWORD is a valid App Password (not regular password)');
    }
    
    throw new Error('Failed to send email: ' + error.message);
  } finally {
    // Close the transporter connection
    transporter.close();
  }
};

module.exports = {
  sendContactEmail,
  sendCustomizerInquiry,
};


