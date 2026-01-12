const { prisma } = require('../config/database');

class CategoriesService {
  // Get all categories with models (optimized - only essential fields)
  async getAllCategories() {
    try {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          heroImage: true,
          mainGroup: true,
          order: true,
          models: {
            select: {
              id: true,
              name: true,
              description: true,
              shortDescription: true,
              imageFile: true,
              heroImageFile: true,
              contentImageFile: true,
              categoryId: true,
              specs: {
                select: {
                  key: true,
                  value: true
                },
                orderBy: { key: 'asc' }
              },
              features: {
                select: {
                  feature: true,
                  order: true
                },
                orderBy: { order: 'asc' }
              },
              optionalFeatures: {
                select: {
                  name: true,
                  description: true,
                  category: true,
                  price: true,
                  order: true
                },
                orderBy: { order: 'asc' }
              }
            },
            orderBy: {
              name: 'asc'
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      });

      return categories;
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }

  // Get single category with models
  async getCategoryById(id) {
    try {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
        include: {
          models: {
            include: {
              specs: true,
              features: true,
              optionalFeatures: true,
              galleryImages: true,
              videoFiles: true,
              interiorFiles: true
            }
          }
        }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    } catch (error) {
      throw new Error(`Error fetching category: ${error.message}`);
    }
  }

  // Create category
  async createCategory(categoryData) {
    try {
      const isDev = process.env.NODE_ENV !== 'production';
      
      // Log what we're receiving (for debugging)
      if (isDev) {
        console.log('📝 Creating category:', categoryData.name);
        if (categoryData.image !== undefined) {
          console.log('  Image:', categoryData.image);
          console.log('  Is Cloudinary URL:', categoryData.image?.startsWith('http://') || categoryData.image?.startsWith('https://'));
        }
        if (categoryData.heroImage !== undefined) {
          console.log('  HeroImage:', categoryData.heroImage);
          console.log('  Is Cloudinary URL:', categoryData.heroImage?.startsWith('http://') || categoryData.heroImage?.startsWith('https://'));
        }
      }

      // Ensure Cloudinary URLs are stored as-is (no processing)
      const createData = { ...categoryData };
      
      // If image/heroImage are Cloudinary URLs, store them directly
      if (createData.image && (createData.image.startsWith('http://') || createData.image.startsWith('https://'))) {
        // Store full Cloudinary URL as-is
        createData.image = createData.image;
      }
      
      if (createData.heroImage && (createData.heroImage.startsWith('http://') || createData.heroImage.startsWith('https://'))) {
        // Store full Cloudinary URL as-is
        createData.heroImage = createData.heroImage;
      }

      const category = await prisma.category.create({
        data: createData
      });

      if (isDev) {
        console.log('✅ Category created successfully');
        console.log('  Stored image:', category.image);
        console.log('  Stored heroImage:', category.heroImage);
      }

      return category;
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  // Update category
  async updateCategory(id, categoryData) {
    try {
      const isDev = process.env.NODE_ENV !== 'production';
      
      // Log what we're receiving (for debugging)
      if (isDev) {
        console.log('📝 Updating category:', id);
        if (categoryData.image !== undefined) {
          console.log('  Image:', categoryData.image);
          console.log('  Is Cloudinary URL:', categoryData.image?.startsWith('http://') || categoryData.image?.startsWith('https://'));
        }
        if (categoryData.heroImage !== undefined) {
          console.log('  HeroImage:', categoryData.heroImage);
          console.log('  Is Cloudinary URL:', categoryData.heroImage?.startsWith('http://') || categoryData.heroImage?.startsWith('https://'));
        }
      }

      // Ensure Cloudinary URLs are stored as-is (no processing)
      const updateData = { ...categoryData };
      
      // If image/heroImage are Cloudinary URLs, store them directly
      if (updateData.image && (updateData.image.startsWith('http://') || updateData.image.startsWith('https://'))) {
        // Store full Cloudinary URL as-is
        updateData.image = updateData.image;
      }
      
      if (updateData.heroImage && (updateData.heroImage.startsWith('http://') || updateData.heroImage.startsWith('https://'))) {
        // Store full Cloudinary URL as-is
        updateData.heroImage = updateData.heroImage;
      }

      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      if (isDev) {
        console.log('✅ Category updated successfully');
        console.log('  Stored image:', category.image);
        console.log('  Stored heroImage:', category.heroImage);
      }

      return category;
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }

  // Delete category
  async deleteCategory(id) {
    try {
      // Models will be deleted automatically due to cascade
      await prisma.category.delete({
        where: { id: parseInt(id) }
      });

      return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }
}

module.exports = new CategoriesService();


