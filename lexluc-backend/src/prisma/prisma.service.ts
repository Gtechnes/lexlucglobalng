import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  private users = [
    {
      id: '1',
      email: 'admin@lexluc.com',
      password: '$2b$10$3.seDZaHVm5uUTH0hJLGi.CIQAPDBzu8KEFgmPChZLieAh6a3T2TW',
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      phone: '+1 000 000 0000',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];

  private services: any[] = [
    {
      id: '1',
      name: 'Tourism & Hospitality',
      slug: 'tourism-hospitality',
      description: 'Premium tourism services and travel experiences tailored for your journey',
      content: '<h2>Discover Exquisite Destinations</h2><p>We specialize in curating unforgettable travel experiences with meticulous attention to detail, ensuring every journey exceeds expectations.</p><h3>Our Expertise</h3><p>From luxury accommodations to adventure expeditions, we handle all aspects of your travel needs.</p>',
      icon: '🏨',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920&auto=format&fit=crop',
      order: 0,
      isActive: true,
      status: 'PUBLISHED',
      features: [
        'Tour planning and packaging',
        'International and local travel arrangements',
        'Hotel reservations and hospitality services',
        'Corporate and group travel coordination',
        'Tourism consultancy and destination management',
      ],
      ctaText: 'Plan Your Trip',
      ctaLink: '/contact',
      metaTitle: 'Tourism & Hospitality Services',
      metaDescription: 'Premium tour packages and travel arrangements worldwide',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    {
      id: '2',
      name: 'Agriculture',
      slug: 'agriculture',
      description: 'Comprehensive agricultural solutions from farm to market',
      content: '<h2>Sustainable Agricultural Solutions</h2><p>We provide end-to-end agricultural services supporting farmers and agribusinesses with modern techniques and reliable supply chains.</p>',
      icon: '🌾',
      image: 'https://images.unsplash.com/photo-1500382616909-0f4480091044?q=80&w=1920&auto=format&fit=crop',
      order: 1,
      isActive: true,
      status: 'PUBLISHED',
      features: [
        'Agro-products supply and distribution',
        'Crop farming and animal husbandry',
        'Agricultural equipment sourcing',
        'Agro-processing and value-chain services',
        'Farm management and consultancy',
      ],
      ctaText: 'Get Agricultural Support',
      ctaLink: '/contact',
      metaTitle: 'Agriculture Services',
      metaDescription: 'Sustainable farming solutions and agro-business support',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    {
      id: '3',
      name: 'Mining & Solid Minerals',
      slug: 'mining-solid-minerals',
      description: 'Professional mining services and mineral resource management',
      content: '<h2>Mining Excellence</h2><p>Our mining division provides comprehensive exploration, extraction, and logistics services with strict adherence to environmental standards.</p>',
      icon: '⛏️',
      image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?q=80&w=1920&auto=format&fit=crop',
      order: 2,
      isActive: true,
      status: 'PUBLISHED',
      features: [
        'Exploration and supply of solid minerals',
        'Mining consultancy and support operations',
        'Mineral sourcing, trading, and logistics',
        'Environmental and regulatory compliance support',
      ],
      ctaText: 'Explore Mining Solutions',
      ctaLink: '/contact',
      metaTitle: 'Mining & Solid Minerals Services',
      metaDescription: 'Professional mining services and mineral resource management',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    {
      id: '4',
      name: 'Oil & Gas Services',
      slug: 'oil-gas-services',
      description: 'Complete upstream and downstream oil & gas solutions',
      content: '<h2>Energy Solutions</h2><p>We provide comprehensive oil and gas services across the entire value chain, ensuring safety and efficiency in all operations.</p>',
      icon: '🛢️',
      image: 'https://images.unsplash.com/photo-1578662906396-524330e71eb5?q=80&w=1920&auto=format&fit=crop',
      order: 3,
      isActive: true,
      status: 'PUBLISHED',
      features: [
        'Upstream and downstream logistics',
        'Supply of petroleum products (diesel, PMS, gas, etc.)',
        'Equipment procurement and servicing',
        'Oilfield support and consultancy',
        'Pipeline and facility maintenance partnerships',
      ],
      ctaText: 'Energy Solutions',
      ctaLink: '/contact',
      metaTitle: 'Oil & Gas Services',
      metaDescription: 'Complete upstream and downstream oil & gas solutions',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    {
      id: '5',
      name: 'Recreation & Events',
      slug: 'recreation-events',
      description: 'Unforgettable event planning and recreational experiences',
      content: '<h2>Create Memorable Moments</h2><p>Our recreation and events team transforms your vision into reality with creative planning and flawless execution.</p>',
      icon: '🎉',
      image: 'https://images.unsplash.com/photo-1544551763-46a0d368d5d8?q=80&w=1920&auto=format&fit=crop',
      order: 4,
      isActive: true,
      status: 'PUBLISHED',
      features: [
        'Event planning and management',
        'Recreational facility management',
        'Corporate retreats and leisure activities',
        'Entertainment service coordination',
      ],
      ctaText: 'Plan Your Event',
      ctaLink: '/contact',
      metaTitle: 'Recreation & Events Services',
      metaDescription: 'Event planning and recreational experiences',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    {
      id: '6',
      name: 'Transportation & Logistics',
      slug: 'transportation-logistics',
      description: 'Reliable transportation and logistics solutions across markets',
      content: '<h2>Efficient Mobility Solutions</h2><p>Comprehensive transportation services ensuring timely and secure delivery of goods and passengers.</p>',
      icon: '🚚',
      image: 'https://images.unsplash.com/photo-1586525567848-5ee3edb9a8c1?q=80&w=1920&auto=format&fit=crop',
      order: 5,
      isActive: true,
      status: 'PUBLISHED',
      features: [
        'Road transport services (passenger & cargo)',
        'Vehicle rentals (fleet management)',
        'Logistics and supply-chain management',
        'Freight handling and delivery services',
        'Airport pickup and travel transport solutions',
      ],
      ctaText: 'Logistics Solutions',
      ctaLink: '/contact',
      metaTitle: 'Transportation & Logistics Services',
      metaDescription: 'Reliable transportation and logistics solutions across markets',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];

  private tours = [
    {
      id: '1',
      serviceId: '1',
      title: 'Safari Adventure',
      slug: 'safari-adventure',
      description: 'Experience the wildlife of Africa',
      destination: 'Nigeria',
      duration: 5,
      price: '2500.00',
      maxParticipants: 20,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ];

  private bookings: any[] = [];
  private contacts: any[] = [];
  private blogPosts: any[] = [];
  private mediaData: any[] = [];

  async $connect() {
    return Promise.resolve();
  }

  async $disconnect() {
    return Promise.resolve();
  }

  $queryRaw(query: any, ...params: any[]): Promise<any[]> {
    const queryStr = String(query);
    
    if (queryStr.includes('SELECT') && queryStr.includes('"services"')) {
      if (queryStr.includes('"deletedAt" IS NULL')) {
        return Promise.resolve(this.services.filter(s => !s.deletedAt));
      }
      return Promise.resolve(this.services);
    }
    
    if (queryStr.includes('INSERT INTO') && queryStr.includes('"services"')) {
      const maxId = this.services.reduce((max, s) => Math.max(max, parseInt(s.id.replace(/-/g, ''), 16)), 0);
      const newService = {
        id: `srv-${Date.now()}`,
        ...params.reduce((acc, p, i) => {
          if (typeof p === 'string' || typeof p === 'number' || typeof p === 'boolean') {
            acc[this.getServiceField(i)] = p;
          }
          return acc;
        }, {} as any),
        features: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      this.services.push(newService);
      return Promise.resolve([newService]);
    }
    
    if (queryStr.includes('UPDATE') && queryStr.includes('"services"')) {
      const id = params.find(p => typeof p === 'string' && p.includes('-'));
      const service = this.services.find(s => s.id === id);
      if (service) {
        Object.assign(service, { updatedAt: new Date() });
        return Promise.resolve([service]);
      }
      return Promise.resolve([service]);
    }
    
    return Promise.resolve([]);
  }

  private getServiceField(index: number): string {
    const fields = ['name', 'slug', 'description', 'content', 'icon', 'image', 'order', 'isActive'];
    return fields[index] || `field${index}`;
  }

  service = {
    findMany: async ({ where }: any = {}) => {
      if (where?.deletedAt === null) {
        return this.services.filter(s => !s.deletedAt);
      }
      return this.services;
    },
    findUnique: async ({ where }: any) =>
      this.services.find((s) => s.id === where.id || s.slug === where.slug),
    create: async ({ data }: any) => {
      const newService = { ...data, id: Math.random().toString(36).slice(2), createdAt: new Date(), updatedAt: new Date() };
      this.services.push(newService);
      return newService;
    },
    update: async ({ where, data }: any) => {
      const index = this.services.findIndex((s) => s.id === where.id);
      if (index >= 0) {
        this.services[index] = { ...this.services[index], ...data, updatedAt: new Date() };
        return this.services[index];
      }
      return null;
    },
  };

  tour = {
    findMany: async ({ where, include }: any = {}) => {
      let results = this.tours;
      if (where?.deletedAt === null) {
        results = results.filter((t) => !t.deletedAt);
      }
      if (where?.isActive !== undefined) {
        results = results.filter((t) => t.isActive === where.isActive);
      }
      return results.map((t) => include?.service ? { ...t, service: this.services.find((s) => s.id === t.serviceId) } : t);
    },
    findUnique: async ({ where, include }: any) => {
      const tour = this.tours.find((t) => t.id === where.id || t.slug === where.slug);
      if (!tour) return null;
      return include?.service ? { ...tour, service: this.services.find((s) => s.id === tour.serviceId) } : tour;
    },
    create: async ({ data }: any) => {
      const newTour = { ...data, id: Math.random().toString(36).slice(2), createdAt: new Date(), updatedAt: new Date() };
      this.tours.push(newTour);
      return newTour;
    },
    update: async ({ where, data }: any) => {
      const index = this.tours.findIndex((t) => t.id === where.id);
      if (index >= 0) {
        this.tours[index] = { ...this.tours[index], ...data, updatedAt: new Date() };
        return this.tours[index];
      }
      return null;
    },
  };

  user = {
    findUnique: async ({ where, select }: any) => {
      const user = this.users.find((u) => u.email === where.email || u.id === where.id);
      if (!select) return user;
      const result: Record<string, any> = {};
      for (const key of Object.keys(select)) {
        if (select[key] && user) result[key] = (user as any)[key];
      }
      return result;
    },
    findMany: async ({ select }: any = {}) => {
      if (!select) return this.users;
      return this.users.map(u => {
        const result: Record<string, any> = {};
        for (const key of Object.keys(select)) {
          if (select[key]) result[key] = (u as any)[key];
        }
        return result;
      });
    },
    create: async ({ data }: any) => {
      const newUser = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
      this.users.push(newUser);
      return newUser;
    },
    update: async ({ where, data }: any) => {
      const index = this.users.findIndex((u) => u.id === where.id);
      if (index >= 0) {
        this.users[index] = { ...this.users[index], ...data, updatedAt: new Date() };
        return this.users[index];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const index = this.users.findIndex((u) => u.id === where.id);
      if (index >= 0) {
        return this.users.splice(index, 1)[0];
      }
      return null;
    },
  };

  booking = {
    findMany: async () => this.bookings,
    findUnique: async ({ where }: any) =>
      this.bookings.find((b) => b.id === where.id || b.referenceNo === where.referenceNo),
    create: async ({ data }: any) => {
      const newBooking = { ...data, id: Math.random().toString(36).slice(2), referenceNo: `BK-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
      this.bookings.push(newBooking);
      return newBooking;
    },
    update: async ({ where, data }: any) => {
      const index = this.bookings.findIndex((b) => b.id === where.id);
      if (index >= 0) {
        this.bookings[index] = { ...this.bookings[index], ...data };
        return this.bookings[index];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const index = this.bookings.findIndex((b) => b.id === where.id);
      if (index >= 0) {
        return this.bookings.splice(index, 1)[0];
      }
      return null;
    },
  };

  blogPost = {
    findMany: async () => this.blogPosts,
    findUnique: async ({ where }: any) =>
      this.blogPosts.find((b) => b.id === where.id || b.slug === where.slug),
    create: async ({ data }: any) => {
      const newPost = { ...data, id: Math.random().toString(36).slice(2), createdAt: new Date(), updatedAt: new Date() };
      this.blogPosts.push(newPost);
      return newPost;
    },
    update: async ({ where, data }: any) => {
      const index = this.blogPosts.findIndex((b) => b.id === where.id);
      if (index >= 0) {
        this.blogPosts[index] = { ...this.blogPosts[index], ...data };
        return this.blogPosts[index];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const index = this.blogPosts.findIndex((b) => b.id === where.id);
      if (index >= 0) {
        return this.blogPosts.splice(index, 1)[0];
      }
      return null;
    },
  };

  contactMessage = {
    findMany: async () => this.contacts,
    findUnique: async ({ where }: any) => this.contacts.find((c) => c.id === where.id),
    create: async ({ data }: any) => {
      const newContact = { ...data, id: Math.random().toString(36).slice(2), createdAt: new Date(), updatedAt: new Date() };
      this.contacts.push(newContact);
      return newContact;
    },
    update: async ({ where, data }: any) => {
      const index = this.contacts.findIndex((c) => c.id === where.id);
      if (index >= 0) {
        this.contacts[index] = { ...this.contacts[index], ...data };
        return this.contacts[index];
      }
      return null;
    },
    delete: async ({ where }: any) => {
      const index = this.contacts.findIndex((c) => c.id === where.id);
      if (index >= 0) {
        return this.contacts.splice(index, 1)[0];
      }
      return null;
    },
  };

  media = {
    findMany: async () => this.mediaData,
    create: async ({ data }: any) => {
      const newMedia = { ...data, id: Math.random().toString(36).slice(2), createdAt: new Date(), updatedAt: new Date() };
      this.mediaData.push(newMedia);
      return newMedia;
    },
  };

  blogCategory = {
    findMany: async () => [],
    findUnique: async ({ where }: any) => null,
    create: async ({ data }: any) => ({ ...data, id: Math.random().toString(36).slice(2) }),
    update: async ({ where, data }: any) => ({}),
    delete: async ({ where }: any) => null,
  };

  async onModuleInit() {
    console.log('✅ PrismaService initialized (MOCK MODE - Development Only)');
  }

  async onModuleDestroy() {
    console.log('🔴 PrismaService destroyed');
  }
}
