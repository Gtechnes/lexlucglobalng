import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTourDto, TourStatus } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

interface ToursQuery {
  page?: string;
  limit?: string;
  status?: TourStatus;
  destination?: string;
  featured?: boolean;
  search?: string;
}

@Injectable()
export class ToursService {
  private readonly logger = new Logger(ToursService.name);

  constructor(private prisma: PrismaService) {}

  async create(createTourDto: CreateTourDto) {
    const slug = this.normalizeSlug(createTourDto.slug || createTourDto.title);
    this.logger.log(`Creating tour: ${createTourDto.title}`);

    this.validateTourDates(createTourDto.startDate, createTourDto.endDate);

    const existing = await this.prisma.tour.findFirst({ where: { slug, deletedAt: null } });
    if (existing) {
      throw new ConflictException(`Tour slug "${slug}" already exists`);
    }

    const created = await this.prisma.tour.create({
      data: {
        ...createTourDto,
        slug,
        status: createTourDto.status || TourStatus.DRAFT,
        itinerary: this.prepareJson(createTourDto.itinerary),
      },
      include: this.includeTour(),
    });

    this.logger.log(`Created tour ${created.id} with slug ${slug}`);
    return this.normalizeTour(created);
  }

  async findAll(query: ToursQuery = {}) {
    this.logger.log('Fetching public tours', JSON.stringify(query));
    const { page, limit, status, destination, featured, search } = query;
    const parsedPage = this.parsePositiveInt(page, 1);
    const parsedLimit = Math.min(this.parsePositiveInt(limit, 12), 100);
    const where: any = this.publicWhere();

    if (status && status !== TourStatus.PUBLISHED) {
      throw new BadRequestException('Public tour endpoints only support published tours');
    }
    if (status) this.applyStatusFilter(where, status);
    if (destination) where.destination = { contains: destination, mode: 'insensitive' };
    if (featured !== undefined) where.featured = featured;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { destination: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
    ];

    const [data, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        include: this.includeTour(),
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
      }),
      this.prisma.tour.count({ where }),
    ]);

    return {
      data: data.map((tour) => this.normalizeTour(tour)),
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async findAdmin(query: ToursQuery = {}) {
    this.logger.log('Fetching admin tours', JSON.stringify(query));
    const { page, limit, status, destination, featured, search } = query;
    const parsedPage = this.parsePositiveInt(page, 1);
    const parsedLimit = Math.min(this.parsePositiveInt(limit, 100), 100);
    const where: any = { deletedAt: null };

    if (status) where.status = status;
    if (destination) where.destination = { contains: destination, mode: 'insensitive' };
    if (featured !== undefined) where.featured = featured;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { destination: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
    ];

    const [data, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        include: this.includeTour(),
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
      }),
      this.prisma.tour.count({ where }),
    ]);

    return {
      data: data.map((tour) => this.normalizeTour(tour)),
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async findPublic(limit?: number) {
    const tours = await this.prisma.tour.findMany({
      where: this.publicWhere(),
      include: this.includeTour(),
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return tours.map((tour) => this.normalizeTour(tour));
  }

  async findFeatured(limit?: number) {
    this.logger.log(`Fetching featured tours with limit ${limit || 'all'}`);
    const tours = await this.prisma.tour.findMany({
      where: {
        ...this.publicWhere(),
        featured: true,
      },
      include: this.includeTour(),
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return tours.map((tour) => this.normalizeTour(tour));
  }

  async findPast(limit?: number) {
    const now = new Date();
    this.logger.log('Fetching completed tours');
    const tours = await this.prisma.tour.findMany({
      where: {
        ...this.publicWhere(),
        endDate: { lt: now },
      },
      include: this.includeTour(),
      orderBy: [{ endDate: 'desc' }],
      take: limit,
    });

    return tours.map((tour) => this.normalizeTour(tour));
  }

  async findCurrent(limit?: number) {
    const now = new Date();
    this.logger.log('Fetching ongoing tours');
    const tours = await this.prisma.tour.findMany({
      where: {
        ...this.publicWhere(),
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: this.includeTour(),
      orderBy: [{ startDate: 'asc' }],
      take: limit,
    });

    return tours.map((tour) => this.normalizeTour(tour));
  }

  async findUpcoming(limit?: number) {
    const now = new Date();
    this.logger.log('Fetching upcoming tours');
    const tours = await this.prisma.tour.findMany({
      where: {
        ...this.publicWhere(),
        startDate: { gt: now },
      },
      include: this.includeTour(),
      orderBy: [{ startDate: 'asc' }],
      take: limit,
    });

    return tours.map((tour) => this.normalizeTour(tour));
  }

  async findCompleted(limit?: number) {
    return this.findPast(limit);
  }

  async findOngoing(limit?: number) {
    return this.findCurrent(limit);
  }

  async findCategorized() {
    const now = new Date();
    this.logger.log('Fetching categorized public tours');
    const tours = await this.prisma.tour.findMany({
      where: this.publicWhere(),
      include: this.includeTour(),
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });

    const normalized = tours.map((tour) => this.normalizeTour(tour));
    const past: any[] = [];
    const current: any[] = [];
    const upcoming: any[] = [];

    for (const tour of normalized) {
      if (this.isCompleted(tour, now)) {
        past.push(tour);
      } else if (this.isOngoing(tour, now)) {
        current.push(tour);
      } else if (this.isUpcoming(tour, now)) {
        upcoming.push(tour);
      }
    }

    return { past, current, upcoming };
  }

  async findHome() {
    const now = new Date();
    this.logger.log('Fetching homepage tour groups');

    const [featured, upcoming, current, past] = await Promise.all([
      this.findTourGroup({ ...this.publicWhere(), featured: true }, [{ featured: 'desc' }, { createdAt: 'desc' }], 4),
      this.findTourGroup({ ...this.publicWhere(), startDate: { gt: now } }, [{ startDate: 'asc' }], 4),
      this.findTourGroup({ ...this.publicWhere(), startDate: { lte: now }, endDate: { gte: now } }, [{ startDate: 'asc' }], 4),
      this.findTourGroup({ ...this.publicWhere(), endDate: { lt: now } }, [{ endDate: 'desc' }], 4),
    ]);

    return { featured, upcoming, current, past };
  }

  private async findTourGroup(where: any, orderBy: any[], take: number) {
    const tours = await this.prisma.tour.findMany({
      where,
      include: this.includeTour(),
      orderBy,
      take,
    });

    return tours.map((tour) => this.normalizeTour(tour));
  }

  async findOne(id: string) {
    this.logger.log(`Fetching tour by id ${id}`);
    const tour = await this.prisma.tour.findUnique({
      where: { id, deletedAt: null },
      include: this.includeTour(),
    });

    if (!tour || !this.isPublic(tour)) {
      throw new NotFoundException('Published tour not found');
    }

    return this.normalizeTour(tour);
  }

  async findBySlug(slug: string) {
    this.logger.log(`Fetching tour by slug ${slug}`);
    const tour = await this.prisma.tour.findUnique({
      where: { slug, deletedAt: null },
      include: this.includeTour(),
    });

    if (!tour || !this.isPublic(tour)) {
      throw new NotFoundException('Published tour not found');
    }

    return this.normalizeTour(tour);
  }

  async update(id: string, updateTourDto: UpdateTourDto) {
    this.logger.log(`Updating tour ${id}`);
    const existing = await this.prisma.tour.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException(`Tour ${id} not found`);
    }

    this.validateTourDates(
      updateTourDto.startDate || (existing.startDate ? new Date(existing.startDate).toISOString() : undefined),
      updateTourDto.endDate || (existing.endDate ? new Date(existing.endDate).toISOString() : undefined),
    );

    const slug = updateTourDto.slug
      ? this.normalizeSlug(updateTourDto.slug)
      : this.normalizeSlug(updateTourDto.title || existing.title);

    if (slug !== existing.slug) {
      const slugExists = await this.prisma.tour.findFirst({ where: { slug, deletedAt: null } });
      if (slugExists) {
        throw new ConflictException(`Tour slug "${slug}" already exists`);
      }
    }

    const updated = await this.prisma.tour.update({
      where: { id },
      data: {
        ...updateTourDto,
        slug,
        itinerary: updateTourDto.itinerary ? this.prepareJson(updateTourDto.itinerary) : undefined,
      },
      include: this.includeTour(),
    });

    this.logger.log(`Updated tour ${id}`);
    return this.normalizeTour(updated);
  }

  async remove(id: string) {
    this.logger.log(`Soft deleting tour ${id}`);
    const existing = await this.prisma.tour.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException(`Tour ${id} not found`);
    }

    const removed = await this.prisma.tour.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.includeTour(),
    });

    return this.normalizeTour(removed);
  }

  async getStats() {
    this.logger.log('Fetching tour statistics');
    const now = new Date();
    const where = { deletedAt: null };
    const publicWhere = this.publicWhere();

    const [
      totalTours,
      publishedTours,
      draftTours,
      featuredTours,
      upcomingTours,
      ongoingTours,
      completedTours,
      cancelledTours,
      totalBookings,
      pendingBookings,
      confirmedBookings,
    ] = await Promise.all([
      this.prisma.tour.count({ where }),
      this.prisma.tour.count({ where: publicWhere }),
      this.prisma.tour.count({ where: { ...where, status: TourStatus.DRAFT } }),
      this.prisma.tour.count({ where: { ...publicWhere, featured: true } }),
      this.prisma.tour.count({ where: { ...publicWhere, startDate: { gt: now } } }),
      this.prisma.tour.count({ where: { ...publicWhere, startDate: { lte: now }, endDate: { gte: now } } }),
      this.prisma.tour.count({ where: { ...publicWhere, endDate: { lt: now } } }),
      this.prisma.tour.count({ where: { ...where, status: TourStatus.CANCELLED } }),
      this.prisma.booking.count({ where: { deletedAt: null } }),
      this.prisma.booking.count({ where: { deletedAt: null, status: 'PENDING' } }),
      this.prisma.booking.count({ where: { deletedAt: null, status: 'CONFIRMED' } }),
    ]);

    return {
      totalTours,
      publishedTours,
      draftTours,
      featuredTours,
      upcomingTours,
      ongoingTours,
      completedTours,
      cancelledTours,
      totalBookings,
      pendingBookings,
      confirmedBookings,
    };
  }

  async search(query: string, limit?: number) {
    this.logger.log(`Searching tours with query ${query}`);
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }

    const tours = await this.prisma.tour.findMany({
      where: {
        ...this.publicWhere(),
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { destination: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: this.includeTour(),
      take: limit,
    });

    return tours.map((tour) => this.normalizeTour(tour));
  }

  async getByStatus(status: TourStatus, limit?: number) {
    this.logger.log(`Fetching tours by status ${status}`);
    if (status !== TourStatus.PUBLISHED) {
      throw new BadRequestException('Public tour status endpoint only supports PUBLISHED tours');
    }

    const where: any = { deletedAt: null };
    this.applyStatusFilter(where, status);

    const tours = await this.prisma.tour.findMany({
      where,
      include: this.includeTour(),
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return tours.map((tour) => this.normalizeTour(tour));
  }

  async getByDestination(destination: string, limit?: number) {
    this.logger.log(`Fetching tours by destination ${destination}`);
    const tours = await this.prisma.tour.findMany({
      where: {
        ...this.publicWhere(),
        destination: { contains: destination, mode: 'insensitive' },
      },
      include: this.includeTour(),
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return tours.map((tour) => this.normalizeTour(tour));
  }

  async toggleFeatured(id: string) {
    const existing = await this.prisma.tour.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException(`Tour ${id} not found`);
    }

    this.logger.log(`Toggling featured status for tour ${id}`);
    const updated = await this.prisma.tour.update({
      where: { id },
      data: { featured: !existing.featured },
      include: this.includeTour(),
    });

    return this.normalizeTour(updated);
  }

  async publish(id: string) {
    return this.updateStatus(id, TourStatus.PUBLISHED);
  }

  async unpublish(id: string) {
    return this.updateStatus(id, TourStatus.DRAFT);
  }

  private async updateStatus(id: string, status: TourStatus) {
    const existing = await this.prisma.tour.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException(`Tour ${id} not found`);
    }

    this.logger.log(`Setting tour ${id} status to ${status}`);
    const updated = await this.prisma.tour.update({
      where: { id },
      data: { status },
      include: this.includeTour(),
    });

    return this.normalizeTour(updated);
  }

  private publicWhere(): any {
    return { deletedAt: null, status: TourStatus.PUBLISHED };
  }

  private applyStatusFilter(where: any, status: TourStatus) {
    if (status === TourStatus.PUBLISHED) {
      where.status = TourStatus.PUBLISHED;
      return;
    }

    if ([TourStatus.DRAFT, TourStatus.CANCELLED, TourStatus.UPCOMING, TourStatus.COMPLETED].includes(status)) {
      where.status = status;
      return;
    }

    throw new BadRequestException(`Invalid tour status: ${status}`);
  }

  private isPublic(tour: any) {
    return tour.status === TourStatus.PUBLISHED && !tour.deletedAt;
  }

  private isUpcoming(tour: any, now: Date) {
    const start = tour.startDate ? new Date(tour.startDate) : null;
    return this.isPublic(tour) && !!start && start > now;
  }

  private isOngoing(tour: any, now: Date) {
    const start = tour.startDate ? new Date(tour.startDate) : null;
    const end = tour.endDate ? new Date(tour.endDate) : null;
    return this.isPublic(tour) && !!start && !!end && start <= now && end >= now;
  }

  private isCompleted(tour: any, now: Date) {
    const end = tour.endDate ? new Date(tour.endDate) : null;
    return this.isPublic(tour) && !!end && end < now;
  }

  private normalizeTour(tour: any): any {
    return {
      ...tour,
      price: Number(tour.price),
      startDate: tour.startDate ? new Date(tour.startDate).toISOString() : undefined,
      endDate: tour.endDate ? new Date(tour.endDate).toISOString() : undefined,
      itinerary: this.parseJson(tour.itinerary),
      bookingsCount: tour._count?.bookings ?? 0,
    };
  }

  private parseJson(value: any): any {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return value;
  }

  private prepareJson(value: any): any {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return value;
  }

  private includeTour() {
    return {
      service: true,
      _count: {
        select: { bookings: true },
      },
    };
  }

  private validateTourDates(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Tour dates must be valid dates');
    }

    if (end < start) {
      throw new BadRequestException('Tour end date cannot be before start date');
    }
  }

  private normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'tour';
  }

  private parsePositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
