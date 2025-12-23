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
    try {
      console.log('📁 Determining upload destination...');
      console.log('  File:', file.originalname);
      
      // Get fields from req.body (multer parses them)
      // Note: In multipart/form-data, multer should parse fields before calling destination
      // But sometimes fields aren't available yet, so we check req.body
      const body = req.body || {};
      
      console.log('  Body keys:', Object.keys(body));
      console.log('  Body values:', Object.entries(body).map(([k, v]) => [k, typeof v === 'string' && v.length > 100 ? v.substring(0, 100) + '...' : v]));
      
      const folder = body.folder;
      const modelName = body.modelName;
      const categoryName = body.categoryName;
      
      console.log('  Extracted from body:', { 
        folder: folder || 'MISSING', 
        modelName: modelName || 'MISSING', 
        categoryName: categoryName || 'MISSING' 
      });
      console.log('  All body keys:', Object.keys(body));
      console.log('  Body values:', Object.entries(body).map(([k, v]) => [k, typeof v === 'string' && v.length > 50 ? v.substring(0, 50) + '...' : v]));
      
      if (!folder) {
        console.error('❌ Folder is missing from request body');
        console.error('  Body is:', body);
        console.error('  Body type:', typeof body);
        console.error('  Body keys:', Object.keys(body));
        return cb(new Error('Folder is required. Make sure "folder" field is included in FormData and sent before the file.'));
      }
      
      let uploadPath;
      
      if (folder === 'customizer') {
        // Customizer images: public/Customizer-images/[ModelName]/[PartName]/
        const { partName } = req.body;
        if (!modelName || !partName) {
          return cb(new Error('modelName and partName are required for customizer uploads'));
        }
        uploadPath = path.join(__dirname, '../public/Customizer-images', modelName, partName);
      } else if (folder === 'categories') {
        // Category images: public/images/categories/[CategoryName]/
        if (!categoryName) {
          return cb(new Error('categoryName is required for category uploads'));
        }
        uploadPath = path.join(__dirname, '../public/images/categories', categoryName);
      } else if (folder === 'images') {
        // Regular images: public/images/[ModelName]/
        if (!modelName || modelName.trim() === '') {
          console.error('❌ modelName is missing or empty');
          return cb(new Error('modelName is required for image uploads'));
        }
        const basePath = path.join(__dirname, '../public/images', String(modelName).trim());
        const { subfolder } = req.body;
        if (subfolder === 'Interior') {
          // Interior images: public/images/[ModelName]/Interior/
          uploadPath = path.join(basePath, 'Interior');
        } else {
          uploadPath = basePath;
        }
      } else {
        console.error('❌ Unknown folder type:', folder);
        return cb(new Error(`Unknown folder type: ${folder}`));
      }
      
      console.log('  Upload path:', uploadPath);
      
      // Create directory if it doesn't exist
      await fs.ensureDir(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      console.error('❌ Error determining destination:', error);
      cb(error);
    }
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
    // Log when fileFilter is called
    console.log('🔍 File filter called for:', file.originalname);
    console.log('  Body at filter time:', req.body);
    
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
  // Log incoming request
  console.log('📤 Upload request received');
  console.log('  Content-Type:', req.headers['content-type']);
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error in upload:', err.message);
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, (req, res) => {
  console.log('📤 Upload handler - after multer');
  console.log('  Body:', req.body);
  console.log('  File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
  
  try {
    // Validate folder is present (should be in req.body after multer processes it)
    const folder = req.body?.folder;
    if (!folder) {
      console.error('❌ Folder is missing from request');
      console.error('  Body keys:', Object.keys(req.body || {}));
      console.error('  Body:', req.body);
      return res.status(400).json({ 
        success: false,
        error: 'Folder is required. Make sure "folder" field is included in FormData.',
        received: {
          body: req.body,
          bodyKeys: Object.keys(req.body || {}),
          hasFile: !!req.file
        }
      });
    }
    
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
    
    // File was already saved by multer to the destination determined earlier
    // But if destination failed, req.file.path might not be set correctly
    // So we need to verify the file was saved
    const filePath = req.file.path;
    const fileName = req.file.filename;
    
    console.log('✅ File uploaded successfully:', fileName);
    console.log('  Saved to:', filePath);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      filename: fileName,
      path: filePath,
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

