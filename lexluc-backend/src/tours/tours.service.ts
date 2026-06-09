import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTourDto, UpdateTourDto, TourStatus } from './dto/create-tour.dto';

@Injectable()
export class ToursService {
  private readonly logger = new Logger(ToursService.name);

  constructor(private prisma: PrismaService) {}

  create(createTourDto: CreateTourDto) {
    this.logger.log(`Creating tour: ${createTourDto.title}`);
    return (this.prisma as any).tour.create({ data: createTourDto });
  }

  findAll(page?: string, limit?: string, status?: TourStatus, destination?: string, featured?: boolean) {
    return (this.prisma as any).tour.findMany();
  }

  findOne(id: string) {
    return (this.prisma as any).tour.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return (this.prisma as any).tour.findUnique({ where: { slug } });
  }

  update(id: string, updateTourDto: UpdateTourDto) {
    this.logger.log(`Updating tour ${id}`);
    return (this.prisma as any).tour.update({ where: { id }, data: updateTourDto });
  }

  remove(id: string) {
    this.logger.log(`Soft deleting tour ${id}`);
    return (this.prisma as any).tour.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  getStats() {
    return {
      totalTours: 5,
      publishedTours: 3,
      draftTours: 2,
      featuredTours: 1,
      upcomingTours: 3,
      completedTours: 1,
      totalBookings: 10,
      pendingBookings: 4,
      confirmedBookings: 6,
    };
  }

  search(query: string, limit?: number) {
    return (this.prisma as any).tour.findMany();
  }

  getFeatured(limit?: number) {
    return (this.prisma as any).tour.findMany();
  }

  getByStatus(status: TourStatus, limit?: number) {
    return (this.prisma as any).tour.findMany();
  }

  getByDestination(destination: string, limit?: number) {
    return (this.prisma as any).tour.findMany();
  }

  async toggleFeatured(id: string) {
    const tour: any = await (this.prisma as any).tour.findUnique({ where: { id } });
    if (!tour) {
      throw new BadRequestException('Tour not found');
    }

    return (this.prisma as any).tour.update({
      where: { id },
      data: { featured: !tour.featured },
    });
  }

  publish(id: string) {
    return (this.prisma as any).tour.update({ where: { id }, data: { status: 'PUBLISHED' } });
  }

  unpublish(id: string) {
    return (this.prisma as any).tour.update({ where: { id }, data: { status: 'DRAFT' } });
  }
}