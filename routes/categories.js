const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { authenticate } = require('../middleware/auth');

// Get all categories (public)
router.get('/', (req, res) => categoriesController.getAllCategories(req, res));

// Get single category by ID (public)
router.get('/:id', (req, res) => categoriesController.getCategoryById(req, res));

// Create new category (admin only)
router.post('/', authenticate, (req, res) => categoriesController.createCategory(req, res));

// Update category (admin only)
router.put('/:id', authenticate, (req, res) => categoriesController.updateCategory(req, res));

// Delete category (admin only)
router.delete('/:id', authenticate, (req, res) => categoriesController.deleteCategory(req, res));

module.exports = router;

