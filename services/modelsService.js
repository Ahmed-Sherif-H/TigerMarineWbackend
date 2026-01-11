const { prisma } = require('../config/database');

class ModelsService {
  // Map model names to folder names
  getModelFolderName(modelName) {
    const folderMap = {
      'ML38': 'MaxLine 38',
      'TL950': 'TopLine950',
      'TL850': 'TopLine850',
      'TL750': 'TopLine750',
      'TL650': 'TopLine650',
      'PL620': 'ProLine620',
      'PL550': 'ProLine550',
      'SL520': 'SportLine520',
      'SL480': 'SportLine480',
      'OP850': 'Open850',
      'OP750': 'Open750',
      'OP650': 'Open650',
      'Infinity 280': 'Infinity 280',
      'Striker 330': 'Striker 330'
    };
    
    // Return mapped name if exists, otherwise return original name
    return folderMap[modelName] || modelName;
  }
  // Get all models with their related data
  async getAllModels() {
    try {
      const models = await prisma.model.findMany({
        include: {
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          specs: {
            orderBy: { key: 'asc' }
          },
          features: {
            orderBy: { order: 'asc' }
          },
          optionalFeatures: {
            orderBy: { order: 'asc' }
          },
          galleryImages: {
            orderBy: { order: 'asc' }
          },
          videoFiles: {
            orderBy: { order: 'asc' }
          },
          interiorFiles: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Transform data to match frontend format
      return models.map(model => this.transformModel(model));
    } catch (error) {
      throw new Error(`Error fetching models: ${error.message}`);
    }
  }

  // Get single model by ID
  async getModelById(id) {
    try {
      const model = await prisma.model.findUnique({
        where: { id: parseInt(id) },
        include: {
          category: true,
          specs: { orderBy: { key: 'asc' } },
          features: { orderBy: { order: 'asc' } },
          optionalFeatures: { orderBy: { order: 'asc' } },
          galleryImages: { orderBy: { order: 'asc' } },
          videoFiles: { orderBy: { order: 'asc' } },
          interiorFiles: { orderBy: { order: 'asc' } }
        }
      });

      if (!model) {
        throw new Error('Model not found');
      }

      return this.transformModel(model);
    } catch (error) {
      throw new Error(`Error fetching model: ${error.message}`);
    }
  }

  // Create new model
  async createModel(modelData) {
    try {
      const {
        categoryId,
        name,
        description,
        shortDescription,
        imageFile,
        heroImageFile,
        contentImageFile,
        interiorMainImage,
        section2Title,
        section2Description,
        specs = {},
        standardFeatures = [],
        optionalFeatures = [],
        galleryFiles = [],
        videoFiles = [],
        interiorFiles = []
      } = modelData;

      // Create model with all related data
      const model = await prisma.model.create({
        data: {
          categoryId: parseInt(categoryId),
          name,
          description,
          shortDescription,
          imageFile: imageFile ? this.extractFilename(imageFile) : null,
          heroImageFile: heroImageFile ? this.extractFilename(heroImageFile) : null,
          contentImageFile: contentImageFile ? this.extractFilename(contentImageFile) : null,
          interiorMainImage: interiorMainImage ? this.extractFilename(interiorMainImage) : null,
          section2Title,
          section2Description,
          specs: {
            create: Object.entries(specs).map(([key, value]) => ({
              key,
              value: String(value)
            }))
          },
          features: {
            create: standardFeatures.map((feature, index) => ({
              feature: String(feature),
              order: index
            }))
          },
          optionalFeatures: {
            create: optionalFeatures.map((opt, index) => ({
              name: opt.name || String(opt),
              description: opt.description || '',
              category: opt.category || '',
              price: opt.price || '',
              order: index
            }))
          },
          galleryImages: {
            create: galleryFiles.map((filename, index) => ({
              filename: this.extractFilename(String(filename)),
              order: index
            })).filter(img => img.filename) // Filter out null/empty filenames
          },
          videoFiles: {
            create: videoFiles.map((filename, index) => ({
              filename: this.extractFilename(String(filename)),
              order: index
            })).filter(vid => vid.filename) // Filter out null/empty filenames
          },
          interiorFiles: {
            create: interiorFiles.map((filename, index) => ({
              filename: this.extractFilename(String(filename)),
              order: index
            })).filter(int => int.filename) // Filter out null/empty filenames
          }
        },
        include: {
          category: true,
          specs: true,
          features: true,
          optionalFeatures: true,
          galleryImages: true,
          videoFiles: true,
          interiorFiles: true
        }
      });

      return this.transformModel(model);
    } catch (error) {
      throw new Error(`Error creating model: ${error.message}`);
    }
  }

  // Update model
  async updateModel(id, modelData) {
    try {
      const {
        categoryId,
        name,
        description,
        shortDescription,
        imageFile,
        heroImageFile,
        contentImageFile,
        interiorMainImage,
        section2Title,
        section2Description,
        specs,
        standardFeatures,
        optionalFeatures,
        galleryFiles,
        videoFiles,
        interiorFiles
      } = modelData;

      // First, delete all related data
      await prisma.spec.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.feature.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.optionalFeature.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.galleryImage.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.videoFile.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.interiorFile.deleteMany({ where: { modelId: parseInt(id) } });

      // Log what we're receiving for debugging
      console.log(`[ModelsService] Updating model ID: ${id}`);
      console.log(`  Received imageFile: ${imageFile || 'undefined'}`);
      console.log(`  Received heroImageFile: ${heroImageFile || 'undefined'}`);
      console.log(`  Received contentImageFile: ${contentImageFile || 'undefined'}`);
      console.log(`  Received interiorMainImage: ${interiorMainImage || 'undefined'}`);
      console.log(`  Received galleryFiles count: ${galleryFiles?.length || 0}`);
      console.log(`  Received interiorFiles count: ${interiorFiles?.length || 0}`);
      console.log(`  Received videoFiles count: ${videoFiles?.length || 0}`);
      
      // Extract filenames before saving
      const cleanImageFile = imageFile !== undefined ? this.extractFilename(imageFile) : undefined;
      const cleanHeroImageFile = heroImageFile !== undefined ? this.extractFilename(heroImageFile) : undefined;
      const cleanContentImageFile = contentImageFile !== undefined ? this.extractFilename(contentImageFile) : undefined;
      // Extract filename, but handle null return from extractFilename
      let cleanInteriorMainImage = undefined;
      if (interiorMainImage !== undefined && interiorMainImage !== null) {
        const strValue = String(interiorMainImage).trim();
        if (strValue !== '') {
          const extracted = this.extractFilename(strValue);
          // extractFilename returns null for empty values, but we want undefined to skip the field
          // If extracted is a valid string, use it; otherwise undefined
          cleanInteriorMainImage = extracted && extracted.trim() !== '' ? extracted : undefined;
        }
      }
      
      console.log(`  Cleaned imageFile: ${cleanImageFile || 'undefined'}`);
      console.log(`  Cleaned heroImageFile: ${cleanHeroImageFile || 'undefined'}`);
      console.log(`  Cleaned contentImageFile: ${cleanContentImageFile || 'undefined'}`);
      console.log(`  Cleaned interiorMainImage: ${cleanInteriorMainImage || 'undefined'}`);
      console.log(`  Original interiorMainImage: ${interiorMainImage || 'undefined'}`);
      console.log(`  interiorMainImage type: ${typeof interiorMainImage}`);
      
      // Update model and recreate related data
      const model = await prisma.model.update({
        where: { id: parseInt(id) },
        data: {
          ...(categoryId && { categoryId: parseInt(categoryId) }),
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(shortDescription !== undefined && { shortDescription }),
          // Save only filenames (not paths)
          ...(cleanImageFile !== undefined && { imageFile: cleanImageFile }),
          ...(cleanHeroImageFile !== undefined && { heroImageFile: cleanHeroImageFile }),
          ...(cleanContentImageFile !== undefined && { contentImageFile: cleanContentImageFile }),
          ...(cleanInteriorMainImage !== undefined && { interiorMainImage: cleanInteriorMainImage }),
          ...(section2Title !== undefined && { section2Title }),
          ...(section2Description !== undefined && { section2Description }),
          ...(specs && {
            specs: {
              create: Object.entries(specs).map(([key, value]) => ({
                key,
                value: String(value)
              }))
            }
          }),
          ...(standardFeatures && {
            features: {
              create: standardFeatures.map((feature, index) => ({
                feature: String(feature),
                order: index
              }))
            }
          }),
          ...(optionalFeatures && {
            optionalFeatures: {
              create: optionalFeatures.map((opt, index) => ({
                name: opt.name || String(opt),
                description: opt.description || '',
                category: opt.category || '',
                price: opt.price || '',
                order: index
              }))
            }
          }),
          ...(galleryFiles && {
            galleryImages: {
              create: galleryFiles.map((filename, index) => ({
                filename: this.extractFilename(String(filename)),
                order: index
              })).filter(img => img.filename) // Filter out null/empty filenames
            }
          }),
          ...(videoFiles && {
            videoFiles: {
              create: videoFiles.map((filename, index) => ({
                filename: this.extractFilename(String(filename)),
                order: index
              })).filter(vid => vid.filename) // Filter out null/empty filenames
            }
          }),
          ...(interiorFiles && {
            interiorFiles: {
              create: interiorFiles.map((filename, index) => ({
                filename: this.extractFilename(String(filename)),
                order: index
              })).filter(int => int.filename) // Filter out null/empty filenames
            }
          })
        },
        include: {
          category: true,
          specs: true,
          features: true,
          optionalFeatures: true,
          galleryImages: true,
          videoFiles: true,
          interiorFiles: true
        }
      });

      const updatedModel = await prisma.model.findUnique({
        where: { id: parseInt(id) },
        include: {
          category: true,
          specs: { orderBy: { key: 'asc' } },
          features: { orderBy: { order: 'asc' } },
          optionalFeatures: { orderBy: { order: 'asc' } },
          galleryImages: { orderBy: { order: 'asc' } },
          videoFiles: { orderBy: { order: 'asc' } },
          interiorFiles: { orderBy: { order: 'asc' } }
        }
      });
      
      console.log(`[ModelsService] Model updated. Verifying saved data:`);
      console.log(`  Saved imageFile: ${updatedModel.imageFile || 'NULL/EMPTY'}`);
      console.log(`  Saved interiorMainImage: ${updatedModel.interiorMainImage || 'NULL/EMPTY'}`);
      console.log(`  Saved interiorMainImage type: ${typeof updatedModel.interiorMainImage}`);
      console.log(`  Saved galleryImages count: ${updatedModel.galleryImages?.length || 0}`);
      console.log(`  Saved interiorFiles count: ${updatedModel.interiorFiles?.length || 0}`);
      
      // Debug: Check if interiorMainImage was actually included in the update
      console.log(`[ModelsService] Debug - cleanInteriorMainImage was: ${cleanInteriorMainImage || 'undefined'}`);
      console.log(`[ModelsService] Debug - cleanInteriorMainImage !== undefined: ${cleanInteriorMainImage !== undefined}`);
      
      return this.transformModel(updatedModel);
    } catch (error) {
      console.error(`[ModelsService] Error updating model:`, error);
      throw new Error(`Error updating model: ${error.message}`);
    }
  }

  // Delete model
  async deleteModel(id) {
    try {
      // Related data will be deleted automatically due to onDelete: Cascade
      await prisma.model.delete({
        where: { id: parseInt(id) }
      });

      return { success: true, message: 'Model deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting model: ${error.message}`);
    }
  }

  // Helper function to check if a string is a YouTube URL or video ID
  isYouTubeUrl(urlOrId) {
    if (!urlOrId || typeof urlOrId !== 'string') return false;
    const trimmed = urlOrId.trim();
    
    // Check if it's a YouTube URL pattern
    const youtubePatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
    ];
    
    // Check if it matches YouTube URL patterns
    if (youtubePatterns.some(pattern => pattern.test(trimmed))) return true;
    
    // Check if it's just a video ID (11 characters, alphanumeric with dashes/underscores)
    // Also handle YouTube share links like "VIDEO_ID?si=..." or "VIDEO_ID&si=..."
    const videoIdMatch = trimmed.match(/^([a-zA-Z0-9_-]{11})([?&].*)?$/);
    if (videoIdMatch) return true;
    
    return false;
  }

  // Extract YouTube video ID from URL or ID string
  extractYouTubeVideoId(urlOrId) {
    if (!urlOrId || typeof urlOrId !== 'string') return null;
    const trimmed = urlOrId.trim();
    
    // Try to extract from YouTube URL patterns
    const urlPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of urlPatterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    // If it's just a video ID (with optional share parameters)
    const videoIdMatch = trimmed.match(/^([a-zA-Z0-9_-]{11})([?&].*)?$/);
    if (videoIdMatch) return videoIdMatch[1];
    
    return null;
  }

  // Convert YouTube video ID or URL to embed URL
  getYouTubeEmbedUrl(urlOrId) {
    const videoId = this.extractYouTubeVideoId(urlOrId);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Convert YouTube video ID or URL to watch URL
  getYouTubeWatchUrl(urlOrId) {
    const videoId = this.extractYouTubeVideoId(urlOrId);
    if (!videoId) return null;
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Helper function to extract just the filename from a path (extracts YouTube video ID)
  extractFilename(pathOrFilename) {
    if (!pathOrFilename || pathOrFilename.trim() === '') {
      return null;
    }
    const trimmed = pathOrFilename.trim();
    
    // If it's a YouTube URL or video ID, extract just the video ID for storage
    if (this.isYouTubeUrl(trimmed)) {
      const videoId = this.extractYouTubeVideoId(trimmed);
      return videoId || trimmed; // Return extracted video ID, or original if extraction fails
    }
    
    // If it's already just a filename, return it
    if (!trimmed.includes('/')) {
      return trimmed;
    }
    // If it's a path, extract just the filename
    return trimmed.split('/').pop().trim();
  }

  // Helper function to build full image path
  buildImagePath(modelName, filename) {
    if (!filename || filename.trim() === '') {
      return null;
    }
    // First, extract just the filename (in case a full path was passed)
    const cleanFilename = this.extractFilename(filename);
    if (!cleanFilename) return null;
    
    // Get the correct folder name (maps abbreviated names to full folder names)
    const folderName = this.getModelFolderName(modelName);
    // Construct path: /images/{folderName}/{filename}
    return `/images/${folderName}/${cleanFilename}`;
  }

  // Transform database model to frontend format
  transformModel(model) {
    const modelName = model.name;
    
    // Log what's in the database for debugging
    console.log(`[ModelsService] Transforming model: ${modelName}`);
    console.log(`  DB imageFile: ${model.imageFile || 'null'}`);
    console.log(`  DB heroImageFile: ${model.heroImageFile || 'null'}`);
    console.log(`  DB contentImageFile: ${model.contentImageFile || 'null'}`);
    console.log(`  DB interiorMainImage: ${model.interiorMainImage || 'null'}`);
    console.log(`  DB galleryImages count: ${model.galleryImages?.length || 0}`);
    console.log(`  DB interiorFiles count: ${model.interiorFiles?.length || 0}`);
    console.log(`  DB videoFiles count: ${model.videoFiles?.length || 0}`);
    
    const transformed = {
      id: model.id,
      name: model.name,
      categoryId: model.categoryId,
      categoryName: model.category?.name,
      description: model.description,
      shortDescription: model.shortDescription,
      // Build paths from filenames stored in DB
      imageFile: this.buildImagePath(modelName, model.imageFile),
      heroImageFile: this.buildImagePath(modelName, model.heroImageFile),
      contentImageFile: this.buildImagePath(modelName, model.contentImageFile),
      interiorMainImage: model.interiorMainImage ? model.interiorMainImage : null,
      section2Title: model.section2Title,
      section2Description: model.section2Description,
      specs: model.specs?.reduce((acc, spec) => {
        acc[spec.key] = spec.value;
        return acc;
      }, {}) || {},
      standardFeatures: model.features?.map(f => f.feature) || [],
      optionalFeatures: model.optionalFeatures?.map(opt => ({
        name: opt.name,
        description: opt.description,
        category: opt.category,
        price: opt.price
      })) || [],
      // Build paths from filenames stored in DB
      galleryFiles: model.galleryImages?.map(img => {
        const path = this.buildImagePath(modelName, img.filename);
        console.log(`  Gallery: ${img.filename} -> ${path}`);
        return path;
      }).filter(Boolean) || [],
      videoFiles: model.videoFiles?.map(vid => {
        // If it's a YouTube URL or video ID, convert to embed URL
        if (this.isYouTubeUrl(vid.filename)) {
          const embedUrl = this.getYouTubeEmbedUrl(vid.filename);
          console.log(`  Video (YouTube): ${vid.filename} -> ${embedUrl}`);
          return embedUrl || vid.filename; // Fallback to original if extraction fails
        }
        // Otherwise, build the image path for local videos
        const path = this.buildImagePath(modelName, vid.filename);
        console.log(`  Video: ${vid.filename} -> ${path}`);
        return path;
      }).filter(Boolean) || [],
      interiorFiles: model.interiorFiles?.map(int => {
        const path = this.buildImagePath(modelName, int.filename);
        console.log(`  Interior: ${int.filename} -> ${path}`);
        return path;
      }).filter(Boolean) || []
    };
    
    console.log(`[ModelsService] Transformed model ${modelName}:`);
    console.log(`  imageFile: ${transformed.imageFile}`);
    console.log(`  interiorMainImage: ${transformed.interiorMainImage || 'null'}`);
    console.log(`  galleryFiles count: ${transformed.galleryFiles.length}`);
    console.log(`  interiorFiles count: ${transformed.interiorFiles.length}`);
    
    return transformed;
  }
}

module.exports = new ModelsService();


