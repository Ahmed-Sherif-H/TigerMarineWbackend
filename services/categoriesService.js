const { prisma } = require('../config/database');

class CategoriesService {
  // Get all categories with models
  async getAllCategories() {
    try {
      const categories = await prisma.category.findMany({
        include: {
          models: {
            include: {
              specs: true,
              features: true,
              optionalFeatures: true
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


