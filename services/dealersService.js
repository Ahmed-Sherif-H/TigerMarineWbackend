const { prisma } = require('../config/database');

class DealersService {
  // Get all dealers
  async getAllDealers() {
    try {
      const dealers = await prisma.dealer.findMany({
        orderBy: [
          { country: 'asc' },
          { company: 'asc' }
        ]
      });
      return dealers;
    } catch (error) {
      console.error('Error fetching dealers:', error);
      throw new Error('Failed to fetch dealers');
    }
  }

  // Get single dealer by ID
  async getDealerById(id) {
    try {
      const dealer = await prisma.dealer.findUnique({
        where: { id: parseInt(id) }
      });

      if (!dealer) {
        throw new Error('Dealer not found');
      }

      return dealer;
    } catch (error) {
      if (error.message === 'Dealer not found') {
        throw error;
      }
      console.error('Error fetching dealer:', error);
      throw new Error('Failed to fetch dealer');
    }
  }

  // Create new dealer
  async createDealer(data) {
    try {
      // Validation
      if (!data.company || !data.country) {
        throw new Error('Company and country are required');
      }

      // Validate email format if provided
      if (data.email && !this.isValidEmail(data.email)) {
        throw new Error('Invalid email format');
      }

      // Validate website URL format if provided
      if (data.website && !this.isValidUrl(data.website)) {
        throw new Error('Invalid website URL format');
      }

      const dealer = await prisma.dealer.create({
        data: {
          company: data.company.trim(),
          country: data.country.trim(),
          address: data.address?.trim() || null,
          telephone: data.telephone?.trim() || null,
          fax: data.fax?.trim() || null,
          email: data.email?.trim() || null,
          website: data.website?.trim() || null
        }
      });

      return dealer;
    } catch (error) {
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        throw error;
      }
      console.error('Error creating dealer:', error);
      throw new Error('Failed to create dealer');
    }
  }

  // Update dealer
  async updateDealer(id, data) {
    try {
      // Check if dealer exists
      const existingDealer = await prisma.dealer.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingDealer) {
        throw new Error('Dealer not found');
      }

      // Validation
      if (data.company !== undefined && !data.company) {
        throw new Error('Company cannot be empty');
      }

      if (data.country !== undefined && !data.country) {
        throw new Error('Country cannot be empty');
      }

      // Validate email format if provided
      if (data.email !== undefined && data.email && !this.isValidEmail(data.email)) {
        throw new Error('Invalid email format');
      }

      // Validate website URL format if provided
      if (data.website !== undefined && data.website && !this.isValidUrl(data.website)) {
        throw new Error('Invalid website URL format');
      }

      const dealer = await prisma.dealer.update({
        where: { id: parseInt(id) },
        data: {
          ...(data.company !== undefined && { company: data.company.trim() }),
          ...(data.country !== undefined && { country: data.country.trim() }),
          ...(data.address !== undefined && { address: data.address?.trim() || null }),
          ...(data.telephone !== undefined && { telephone: data.telephone?.trim() || null }),
          ...(data.fax !== undefined && { fax: data.fax?.trim() || null }),
          ...(data.email !== undefined && { email: data.email?.trim() || null }),
          ...(data.website !== undefined && { website: data.website?.trim() || null })
        }
      });

      return dealer;
    } catch (error) {
      if (error.message === 'Dealer not found' || 
          error.message.includes('cannot be empty') || 
          error.message.includes('Invalid')) {
        throw error;
      }
      console.error('Error updating dealer:', error);
      throw new Error('Failed to update dealer');
    }
  }

  // Delete dealer
  async deleteDealer(id) {
    try {
      const dealer = await prisma.dealer.findUnique({
        where: { id: parseInt(id) }
      });

      if (!dealer) {
        throw new Error('Dealer not found');
      }

      await prisma.dealer.delete({
        where: { id: parseInt(id) }
      });

      return true;
    } catch (error) {
      if (error.message === 'Dealer not found') {
        throw error;
      }
      console.error('Error deleting dealer:', error);
      throw new Error('Failed to delete dealer');
    }
  }

  // Helper: Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper: Validate URL format
  isValidUrl(url) {
    try {
      // Allow URLs with or without protocol
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(url);
    } catch {
      return false;
    }
  }
}

module.exports = new DealersService();
