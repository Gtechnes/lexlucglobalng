import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    this.logger.log(`Creating booking for tour ${createBookingDto.tourId}`);

    const tour: any = await this.prisma.tour.findFirst({ where: { id: createBookingDto.tourId, deletedAt: null } });
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
      const bookingSummary = await this.prisma.booking.aggregate({
        where: { tourId: createBookingDto.tourId, deletedAt: null },
        _sum: { numberOfTravelers: true },
      });
      const existingParticipants = bookingSummary._sum?.numberOfTravelers || 0;
      const availableSlots = tour.availableSlots - existingParticipants;

      if (availableSlots <= 0) {
        throw new BadRequestException('Tour is fully booked');
      }
      if (createBookingDto.numberOfTravelers > availableSlots) {
        throw new BadRequestException('Not enough available slots for this booking');
      }
    }

    const totalPrice = Number(tour.price || 0) * createBookingDto.numberOfTravelers;

    return this.prisma.booking.create({
      data: {
        ...createBookingDto,
        numberOfParticipants: createBookingDto.numberOfTravelers,
        paymentStatus: createBookingDto.paymentStatus || 'PENDING',
        totalPrice,
      },
      include: {
        tour: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
  }

  async findAll(page?: string, limit?: string, status?: string, tourId?: string, search?: string, paymentStatus?: string, sortBy?: string, sortDir?: 'asc' | 'desc') {
    const parsedPage = this.parsePositiveInt(page, 1);
    const parsedLimit = Math.min(this.parsePositiveInt(limit, 20), 100);
    const where: any = { deletedAt: null };

    if (status) {
      where.status = status;
    }
    if (tourId) {
      where.tourId = tourId;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (search) {
      const sanitizedSearch = search.trim();
      if (sanitizedSearch) {
        where.OR = [
          { fullName: { contains: sanitizedSearch, mode: 'insensitive' } },
          { email: { contains: sanitizedSearch, mode: 'insensitive' } },
          { phone: { contains: sanitizedSearch, mode: 'insensitive' } },
          { referenceNo: { contains: sanitizedSearch, mode: 'insensitive' } },
          { tour: { title: { contains: sanitizedSearch, mode: 'insensitive' } } },
          { tour: { destination: { contains: sanitizedSearch, mode: 'insensitive' } } },
        ];
      }
    }

    let orderBy: any = [{ createdAt: 'desc' }];
    if (sortBy) {
      const sortField = sortBy === 'customerName' ? 'fullName' : 
                        sortBy === 'tourName' ? 'tour' :
                        sortBy === 'bookingStatus' ? 'status' : sortBy;
      const sortOrder = sortDir === 'asc' ? 'asc' : 'desc';
      
      if (sortBy === 'tourName') {
        orderBy = [{ tour: { title: sortOrder } }];
      } else {
        orderBy = [{ [sortField]: sortOrder }];
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          tour: {
            select: {
              id: true,
              title: true,
              destination: true,
              category: true,
              departureLocation: true,
              startDate: true,
              endDate: true,
              status: true,
              price: true,
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy,
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async findOne(id: string) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          tour: {
            select: {
              id: true,
              title: true,
              destination: true,
              category: true,
              departureLocation: true,
              startDate: true,
              endDate: true,
              status: true,
              price: true,
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      return {
        ...booking,
        tour: booking.tour || undefined,
        user: booking.user || undefined,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching booking ${id}`, error);
      throw new NotFoundException('Booking not found');
    }
  }

  async getStats() {
    try {
      const total = await this.prisma.booking.count({ where: { deletedAt: null } });
      const pending = await this.prisma.booking.count({ where: { deletedAt: null, status: 'PENDING' as any } });
      const confirmed = await this.prisma.booking.count({ where: { deletedAt: null, status: 'CONFIRMED' as any } });
      const completed = await this.prisma.booking.count({ where: { deletedAt: null, status: 'COMPLETED' as any } });
      const cancelled = await this.prisma.booking.count({ where: { deletedAt: null, status: 'CANCELLED' as any } });

      return {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
      };
    } catch (error) {
      this.logger.error('Error getting booking stats', error);
      // Return zeros instead of crashing
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      };
    }
  }

  private parsePositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  async findByReference(referenceNo: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { referenceNo },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            destination: true,
            category: true,
            departureLocation: true,
            startDate: true,
            endDate: true,
            status: true,
            price: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  updateStatus(id: string, status: string) {
    this.logger.log(`Updating booking ${id} status to ${status}`);
    return this.prisma.booking.update({ where: { id }, data: { status: status as any } });
  }

  updatePaymentStatus(id: string, paymentStatus: string) {
    return this.prisma.booking.update({ where: { id }, data: { paymentStatus } });
  }

  updateNotes(id: string, notes: string) {
    return this.prisma.booking.update({ where: { id }, data: { notes } });
  }

  remove(id: string) {
    this.logger.log(`Soft deleting booking ${id}`);
    return this.prisma.booking.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
