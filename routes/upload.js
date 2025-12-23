const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const router = express.Router();

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer error:', err.code, err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 50MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  } else if (err) {
    console.error('❌ Upload error:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || 'Upload failed'
    });
  }
  next();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { folder, modelName, categoryName } = req.body;
    
    let uploadPath;
    if (folder === 'customizer') {
      // Customizer images: public/Customizer-images/[ModelName]/[PartName]/    
      const { partName } = req.body;
      uploadPath = path.join(__dirname, '../public/Customizer-images', modelName, partName);                                                                    
    } else if (folder === 'categories') {
      // Category images: public/images/categories/[CategoryName]/
      uploadPath = path.join(__dirname, '../public/images/categories', categoryName || 'default');
    } else {
      // Regular images: public/images/[ModelName]/
      const basePath = path.join(__dirname, '../public/images', modelName);
      const { subfolder } = req.body;
      if (subfolder === 'Interior') {
        // Interior images: public/images/[ModelName]/Interior/
        uploadPath = path.join(basePath, 'Interior');
      } else {
        uploadPath = basePath;
      }
    }
    
    // Create directory if it doesn't exist
    await fs.ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Keep original filename
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

// Upload single file
router.post('/single', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, (req, res) => {
  console.log('📤 Upload request received');
  console.log('  Body:', req.body);
  console.log('  File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
  
  try {
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded',
        received: {
          body: req.body,
          hasFile: !!req.file
        }
      });
    }
    
    console.log('✅ File uploaded successfully:', req.file.filename);
    res.json({
      success: true,
      message: 'File uploaded successfully',
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('  Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Upload multiple files
router.post('/multiple', (req, res, next) => {
  upload.array('files', 20)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, (req, res) => {
  console.log('📤 Multiple upload request received');
  console.log('  Body:', req.body);
  console.log('  Files:', req.files ? req.files.length : 0);
  
  try {
    if (!req.files || req.files.length === 0) {
      console.error('❌ No files in request');
      return res.status(400).json({ 
        success: false,
        error: 'No files uploaded' 
      });
    }
    
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      size: file.size
    }));
    
    console.log('✅ Files uploaded successfully:', uploadedFiles.length);
    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('  Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get list of files in a folder
router.get('/list', (req, res) => {
  try {
    const { folder, modelName, partName } = req.query;
    
    let folderPath;
    if (folder === 'customizer') {
      folderPath = path.join(__dirname, '../public/Customizer-images', modelName, partName);
    } else {
      folderPath = path.join(__dirname, '../public/images', modelName);
    }
    
    if (!fs.existsSync(folderPath)) {
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(folderPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi'].includes(ext);
      })
      .map(file => ({
        filename: file,
        path: folder === 'customizer' 
          ? `/Customizer-images/${modelName}/${partName}/${file}`
          : `/images/${modelName}/${file}`
      }));
    
    res.json({ files });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a file
router.delete('/delete', (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    const fullPath = path.join(__dirname, '../public', filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    fs.unlinkSync(fullPath);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

