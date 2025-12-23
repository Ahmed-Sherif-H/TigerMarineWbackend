const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { sendContactEmail, sendCustomizerInquiry } = require('../services/emailService');

// Submit contact form
router.post('/contact', async (req, res) => {
  console.log('📧 Contact form request received');
  console.log('  Method:', req.method);
  console.log('  Headers:', req.headers['content-type']);
  console.log('  Body keys:', Object.keys(req.body));
  console.log('  Body:', { 
    name: req.body.name ? '...' : null,
    email: req.body.email ? '...' : null,
    phone: req.body.phone ? '...' : null,
    subject: req.body.subject ? '...' : null,
    hasMessage: !!req.body.message
  });
  
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      console.error('❌ Validation failed:', { name: !!name, email: !!email, message: !!message });
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Save to database first (faster response)
    console.log('💾 Saving to database...');
    const inquiry = await prisma.inquiry.create({
      data: {
        type: 'contact',
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      }
    });
    console.log('✅ Inquiry saved:', inquiry.id);

    // Send email asynchronously (don't wait for it)
    // This allows the API to respond quickly even if email is slow
    sendContactEmail({ name, email, phone, subject, message })
      .then(() => {
        console.log('✅ Email sent successfully (async)');
      })
      .catch((emailError) => {
        console.error('❌ Email send failed (async):', emailError.message);
        // Email failure doesn't affect the response
      });

    // Respond immediately after saving to DB
    res.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: { id: inquiry.id }
    });
  } catch (error) {
    console.error('❌ Contact form error:', error);
    console.error('  Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit contact form',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Submit customizer inquiry
router.post('/customizer', async (req, res) => {
  console.log('🎨 Customizer inquiry request received');
  console.log('  Body:', { 
    name: req.body.name, 
    email: req.body.email, 
    modelName: req.body.modelName,
    hasColors: !!req.body.selectedColors,
    hasFeatures: !!req.body.selectedFeatures
  });
  
  try {
    const { name, email, phone, modelName, selectedColors, selectedFeatures, message } = req.body;

    // Validate required fields
    if (!name || !email) {
      console.error('❌ Validation failed:', { name: !!name, email: !!email });
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Save to database first (faster response)
    console.log('💾 Saving to database...');
    const inquiry = await prisma.inquiry.create({
      data: {
        type: 'customizer',
        name,
        email,
        phone: phone || null,
        modelName: modelName || null,
        selectedColors: selectedColors ? JSON.stringify(selectedColors) : null,
        selectedFeatures: selectedFeatures ? JSON.stringify(selectedFeatures) : null,
        message: message || null,
      }
    });
    console.log('✅ Inquiry saved:', inquiry.id);

    // Send email asynchronously (don't wait for it)
    // This allows the API to respond quickly even if email is slow
    sendCustomizerInquiry({
      name,
      email,
      phone,
      modelName,
      selectedColors,
      selectedFeatures,
      message
    })
      .then(() => {
        console.log('✅ Email sent successfully (async)');
      })
      .catch((emailError) => {
        console.error('❌ Email send failed (async):', emailError.message);
        // Email failure doesn't affect the response
      });

    // Respond immediately after saving to DB
    res.json({
      success: true,
      message: 'Customizer inquiry submitted successfully',
      data: { id: inquiry.id }
    });
  } catch (error) {
    console.error('❌ Customizer inquiry error:', error);
    console.error('  Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit customizer inquiry',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all inquiries (for admin)
router.get('/', async (req, res) => {
  try {
    const { type, limit = 50, offset = 0 } = req.query;
    
    const where = type ? { type } : {};
    
    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.inquiry.count({ where });

    res.json({
      success: true,
      data: inquiries,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch inquiries'
    });
  }
});

module.exports = router;


