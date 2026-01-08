const eventsService = require('../services/eventsService');

class EventsController {
  async getAllEvents(req, res) {
    try {
      const events = await eventsService.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await eventsService.getEventById(id);
      res.json(event);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async createEvent(req, res) {
    try {
      const event = await eventsService.createEvent(req.body);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await eventsService.updateEvent(id, req.body);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      await eventsService.deleteEvent(id);
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new EventsController();

