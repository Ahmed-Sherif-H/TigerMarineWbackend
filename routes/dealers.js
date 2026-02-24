const express = require('express');
const router = express.Router();
const dealersController = require('../controllers/dealersController');
const { authenticate } = require('../middleware/auth');

// Get all dealers (requires authentication)
router.get('/', authenticate, (req, res) => dealersController.getAllDealers(req, res));

// Get single dealer by ID (requires authentication)
router.get('/:id', authenticate, (req, res) => dealersController.getDealerById(req, res));

// Create new dealer (admin only)
router.post('/', authenticate, (req, res) => dealersController.createDealer(req, res));

// Update dealer (admin only)
router.put('/:id', authenticate, (req, res) => dealersController.updateDealer(req, res));

// Delete dealer (admin only)
router.delete('/:id', authenticate, (req, res) => dealersController.deleteDealer(req, res));

module.exports = router;
