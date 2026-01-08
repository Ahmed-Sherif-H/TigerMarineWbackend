const { prisma } = require('../config/database');

class EventsService {
  // Get all events
  async getAllEvents() {
    try {
      // Check if prisma.event exists (Prisma Client might not be regenerated)
      if (!prisma.event) {
        console.error('[EventsService] prisma.event is undefined. Prisma Client needs to be regenerated.');
        console.error('[EventsService] Available models:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
        return [];
      }
      
      const events = await prisma.event.findMany({
        orderBy: [
          { order: 'asc' },
          { startDate: 'asc' }
        ]
      });
      return events;
    } catch (error) {
      // If table doesn't exist, return empty array instead of throwing
      if (error.message.includes('does not exist') || error.message.includes('Unknown table') || error.message.includes('undefined')) {
        console.warn('[EventsService] Event model not available. Returning empty array.');
        console.warn('[EventsService] Error:', error.message);
        return [];
      }
      throw new Error(`Error fetching events: ${error.message}`);
    }
  }

  // Get event by ID
  async getEventById(id) {
    try {
      if (!prisma.event) {
        throw new Error('Event model not available. Please regenerate Prisma Client.');
      }
      const event = await prisma.event.findUnique({
        where: { id: parseInt(id) }
      });
      if (!event) {
        throw new Error('Event not found');
      }
      return event;
    } catch (error) {
      throw new Error(`Error fetching event: ${error.message}`);
    }
  }

  // Create event
  async createEvent(eventData) {
    try {
      if (!prisma.event) {
        throw new Error('Event model not available. Please regenerate Prisma Client.');
      }
      const {
        name,
        location,
        startDate,
        endDate,
        description,
        image,
        website,
        status = 'upcoming',
        order = 0
      } = eventData;

      const event = await prisma.event.create({
        data: {
          name,
          location,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          description,
          image,
          website,
          status,
          order: parseInt(order) || 0
        }
      });

      return event;
    } catch (error) {
      throw new Error(`Error creating event: ${error.message}`);
    }
  }

  // Update event
  async updateEvent(id, eventData) {
    try {
      if (!prisma.event) {
        throw new Error('Event model not available. Please regenerate Prisma Client.');
      }
      const {
        name,
        location,
        startDate,
        endDate,
        description,
        image,
        website,
        status,
        order
      } = eventData;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (location !== undefined) updateData.location = location;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image = image;
      if (website !== undefined) updateData.website = website;
      if (status !== undefined) updateData.status = status;
      if (order !== undefined) updateData.order = parseInt(order) || 0;

      const event = await prisma.event.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      return event;
    } catch (error) {
      throw new Error(`Error updating event: ${error.message}`);
    }
  }

  // Delete event
  async deleteEvent(id) {
    try {
      if (!prisma.event) {
        throw new Error('Event model not available. Please regenerate Prisma Client.');
      }
      await prisma.event.delete({
        where: { id: parseInt(id) }
      });
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting event: ${error.message}`);
    }
  }
}

module.exports = new EventsService();

