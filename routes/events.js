const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

// GET all events
router.get('/', (req, res) => eventsController.getAllEvents(req, res));

// GET event by ID
router.get('/:id', (req, res) => eventsController.getEventById(req, res));

// POST create event
router.post('/', (req, res) => eventsController.createEvent(req, res));

// PUT update event
router.put('/:id', (req, res) => eventsController.updateEvent(req, res));

// DELETE event
router.delete('/:id', (req, res) => eventsController.deleteEvent(req, res));

module.exports = router;

