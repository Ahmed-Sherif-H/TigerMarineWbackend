const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!admin) {
      // Don't reveal if email exists or not (security best practice)
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return success with token
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process login request'
    });
  }
});

// Verify token endpoint (check if user is authenticated)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get fresh admin data from database
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          error: 'Admin user not found'
        });
      }

      res.json({
        success: true,
        data: {
          admin,
          token // Return the same token (client can use it to refresh)
        }
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify token'
    });
  }
});

// Logout endpoint (client-side should remove token)
router.post('/logout', (req, res) => {
  // Since we're using JWT (stateless), logout is handled client-side
  // by removing the token. This endpoint is just for consistency.
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
