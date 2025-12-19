const modelsService = require('../services/modelsService');

class ModelsController {
  // Get all models
  async getAllModels(req, res) {
    try {
      const models = await modelsService.getAllModels();
      res.json({
        success: true,
        data: models,
        count: models.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get single model
  async getModelById(req, res) {
    try {
      const { id } = req.params;
      const model = await modelsService.getModelById(id);
      res.json({
        success: true,
        data: model
      });
    } catch (error) {
      if (error.message === 'Model not found') {
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

  // Create model
  async createModel(req, res) {
    try {
      const model = await modelsService.createModel(req.body);
      res.status(201).json({
        success: true,
        message: 'Model created successfully',
        data: model
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update model
  async updateModel(req, res) {
    try {
      const { id } = req.params;
      const model = await modelsService.updateModel(id, req.body);
      res.json({
        success: true,
        message: 'Model updated successfully',
        data: model
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete model
  async deleteModel(req, res) {
    try {
      const { id } = req.params;
      await modelsService.deleteModel(id);
      res.json({
        success: true,
        message: 'Model deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ModelsController();


