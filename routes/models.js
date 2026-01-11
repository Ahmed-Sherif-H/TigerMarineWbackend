const express = require('express');
const router = express.Router();
const modelsController = require('../controllers/modelsController');
const { authenticate } = require('../middleware/auth');

// Get all models (public)
router.get('/', (req, res) => modelsController.getAllModels(req, res));

// Get single model by ID (public)
router.get('/:id', (req, res) => modelsController.getModelById(req, res));

// Create new model (admin only)
router.post('/', authenticate, (req, res) => modelsController.createModel(req, res));

// Update model (admin only)
router.put('/:id', authenticate, (req, res) => modelsController.updateModel(req, res));

// Delete model (admin only)
router.delete('/:id', authenticate, (req, res) => modelsController.deleteModel(req, res));

module.exports = router;

