import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService, ServiceStatus } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    this.logger.log(`Creating service: ${createServiceDto.name}`);
    const slug = createServiceDto.slug || this.generateSlug(createServiceDto.name);
    const existing = await this.prisma.service.findFirst({ where: { slug, deletedAt: null } });
    if (existing) {
      throw new BadRequestException(`Service with slug "${slug}" already exists`);
    }
    const data = {
      name: createServiceDto.name,
      slug,
      description: createServiceDto.description,
      content: createServiceDto.content || null,
      icon: createServiceDto.icon || null,
      image: createServiceDto.image || null,
      order: createServiceDto.order ?? 0,
      isActive: createServiceDto.isActive ?? true,
      status: (createServiceDto.status as ServiceStatus) || 'DRAFT',
      featured: createServiceDto.featured || false,
      serviceBanner: createServiceDto.serviceBanner || null,
      features: createServiceDto.features?.filter((f) => f.trim()) || [],
      ctaText: createServiceDto.ctaText || 'Learn More',
      ctaLink: createServiceDto.ctaLink || '/contact',
      metaTitle: createServiceDto.metaTitle || null,
      metaDescription: createServiceDto.metaDescription || null,
    };
    return this.prisma.service.create({ data, include: { media: true } });
  }

  async findAll(page?: string, limit?: string) {
    this.logger.log('Fetching all services');
    const parsedPage = this.parsePositiveInt(page, 1);
    const parsedLimit = Math.min(this.parsePositiveInt(limit, 100), 100);
    const skip = (parsedPage - 1) * parsedLimit;
    const where = { deletedAt: null };
    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: parsedLimit,
        include: { media: true },
      }),
      this.prisma.service.count({ where }),
    ]);
    return { data, meta: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) } };
  }

  async findPublic() {
    this.logger.log('Fetching published active services');
    return this.prisma.service.findMany({
      where: { deletedAt: null, status: 'PUBLISHED', isActive: true },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
      include: { media: true },
    });
  }

  async findFeatured(limit?: number) {
    return this.prisma.service.findMany({
      where: { deletedAt: null, status: 'PUBLISHED', isActive: true, featured: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      include: { media: true },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findFirst({ where: { id, deletedAt: null }, include: { media: true } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({ where: { slug, deletedAt: null }, include: { media: true } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    this.logger.log(`Updating service ${id}`);
    const existing = await this.prisma.service.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException('Service not found');
    const slug = updateServiceDto.slug || this.generateSlug(updateServiceDto.name || existing.name);
    if (slug !== existing.slug) {
      const duplicate = await this.prisma.service.findFirst({ where: { slug, deletedAt: null, id: { not: id } } });
      if (duplicate) throw new BadRequestException(`Service with slug "${slug}" already exists`);
    }
    const data: any = { ...updateServiceDto };
    if (updateServiceDto.name && !updateServiceDto.slug) data.slug = slug;
    if (updateServiceDto.features !== undefined) data.features = data.features.filter((f: string) => f.trim());
    if (data.serviceBanner === '') data.serviceBanner = null;
    if (data.content === '') data.content = null;
    return this.prisma.service.update({ where: { id }, data, include: { media: true } });
  }

  async remove(id: string) {
    this.logger.log(`Soft deleting service ${id}`);
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async reorder(id: string, newOrder: number) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data: { order: newOrder } });
  }

  async getStats() {
    const total = await this.prisma.service.count({ where: { deletedAt: null } });
    const active = await this.prisma.service.count({ where: { deletedAt: null, isActive: true } });
    const published = await this.prisma.service.count({ where: { deletedAt: null, status: 'PUBLISHED' } });
    const featured = await this.prisma.service.count({ where: { deletedAt: null, featured: true } });
    return { total, active, published, featured };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `service-${Date.now()}`;
  }

  private parsePositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
