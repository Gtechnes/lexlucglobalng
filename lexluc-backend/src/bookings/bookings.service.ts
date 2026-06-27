import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    this.logger.log(`Creating booking for tour ${createBookingDto.tourId}`);

    const tour: any = await this.prisma.tour.findUnique({ where: { id: createBookingDto.tourId, deletedAt: null } });
    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    if (tour.status !== 'PUBLISHED') {
      throw new BadRequestException('Tour is not available for booking');
    }

    const now = new Date();
    const start = tour.startDate ? new Date(tour.startDate) : null;
    const end = tour.endDate ? new Date(tour.endDate) : null;
    if (end && end < now) {
      throw new BadRequestException('Tour has already completed');
    }
    if (start && start > now && end && end < start) {
      throw new BadRequestException('Tour dates are invalid');
    }

    if (tour.availableSlots !== null && tour.availableSlots !== undefined) {
      const existingBookings = await this.prisma.booking.count({
        where: { tourId: createBookingDto.tourId, deletedAt: null },
      });
      if (existingBookings >= tour.availableSlots) {
        throw new BadRequestException('Tour is fully booked');
      }
      if (createBookingDto.numberOfTravelers > tour.availableSlots - existingBookings) {
        throw new BadRequestException('Not enough available slots for this booking');
      }
    }

    const totalPrice = createBookingDto.totalPrice || Number(tour.price) * createBookingDto.numberOfTravelers;

    return this.prisma.booking.create({
      data: {
        ...createBookingDto,
        numberOfParticipants: createBookingDto.numberOfTravelers,
        paymentStatus: createBookingDto.paymentStatus || 'PENDING',
        totalPrice,
      },
    });
  }

  findAll(page?: string, limit?: string, status?: string, tourId?: string) {
    return this.prisma.booking.findMany();
  }

  findOne(id: string) {
    return this.prisma.booking.findUnique({ where: { id } });
  }

  findByReference(referenceNo: string) {
    return this.prisma.booking.findUnique({ where: { referenceNo } });
  }

  updateStatus(id: string, status: string) {
    this.logger.log(`Updating booking ${id} status to ${status}`);
    return this.prisma.booking.update({ where: { id }, data: { status: status as any } });
  }

  updatePaymentStatus(id: string, paymentStatus: string) {
    return this.prisma.booking.update({ where: { id }, data: { paymentStatus } });
  }

  remove(id: string) {
    this.logger.log(`Soft deleting booking ${id}`);
    return this.prisma.booking.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
