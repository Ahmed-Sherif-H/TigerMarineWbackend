const express = require('express');
const router = express.Router();
const modelsController = require('../controllers/modelsController');

// Get all models
router.get('/', (req, res) => modelsController.getAllModels(req, res));

// Get single model by ID
router.get('/:id', (req, res) => modelsController.getModelById(req, res));

// Create new model
router.post('/', (req, res) => modelsController.createModel(req, res));

// Update model
router.put('/:id', (req, res) => modelsController.updateModel(req, res));

// Delete model
router.delete('/:id', (req, res) => modelsController.deleteModel(req, res));

module.exports = router;

