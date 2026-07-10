import { Injectable, Logger } from '@nestjs/common';

/**
 * Mock Prisma Service - In-memory database for development/testing
 * This allows the backend to run without PostgreSQL
 */
@Injectable()
export class MockPrismaService {
  private logger = new Logger('MockPrismaService');

  // In-memory data storage
  private usersDB = [
    {
      id: '1',
      email: 'admin@lexluc.com',
      password: '$2b$10$3.seDZaHVm5uUTH0hJLGi.CIQAPDBzu8KEFgmPChZLieAh6a3T2TW', // bcrypt hash for '123456'
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      phone: '+234 800 000 0000',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];

  private servicesDB = [
    {
      id: '1',
      title: 'Tourism Services',
      slug: 'tourism-services',
      description: 'Comprehensive tourism packages',
      content: 'Full tourism solutions',
      published: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];

  private toursDB = [
    {
      id: '1',
      serviceId: '1',
      title: 'Safari Adventure',
      slug: 'safari-adventure',
      description: 'Experience the wildlife',
      content: 'Unforgettable safari experience',
      imageUrl: 'https://via.placeholder.com/400x300',
      duration: 5,
      price: '2500.00',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-03-06'),
      maxParticipants: 20,
      currentBookings: 5,
      highlights: ['Big Five', 'Game Drive'],
      inclusions: ['Accommodation', 'Meals'],
      exclusions: ['Flights'],
      itinerary: 'Day 1: Arrival',
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];

  private bookingsDB: any[] = [];
  private contactsDB: any[] = [];
  private blogDB: any[] = [];
  private mediaDB: any[] = [];

  constructor() {
    this.logger.log('✅ MockPrismaService initialized (in-memory database)');
    this.logger.log('   1 admin user, 1 service, 1 tour ready');
  }

  // User operations
  user = {
    findUnique: async ({ where }: any) => {
      return this.usersDB.find((u) => u.email === where.email || u.id === where.id);
    },
    findMany: async () => this.usersDB,
    create: async ({ data }: any) => {
      const newUser = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      this.usersDB.push(newUser);
      return newUser;
    },
    update: async ({ where, data }: any) => {
      const idx = this.usersDB.findIndex((u) => u.id === where.id);
      if (idx >= 0) {
        this.usersDB[idx] = { ...this.usersDB[idx], ...data, updatedAt: new Date() };
        return this.usersDB[idx];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const idx = this.usersDB.findIndex((u) => u.id === where.id);
      if (idx >= 0) return this.usersDB.splice(idx, 1)[0];
      return null;
    },
  };

  // Service operations
  service = {
    findMany: async () => this.servicesDB.filter((s) => !s.deletedAt),
    findUnique: async ({ where }: any) =>
      this.servicesDB.find((s) => (s.id === where.id || s.slug === where.slug) && !s.deletedAt),
    create: async ({ data }: any) => {
      const newService = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      this.servicesDB.push(newService);
      return newService;
    },
    update: async ({ where, data }: any) => {
      const idx = this.servicesDB.findIndex((s) => s.id === where.id);
      if (idx >= 0) {
        this.servicesDB[idx] = { ...this.servicesDB[idx], ...data, updatedAt: new Date() };
        return this.servicesDB[idx];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const idx = this.servicesDB.findIndex((s) => s.id === where.id);
      if (idx >= 0) {
        (this.servicesDB[idx] as any).deletedAt = new Date(); // Soft delete
        return this.servicesDB[idx];
      }
      return null;
    },
  };

  // Tour operations
  tour = {
    findMany: async () => this.toursDB.filter((t) => !t.deletedAt),
    findUnique: async ({ where }: any) =>
      this.toursDB.find((t) => (t.id === where.id || t.slug === where.slug) && !t.deletedAt),
    create: async ({ data }: any) => {
      const newTour = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      this.toursDB.push(newTour);
      return newTour;
    },
    update: async ({ where, data }: any) => {
      const idx = this.toursDB.findIndex((t) => t.id === where.id);
      if (idx >= 0) {
        this.toursDB[idx] = { ...this.toursDB[idx], ...data, updatedAt: new Date() };
        return this.toursDB[idx];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const idx = this.toursDB.findIndex((t) => t.id === where.id);
      if (idx >= 0) {
        (this.toursDB[idx] as any).deletedAt = new Date();
        return this.toursDB[idx];
      }
      return null;
    },
  };

  // Booking operations
  booking = {
    findMany: async () => this.bookingsDB,
    findUnique: async ({ where }: any) =>
      this.bookingsDB.find((b) => b.id === where.id || b.referenceNo === where.referenceNo),
    create: async ({ data }: any) => {
      const newBooking = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
      this.bookingsDB.push(newBooking);
      return newBooking;
    },
  };

  // Blog operations
  blogPost = {
    findMany: async () => this.blogDB.filter((b) => !b.deletedAt),
    findUnique: async ({ where }: any) =>
      this.blogDB.find((b) => (b.id === where.id || b.slug === where.slug) && !b.deletedAt),
    create: async ({ data }: any) => {
      const newPost = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
      this.blogDB.push(newPost);
      return newPost;
    },
  };

  // Contact operations
  contactMessage = {
    findMany: async () => this.contactsDB,
    findUnique: async ({ where }: any) => this.contactsDB.find((c) => c.id === where.id),
    create: async ({ data }: any) => {
      const newContact = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
      this.contactsDB.push(newContact);
      return newContact;
    },
  };

  // Media operations
  media = {
    findMany: async () => this.mediaDB,
    create: async ({ data }: any) => {
      const newMedia = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
      this.mediaDB.push(newMedia);
      return newMedia;
    },
  };
}
