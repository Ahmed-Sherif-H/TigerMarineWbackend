require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path');

// Import routes
const modelsRoutes = require('./routes/models');
const categoriesRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');
const inquiriesRoutes = require('./routes/inquiries');

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public folder (images and customizer-images)
const publicPath = path.join(__dirname, 'public');
console.log('📁 Public folder path:', publicPath);

// Serve images
app.use('/images', express.static(path.join(publicPath, 'images'), {
  setHeaders: (res, filePath) => {
    // Set proper headers for images
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    }
  }
}));

// Serve customizer images
app.use('/Customizer-images', express.static(path.join(publicPath, 'Customizer-images')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Tiger Marine Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Tiger Marine Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      models: '/api/models',
      categories: '/api/categories'
    }
  });
});

  // API Routes
  app.use('/api/models', modelsRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/inquiries', inquiriesRoutes);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Tiger Marine Backend API running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: Connected`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

