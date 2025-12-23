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
        interiorFiles
      } = modelData;

      // First, delete all related data
      await prisma.spec.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.feature.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.optionalFeature.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.galleryImage.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.videoFile.deleteMany({ where: { modelId: parseInt(id) } });
      await prisma.interiorFile.deleteMany({ where: { modelId: parseInt(id) } });

      // Update model and recreate related data
      const model = await prisma.model.update({
        where: { id: parseInt(id) },
        data: {
          ...(categoryId && { categoryId: parseInt(categoryId) }),
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(shortDescription !== undefined && { shortDescription }),
          // Extract just filenames (strip any path prefixes) before saving
          ...(imageFile !== undefined && { imageFile: this.extractFilename(imageFile) }),
          ...(heroImageFile !== undefined && { heroImageFile: this.extractFilename(heroImageFile) }),
          ...(contentImageFile !== undefined && { contentImageFile: this.extractFilename(contentImageFile) }),
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

      return this.transformModel(model);
    } catch (error) {
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
    
    return {
      id: model.id,
      name: model.name,
      categoryId: model.categoryId,
      categoryName: model.category?.name,
      description: model.description,
      shortDescription: model.shortDescription,
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
      galleryFiles: model.galleryImages?.map(img => this.buildImagePath(modelName, img.filename)).filter(Boolean) || [],
      videoFiles: model.videoFiles?.map(vid => this.buildImagePath(modelName, vid.filename)).filter(Boolean) || [],
      interiorFiles: model.interiorFiles?.map(int => this.buildImagePath(modelName, int.filename)).filter(Boolean) || []
    };
  }
}

module.exports = new ModelsService();


