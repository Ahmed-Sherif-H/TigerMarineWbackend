const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

// Get all categories
router.get('/', (req, res) => categoriesController.getAllCategories(req, res));

// Get single category by ID
router.get('/:id', (req, res) => categoriesController.getCategoryById(req, res));

// Create new category
router.post('/', (req, res) => categoriesController.createCategory(req, res));

// Update category
router.put('/:id', (req, res) => categoriesController.updateCategory(req, res));

// Delete category
router.delete('/:id', (req, res) => categoriesController.deleteCategory(req, res));

module.exports = router;

