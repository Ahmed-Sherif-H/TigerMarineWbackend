const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { sendContactEmail, sendCustomizerInquiry } = require('../services/emailService');

// Submit contact form
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Send email
    try {
      await sendContactEmail({ name, email, phone, subject, message });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Continue to save even if email fails
    }

    // Save to database
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

    res.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: { id: inquiry.id }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit contact form'
    });
  }
});

// Submit customizer inquiry
router.post('/customizer', async (req, res) => {
  try {
    const { name, email, phone, modelName, selectedColors, selectedFeatures, message } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Send email
    try {
      await sendCustomizerInquiry({
        name,
        email,
        phone,
        modelName,
        selectedColors,
        selectedFeatures,
        message
      });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Continue to save even if email fails
    }

    // Save to database
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

    res.json({
      success: true,
      message: 'Customizer inquiry submitted successfully',
      data: { id: inquiry.id }
    });
  } catch (error) {
    console.error('Customizer inquiry error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit customizer inquiry'
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


