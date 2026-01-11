const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Authentication middleware
 * Verifies JWT token and attaches admin info to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get admin from database to ensure they still exist
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true
        }
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          error: 'Admin user not found'
        });
      }

      // Attach admin info to request
      req.admin = admin;
      req.token = token;

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token. Please login again.'
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

module.exports = { authenticate };
