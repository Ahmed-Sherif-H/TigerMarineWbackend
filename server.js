require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://tigermarine.com',
  'https://www.tigermarine.com',
  'https://tigermarineweb.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean);

// Log allowed origins on startup
console.log('🌐 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed || normalizedOrigin.startsWith(normalizedAllowed);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${normalizedOrigin}`);
      console.warn(`   Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Static files
const publicPath = path.join(__dirname, 'public');
// Use express.static with options to handle URL encoding properly
app.use('/images', express.static(path.join(publicPath, 'images'), {
  setHeaders: (res, filePath) => {
    // Set CORS headers for static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    // Set proper content type for images
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    }
  }
}));
app.use('/Customizer-images', express.static(path.join(publicPath, 'Customizer-images')));

// Routes
app.use('/api/models', require('./routes/models'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/events', require('./routes/events'));
app.use('/api/dealers', require('./routes/dealers'));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    requestOrigin: req.headers.origin,
    env: {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPassword: !!process.env.EMAIL_PASSWORD,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasFrontendUrl: !!process.env.FRONTEND_URL
    }
  });
});

// Test upload endpoint (without file)
app.post('/api/upload/test', (req, res) => {
  console.log('🧪 Upload test endpoint hit');
  console.log('  Body:', req.body);
  res.json({ 
    success: true, 
    message: 'Upload endpoint is accessible',
    body: req.body
  });
});

// Test inquiry endpoint
app.post('/api/inquiries/test', (req, res) => {
  console.log('🧪 Inquiry test endpoint hit');
  console.log('  Body:', req.body);
  res.json({ 
    success: true, 
    message: 'Inquiry endpoint is accessible',
    body: req.body
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins
  });
});

// Events test endpoint
app.get('/api/events/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Events route is accessible',
    timestamp: new Date().toISOString()
  });
});

// Start server
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
})();
