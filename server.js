require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://tigermarineweb.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174'
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
app.use('/images', express.static(path.join(publicPath, 'images')));
app.use('/Customizer-images', express.static(path.join(publicPath, 'Customizer-images')));

// Routes
app.use('/api/models', require('./routes/models'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/events', require('./routes/events'));

// API root endpoint - list available endpoints
app.get('/api', (req, res) => {
  res.json({
    name: 'Tiger Marine Backend API',
    version: '1.0.0',
    status: 'ok',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      health: 'GET /api/health - Health check',
      models: {
        list: 'GET /api/models - Get all models',
        get: 'GET /api/models/:id - Get single model',
        create: 'POST /api/models - Create new model (admin)',
        update: 'PUT /api/models/:id - Update model (admin)',
        delete: 'DELETE /api/models/:id - Delete model (admin)'
      },
      categories: {
        list: 'GET /api/categories - Get all categories',
        get: 'GET /api/categories/:id - Get single category',
        create: 'POST /api/categories - Create category (admin)',
        update: 'PUT /api/categories/:id - Update category (admin)',
        delete: 'DELETE /api/categories/:id - Delete category (admin)'
      },
      events: {
        list: 'GET /api/events - Get all events',
        get: 'GET /api/events/:id - Get single event',
        create: 'POST /api/events - Create event (admin)',
        update: 'PUT /api/events/:id - Update event (admin)',
        delete: 'DELETE /api/events/:id - Delete event (admin)'
      },
      inquiries: {
        contact: 'POST /api/inquiries/contact - Submit contact form',
        customizer: 'POST /api/inquiries/customizer - Submit customizer inquiry',
        list: 'GET /api/inquiries - Get all inquiries (admin)'
      },
      upload: {
        single: 'POST /api/upload/single - Upload single file',
        multiple: 'POST /api/upload/multiple - Upload multiple files',
        list: 'GET /api/upload/list - List files in folder',
        delete: 'DELETE /api/upload/delete - Delete file'
      }
    },
    documentation: 'See API_ENDPOINTS.md for detailed documentation'
  });
});

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

// Ensure required directories exist on startup
const ensureDirectories = async () => {
  const categoryTypes = ['TopLine', 'MaxLine', 'ProLine', 'Open', 'SportLine'];
  const dirs = [
    path.join(__dirname, 'public', 'Customizer-images'),
    ...categoryTypes.map(type => path.join(__dirname, 'public', 'images', 'categories', type))
  ];
  
  for (const dir of dirs) {
    await fs.ensureDir(dir);
    console.log(`✅ Ensured directory exists: ${dir}`);
  }
};

// Start server
(async () => {
  try {
    // Debug: Check environment variables
    console.log('🔍 Environment variables check:');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    console.log('All DB-related vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DB')));
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set!');
      console.error('Please set DATABASE_URL in Railway Web Service variables');
      process.exit(1);
    }
    
    // Ensure directories exist
    await ensureDirectories();
    
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
      console.log(`📁 Static files served from: ${publicPath}`);
      console.log(`⚠️  IMPORTANT: On Render, uploaded files are EPHEMERAL and will be lost on redeploy!`);
      console.log(`   Consider using cloud storage (S3, Cloudinary, etc.) for production.`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
})();
