const categoriesService = require('../services/categoriesService');

class CategoriesController {
  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await categoriesService.getAllCategories();
      res.json({
        success: true,
        data: categories,
        count: categories.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get single category
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await categoriesService.getCategoryById(id);
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      if (error.message === 'Category not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Create category
  async createCategory(req, res) {
    try {
      const category = await categoriesService.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await categoriesService.updateCategory(id, req.body);
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await categoriesService.deleteCategory(id);
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new CategoriesController();


