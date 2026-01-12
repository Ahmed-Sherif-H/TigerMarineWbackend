const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { authenticate } = require('../middleware/auth');
const cloudinaryService = require('../services/cloudinaryService');

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

// Configure multer to store files in memory (for Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage, // Memory storage for Cloudinary
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.log('🔍 File filter called for:', file.originalname);
    }
    
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

// Upload single file (admin only) - Now uses Cloudinary
router.post('/single', authenticate, upload.single('file'), async (req, res) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  try {
    // Validate folder is present
    const folder = req.body?.folder;
    if (!folder) {
      return res.status(400).json({ 
        success: false,
        error: 'Folder is required. Make sure "folder" field is included in FormData.'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded'
      });
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'
      });
    }

    const { modelName, categoryName, subfolder, partName } = req.body;
    let cloudinaryFolder;

    // Determine Cloudinary folder based on upload type
    if (folder === 'events') {
      // Event images
      cloudinaryFolder = cloudinaryService.getEventsFolder();
    } else if (folder === 'customizer') {
      if (!modelName || !partName) {
        return res.status(400).json({
          success: false,
          error: 'modelName and partName are required for customizer uploads'
        });
      }
      cloudinaryFolder = cloudinaryService.getCustomizerFolder(modelName, partName);
    } else if (folder === 'categories') {
      if (!categoryName) {
        return res.status(400).json({
          success: false,
          error: 'categoryName is required for category uploads'
        });
      }
      cloudinaryFolder = cloudinaryService.getCategoryFolder(categoryName);
    } else if (folder === 'images') {
      if (!modelName || modelName.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'modelName is required for image uploads'
        });
      }
      const imageType = subfolder === 'Interior' ? 'interior' : 'main';
      cloudinaryFolder = cloudinaryService.getModelFolder(modelName, imageType);
    } else {
      return res.status(400).json({
        success: false,
        error: `Unknown folder type: ${folder}. Supported: events, customizer, categories, images`
      });
    }

    if (isDev) {
      console.log('📤 Uploading to Cloudinary...');
      console.log('  Folder:', cloudinaryFolder);
      console.log('  Filename:', req.file.originalname);
    }

    // Upload to Cloudinary
    const result = await cloudinaryService.uploadFile(
      req.file.buffer,
      cloudinaryFolder,
      req.file.originalname
    );

    if (isDev) {
      console.log('✅ File uploaded to Cloudinary:', result.secure_url);
    }

    // Return Cloudinary URL and public_id
    res.json({
      success: true,
      message: 'File uploaded successfully to Cloudinary',
      url: result.secure_url,
      public_id: result.public_id,
      filename: req.file.originalname,
      size: req.file.size,
      format: result.format,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to upload file to Cloudinary',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Upload multiple files (admin only) - Now uses Cloudinary
router.post('/multiple', authenticate, upload.array('files', 20), async (req, res) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No files uploaded' 
      });
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'
      });
    }

    const { folder, modelName, categoryName, subfolder, partName } = req.body;
    let cloudinaryFolder;

    // Determine Cloudinary folder
    if (folder === 'events') {
      // Event images
      cloudinaryFolder = cloudinaryService.getEventsFolder();
    } else if (folder === 'customizer') {
      if (!modelName || !partName) {
        return res.status(400).json({
          success: false,
          error: 'modelName and partName are required for customizer uploads'
        });
      }
      cloudinaryFolder = cloudinaryService.getCustomizerFolder(modelName, partName);
    } else if (folder === 'categories') {
      if (!categoryName) {
        return res.status(400).json({
          success: false,
          error: 'categoryName is required for category uploads'
        });
      }
      cloudinaryFolder = cloudinaryService.getCategoryFolder(categoryName);
    } else if (folder === 'images') {
      if (!modelName) {
        return res.status(400).json({
          success: false,
          error: 'modelName is required for image uploads'
        });
      }
      const imageType = subfolder === 'Interior' ? 'interior' : 'main';
      cloudinaryFolder = cloudinaryService.getModelFolder(modelName, imageType);
    } else {
      return res.status(400).json({
        success: false,
        error: `Unknown folder type: ${folder}. Supported: events, customizer, categories, images`
      });
    }

    if (isDev) {
      console.log('📤 Uploading', req.files.length, 'files to Cloudinary...');
      console.log('  Folder:', cloudinaryFolder);
    }

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map(file => 
      cloudinaryService.uploadFile(
        file.buffer,
        cloudinaryFolder,
        file.originalname
      )
    );

    const results = await Promise.all(uploadPromises);

    const uploadedFiles = results.map((result, index) => ({
      url: result.secure_url,
      public_id: result.public_id,
      filename: req.files[index].originalname,
      size: req.files[index].size,
      format: result.format,
      width: result.width,
      height: result.height
    }));

    if (isDev) {
      console.log('✅ Files uploaded successfully:', uploadedFiles.length);
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully to Cloudinary`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to upload files to Cloudinary',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get list of files in a folder (admin only) - Now lists from Cloudinary
router.get('/list', authenticate, async (req, res) => {
  const isDev = process.env.NODE_ENV !== 'production';
  try {
    const { folder, modelName, categoryName, partName, subfolder } = req.query;
    
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'
      });
    }

    let cloudinaryFolder;

    // Determine Cloudinary folder
    if (folder === 'events') {
      cloudinaryFolder = cloudinaryService.getEventsFolder();
    } else if (folder === 'customizer') {
      if (!modelName || !partName) {
        return res.status(400).json({
          success: false,
          error: 'modelName and partName are required for customizer uploads'
        });
      }
      cloudinaryFolder = cloudinaryService.getCustomizerFolder(modelName, partName);
    } else if (folder === 'categories') {
      if (!categoryName) {
        return res.status(400).json({
          success: false,
          error: 'categoryName is required for category uploads'
        });
      }
      cloudinaryFolder = cloudinaryService.getCategoryFolder(categoryName);
    } else if (folder === 'images') {
      if (!modelName || modelName.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'modelName is required for image uploads'
        });
      }
      const imageType = subfolder === 'Interior' ? 'interior' : 'main';
      cloudinaryFolder = cloudinaryService.getModelFolder(modelName, imageType);
    } else {
      return res.status(400).json({
        success: false,
        error: `Unknown folder type: ${folder}. Supported: events, customizer, categories, images`
      });
    }

    // List resources from Cloudinary
    const resources = await cloudinaryService.listResources(cloudinaryFolder);
    const files = resources.map(resource => ({
      filename: resource.original_filename + '.' + resource.format,
      url: resource.secure_url,
      public_id: resource.public_id,
      size: resource.bytes,
      format: resource.format,
      width: resource.width,
      height: resource.height
    }));
    
    res.json({ success: true, files });
  } catch (error) {
    console.error('❌ Cloudinary list files error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to list files from Cloudinary',
      details: isDev ? error.stack : undefined
    });
  }
});

// Delete a file (admin only) - Now deletes from Cloudinary
router.delete('/delete', authenticate, async (req, res) => {
  try {
    const { url, public_id } = req.body;
    
    if (!url && !public_id) {
      return res.status(400).json({ 
        success: false,
        error: 'Either url or public_id is required' 
      });
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Cloudinary is not configured'
      });
    }

    let publicIdToDelete = public_id;

    // If URL provided, extract public_id from it
    if (!publicIdToDelete && url) {
      // Check if it's a Cloudinary URL
      if (cloudinaryService.isCloudinaryUrl(url)) {
        publicIdToDelete = cloudinaryService.extractPublicId(url);
      } else {
        // Legacy: might be a local file path, try to delete from filesystem as fallback
        try {
          const fullPath = path.join(__dirname, '../public', url);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return res.json({
              success: true,
              message: 'Local file deleted successfully (legacy)'
            });
          }
        } catch (fsError) {
          // Ignore filesystem errors
        }
        
        return res.status(400).json({
          success: false,
          error: 'Invalid URL. Must be a Cloudinary URL or provide public_id'
        });
      }
    }

    if (!publicIdToDelete) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract public_id from URL'
      });
    }

    // Delete from Cloudinary
    const result = await cloudinaryService.deleteFile(publicIdToDelete);

    if (result.result === 'ok' || result.result === 'not found') {
      res.json({
        success: true,
        message: 'File deleted successfully from Cloudinary',
        public_id: publicIdToDelete
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete file from Cloudinary',
        result: result.result
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;

