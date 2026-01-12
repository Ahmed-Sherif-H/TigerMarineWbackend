const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
  /**
   * Upload a file buffer to Cloudinary
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} folder - Cloudinary folder path (e.g., "models/MaxLine 38", "categories/TopLine")
   * @param {string} filename - Original filename
   * @param {Object} options - Additional Cloudinary options
   * @returns {Promise<Object>} Cloudinary upload result
   */
  async uploadFile(fileBuffer, folder, filename, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: folder,
        public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension for public_id
        resource_type: 'auto', // Auto-detect image/video
        overwrite: true, // Allow overwriting existing files
        ...options
      };

      // Convert buffer to stream
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Create readable stream from buffer
      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      
      readableStream.pipe(stream);
    });
  }

  /**
   * Upload a file from a file path (for migration/backward compatibility)
   * @param {string} filePath - Local file path
   * @param {string} folder - Cloudinary folder path
   * @param {Object} options - Additional Cloudinary options
   * @returns {Promise<Object>} Cloudinary upload result
   */
  async uploadFromPath(filePath, folder, options = {}) {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      overwrite: true,
      ...options
    };

    return cloudinary.uploader.upload(filePath, uploadOptions);
  }

  /**
   * Delete a file from Cloudinary
   * @param {string} publicId - Cloudinary public_id (can include folder path)
   * @param {string} resourceType - 'image' or 'video' (default: 'auto')
   * @returns {Promise<Object>} Deletion result
   */
  async deleteFile(publicId, resourceType = 'auto') {
    return cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
  }

  /**
   * Delete multiple files from Cloudinary
   * @param {string[]} publicIds - Array of public_ids
   * @param {string} resourceType - 'image' or 'video' (default: 'auto')
   * @returns {Promise<Object>} Deletion result
   */
  async deleteFiles(publicIds, resourceType = 'auto') {
    return cloudinary.uploader.destroy(publicIds.join(','), {
      resource_type: resourceType
    });
  }

  /**
   * Extract public_id from Cloudinary URL
   * @param {string} url - Full Cloudinary URL
   * @returns {string|null} Public ID or null if not a Cloudinary URL
   */
  extractPublicId(url) {
    if (!url || typeof url !== 'string') return null;
    
    // Check if it's a Cloudinary URL
    if (!url.includes('cloudinary.com')) return null;
    
    try {
      // Extract public_id from URL
      // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      if (match && match[1]) {
        return match[1];
      }
      
      // Alternative: extract from public_id in path
      const pathMatch = url.match(/\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      if (pathMatch && pathMatch[1]) {
        return pathMatch[1];
      }
    } catch (error) {
      console.error('Error extracting public_id from URL:', error);
    }
    
    return null;
  }

  /**
   * Build Cloudinary URL from public_id
   * @param {string} publicId - Cloudinary public_id
   * @param {Object} options - Transformation options
   * @returns {string} Cloudinary URL
   */
  getUrl(publicId, options = {}) {
    if (!publicId) return null;
    
    return cloudinary.url(publicId, {
      secure: true, // Use HTTPS
      ...options
    });
  }

  /**
   * Check if a string is a Cloudinary URL
   * @param {string} url - URL to check
   * @returns {boolean}
   */
  isCloudinaryUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  }

  /**
   * Build folder path for model images
   * @param {string} modelName - Model name (e.g., "ML38", "TL650")
   * @param {string} type - Image type: 'main', 'hero', 'content', 'gallery', 'interior'
   * @returns {string} Cloudinary folder path
   */
  getModelFolder(modelName, type = 'main') {
    const folderMap = {
      'ML38': 'MaxLine 38',
      'ML42': 'MaxLine 42',
      'TL650': 'TopLine 650',
      'TL750': 'TopLine 750',
      'TL850': 'TopLine 850',
      'TL950': 'TopLine 950',
      'PL550': 'ProLine 550',
      'PL620': 'ProLine 620',
      'SL480': 'SportLine 480',
      'SL520': 'SportLine 520',
      'OP650': 'Open 650',
      'OP750': 'Open 750',
      'OP850': 'Open 850',
      'Infinity 280': 'Infinity 280'
    };

    const folderName = folderMap[modelName] || modelName;
    
    if (type === 'interior') {
      return `models/${folderName}/Interior`;
    }
    
    return `models/${folderName}`;
  }

  /**
   * Build folder path for category images
   * @param {string} categoryName - Category name
   * @returns {string} Cloudinary folder path
   */
  getCategoryFolder(categoryName) {
    const categoryTypeMap = {
      'topline': 'TopLine',
      'topline 650': 'TopLine',
      'maxline': 'MaxLine',
      'proline': 'ProLine',
      'open': 'Open',
      'sportline': 'SportLine',
      'infinity': 'Infinity'
    };

    const normalizedName = categoryName.toLowerCase().trim();
    const categoryType = categoryTypeMap[normalizedName] || 
                        categoryTypeMap[normalizedName.split(' ')[0]] || 
                        categoryName;
    
    return `categories/${categoryType}`;
  }

  /**
   * Build folder path for customizer images
   * @param {string} modelName - Model name
   * @param {string} partName - Part name
   * @returns {string} Cloudinary folder path
   */
  getCustomizerFolder(modelName, partName) {
    return `customizer/${modelName}/${partName}`;
  }
}

module.exports = new CloudinaryService();
