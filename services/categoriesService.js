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
      const category = await prisma.category.create({
        data: categoryData
      });

      return category;
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  // Update category
  async updateCategory(id, categoryData) {
    try {
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: categoryData
      });

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


