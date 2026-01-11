const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { authenticate } = require('../middleware/auth');

// GET all events (public)
router.get('/', (req, res) => eventsController.getAllEvents(req, res));

// GET event by ID (public)
router.get('/:id', (req, res) => eventsController.getEventById(req, res));

// POST create event (admin only)
router.post('/', authenticate, (req, res) => eventsController.createEvent(req, res));

// PUT update event (admin only)
router.put('/:id', authenticate, (req, res) => eventsController.updateEvent(req, res));

// DELETE event (admin only)
router.delete('/:id', authenticate, (req, res) => eventsController.deleteEvent(req, res));

module.exports = router;

