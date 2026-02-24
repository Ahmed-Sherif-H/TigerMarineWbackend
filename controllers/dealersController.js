const dealersService = require('../services/dealersService');

class DealersController {
  // Get all dealers
  async getAllDealers(req, res) {
    try {
      const dealers = await dealersService.getAllDealers();
      res.json({
        success: true,
        data: dealers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get single dealer by ID
  async getDealerById(req, res) {
    try {
      const { id } = req.params;
      const dealer = await dealersService.getDealerById(id);
      res.json({
        success: true,
        data: dealer
      });
    } catch (error) {
      if (error.message === 'Dealer not found') {
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

  // Create new dealer
  async createDealer(req, res) {
    try {
      const dealer = await dealersService.createDealer(req.body);
      res.status(201).json({
        success: true,
        message: 'Dealer created successfully',
        data: dealer
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update dealer
  async updateDealer(req, res) {
    try {
      const { id } = req.params;
      const dealer = await dealersService.updateDealer(id, req.body);
      res.json({
        success: true,
        message: 'Dealer updated successfully',
        data: dealer
      });
    } catch (error) {
      if (error.message === 'Dealer not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete dealer
  async deleteDealer(req, res) {
    try {
      const { id } = req.params;
      await dealersService.deleteDealer(id);
      res.json({
        success: true,
        message: 'Dealer deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Dealer not found') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new DealersController();
