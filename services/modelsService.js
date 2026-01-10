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
      'Infinity 280': 'Infinity 280'
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
          imageFile,
          heroImageFile,
          contentImageFile,
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
        section2Title,
        section2Description,
        specs,
        standardFeatures,
        optionalFeatures,
        galleryFiles,
        videoFiles,
        interiorFiles,
        interiorMainImage // Support for single interior image update
      } = modelData;

      // Log immediately after extraction to debug
      console.log(`[ModelsService] ===== UPDATE MODEL DEBUG =====`);
      console.log(`[ModelsService] Raw modelData keys:`, Object.keys(modelData));
      console.log(`[ModelsService] interiorMainImage in modelData:`, modelData.interiorMainImage);
      console.log(`[ModelsService] interiorMainImage extracted:`, interiorMainImage);
      console.log(`[ModelsService] interiorMainImage type:`, typeof interiorMainImage);
      console.log(`[ModelsService] ===============================`);

      // Get existing model to preserve data if not being updated
      const existingModel = await prisma.model.findUnique({
        where: { id: parseInt(id) },
        include: {
          interiorFiles: { orderBy: { order: 'asc' } }
        }
      });

      // First, delete all related data (will recreate if provided)
      await prisma.spec.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.feature.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.optionalFeature.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.galleryImage.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.videoFile.deleteMany({ where: { modelId: parseInt(id) } });
      
      // Handle interior files: preserve existing if not being updated
      let finalInteriorFiles = interiorFiles;
      let shouldUpdateInteriorFiles = false;
      
      // If interiorMainImage is provided (and not empty), it should be the first item
      const hasValidMainImage = interiorMainImage !== undefined && interiorMainImage !== null && interiorMainImage !== '';
      
      // If interiorFiles array is explicitly provided
      if (interiorFiles !== undefined) {
        console.log(`[ModelsService] interiorFiles is defined, checking interiorMainImage...`);
        console.log(`  interiorMainImage value: "${interiorMainImage}"`);
        console.log(`  interiorMainImage type: ${typeof interiorMainImage}`);
        console.log(`  hasValidMainImage: ${hasValidMainImage}`);
        
        if (hasValidMainImage) {
          // If both are provided, use interiorMainImage as first, then interiorFiles as gallery
          const mainImageFilename = this.extractFilename(interiorMainImage);
          console.log(`[ModelsService] Extracted main image filename: "${mainImageFilename}"`);
          
          if (mainImageFilename) {
            // Extract filenames from interiorFiles (they might be paths or filenames)
            const galleryFilenames = interiorFiles.map(f => this.extractFilename(String(f))).filter(Boolean);
            console.log(`[ModelsService] Gallery filenames extracted: [${galleryFilenames.join(', ')}]`);
            
            finalInteriorFiles = [
              mainImageFilename, // Main image first
              ...galleryFilenames // Gallery rest
            ];
            console.log(`[ModelsService] ✅ Both interiorMainImage and interiorFiles provided`);
            console.log(`  Main image: ${mainImageFilename}`);
            console.log(`  Gallery count: ${galleryFilenames.length} images`);
            console.log(`  Final array: [${finalInteriorFiles.join(', ')}]`);
          } else {
            // Couldn't extract filename, just use interiorFiles
            finalInteriorFiles = interiorFiles.map(f => this.extractFilename(String(f))).filter(Boolean);
            console.warn(`[ModelsService] ⚠️ interiorFiles provided, but interiorMainImage filename extraction failed`);
            console.warn(`  Using only interiorFiles: [${finalInteriorFiles.join(', ')}]`);
          }
        } else {
          // Only interiorFiles provided (no valid main image)
          finalInteriorFiles = interiorFiles.map(f => this.extractFilename(String(f))).filter(Boolean);
          console.log(`[ModelsService] Only interiorFiles provided: ${interiorFiles.length} items`);
          console.log(`  Extracted filenames: [${finalInteriorFiles.join(', ')}]`);
        }
        shouldUpdateInteriorFiles = true;
      }
      // If only interiorMainImage is provided (and not empty) but interiorFiles is not, update just the first one
      else if (hasValidMainImage) {
        const mainImageFilename = this.extractFilename(interiorMainImage);
        console.log(`[ModelsService] Processing interiorMainImage: "${interiorMainImage}" -> filename: "${mainImageFilename}"`);
        
        if (mainImageFilename && existingModel) {
          // Keep existing interior files, but replace the first one
          const existingInterior = existingModel.interiorFiles || [];
          if (existingInterior.length > 0) {
            // Replace first, keep rest
            finalInteriorFiles = [
              mainImageFilename, // New main image as first
              ...existingInterior.slice(1).map(f => f.filename) // Keep rest
            ];
            console.log(`[ModelsService] Updating only interiorMainImage: ${mainImageFilename}`);
            console.log(`  Preserving ${existingInterior.length - 1} existing interior files`);
            console.log(`  Final array: [${finalInteriorFiles.join(', ')}]`);
          } else {
            // No existing files, create new array with just the main image
            finalInteriorFiles = [mainImageFilename];
            console.log(`[ModelsService] Creating new interiorMainImage (no existing files): ${mainImageFilename}`);
          }
          shouldUpdateInteriorFiles = true;
        } else if (mainImageFilename) {
          // No existing model or files, create new array with just the main image
          finalInteriorFiles = [mainImageFilename];
          shouldUpdateInteriorFiles = true;
          console.log(`[ModelsService] Creating new interiorMainImage (no existing model): ${mainImageFilename}`);
        } else {
          console.warn(`[ModelsService] Could not extract filename from interiorMainImage: "${interiorMainImage}"`);
        }
      }
      // If interiorMainImage is empty string, it means clear it (set first to empty, but keep gallery)
      else if (interiorMainImage === '') {
        console.log(`[ModelsService] interiorMainImage is empty string - clearing main image but keeping gallery`);
        if (existingModel) {
          const existingInterior = existingModel.interiorFiles || [];
          if (existingInterior.length > 1) {
            // Remove first, keep rest
            finalInteriorFiles = existingInterior.slice(1).map(f => f.filename);
            shouldUpdateInteriorFiles = true;
            console.log(`  Keeping ${finalInteriorFiles.length} gallery images`);
          } else if (existingInterior.length === 1) {
            // Only one image, remove it
            finalInteriorFiles = [];
            shouldUpdateInteriorFiles = true;
            console.log(`  Removing only interior image`);
          }
        }
      }
      // If neither is provided, preserve existing files (don't update)
      else {
        console.log(`[ModelsService] No interior files update - preserving existing ${existingModel?.interiorFiles?.length || 0} files`);
      }
      
      // Only delete and recreate interior files if we're updating them
      if (shouldUpdateInteriorFiles && finalInteriorFiles !== undefined) {
        await prisma.interiorFile.deleteMany({ where: { modelId: parseInt(id) } });
      }

      // Log what we're receiving for debugging
      console.log(`[ModelsService] Updating model ID: ${id}`);
      console.log(`  Received imageFile: ${imageFile || 'undefined'}`);
      console.log(`  Received heroImageFile: ${heroImageFile || 'undefined'}`);
      console.log(`  Received contentImageFile: ${contentImageFile || 'undefined'}`);
      console.log(`  Received galleryFiles count: ${galleryFiles?.length || 0}`);
      console.log(`  Received interiorFiles count: ${interiorFiles?.length || 0}`);
      console.log(`  Received interiorMainImage: "${interiorMainImage || 'undefined'}"`);
      console.log(`  interiorMainImage type: ${typeof interiorMainImage}, empty: ${interiorMainImage === ''}`);
      console.log(`  Final interiorFiles count: ${finalInteriorFiles?.length || 0}`);
      console.log(`  Should update interior files: ${shouldUpdateInteriorFiles}`);
      console.log(`  Received videoFiles count: ${videoFiles?.length || 0}`);
      
      // Extract filenames before saving
      const cleanImageFile = imageFile !== undefined ? this.extractFilename(imageFile) : undefined;
      const cleanHeroImageFile = heroImageFile !== undefined ? this.extractFilename(heroImageFile) : undefined;
      const cleanContentImageFile = contentImageFile !== undefined ? this.extractFilename(contentImageFile) : undefined;
      
      console.log(`  Cleaned imageFile: ${cleanImageFile || 'undefined'}`);
      console.log(`  Cleaned heroImageFile: ${cleanHeroImageFile || 'undefined'}`);
      console.log(`  Cleaned contentImageFile: ${cleanContentImageFile || 'undefined'}`);
      
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
          ...(shouldUpdateInteriorFiles && finalInteriorFiles !== undefined && finalInteriorFiles.length > 0 && {
            interiorFiles: {
              create: finalInteriorFiles.map((filename, index) => ({
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
      console.log(`  Saved imageFile: ${updatedModel.imageFile || 'null'}`);
      console.log(`  Saved galleryImages count: ${updatedModel.galleryImages?.length || 0}`);
      console.log(`  Saved interiorFiles count: ${updatedModel.interiorFiles?.length || 0}`);
      
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

  // Helper function to extract just the filename from a path
  extractFilename(pathOrFilename) {
    if (!pathOrFilename || pathOrFilename.trim() === '') {
      return null;
    }
    // If it's already just a filename, return it
    if (!pathOrFilename.includes('/')) {
      return pathOrFilename.trim();
    }
    // If it's a path, extract just the filename
    return pathOrFilename.split('/').pop().trim();
  }

  // Helper function to build full image path
  buildImagePath(modelName, filename, isInterior = false) {
    if (!filename || filename.trim() === '') {
      return null;
    }
    // First, extract just the filename (in case a full path was passed)
    const cleanFilename = this.extractFilename(filename);
    if (!cleanFilename) return null;
    
    // Get the correct folder name (maps abbreviated names to full folder names)
    const folderName = this.getModelFolderName(modelName);
    
    // If it's an interior image, include the Interior subfolder
    if (isInterior) {
      return `/images/${folderName}/Interior/${cleanFilename}`;
    }
    
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
        const path = this.buildImagePath(modelName, vid.filename);
        console.log(`  Video: ${vid.filename} -> ${path}`);
        return path;
      }).filter(Boolean) || [],
      interiorFiles: model.interiorFiles?.map(int => {
        const path = this.buildImagePath(modelName, int.filename, true); // true = isInterior
        console.log(`  Interior: ${int.filename} -> ${path}`);
        return path;
      }).filter(Boolean) || []
    };
    
    // Add main interior image (first one) and interior gallery (rest)
    // Main interior image for single display
    transformed.interiorMainImage = transformed.interiorFiles.length > 0 
      ? transformed.interiorFiles[0] 
      : null;
    
    // Interior gallery carousel (all except first, or all if only one)
    transformed.interiorGallery = transformed.interiorFiles.length > 1
      ? transformed.interiorFiles.slice(1)
      : transformed.interiorFiles;
    
    console.log(`[ModelsService] Transformed model ${modelName}:`);
    console.log(`  imageFile: ${transformed.imageFile}`);
    console.log(`  galleryFiles count: ${transformed.galleryFiles.length}`);
    console.log(`  interiorFiles count: ${transformed.interiorFiles.length}`);
    console.log(`  interiorMainImage: ${transformed.interiorMainImage || 'null'}`);
    console.log(`  interiorGallery count: ${transformed.interiorGallery.length}`);
    
    return transformed;
  }
}

module.exports = new ModelsService();


