import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    this.logger.log(`Creating booking for tour ${createBookingDto.tourId}`);

    // Get the tour to check available slots
    const tour: any = await (this.prisma as any).tour.findUnique({ where: { id: createBookingDto.tourId } });

    // Calculate total price
    const totalPrice = createBookingDto.totalPrice || (tour ? tour.price * createBookingDto.numberOfTravelers : 0);

    return (this.prisma as any).booking.create({
      data: {
        ...createBookingDto,
        firstName: createBookingDto.fullName.split(' ')[0] || createBookingDto.fullName,
        lastName: createBookingDto.fullName.split(' ').slice(1).join(' ') || '',
        numberOfParticipants: createBookingDto.numberOfTravelers,
        paymentStatus: createBookingDto.paymentStatus || 'PENDING',
        totalPrice,
      },
    });
  }

  findAll(page?: string, limit?: string, status?: string, tourId?: string) {
    return (this.prisma as any).booking.findMany();
  }

  findOne(id: string) {
    return (this.prisma as any).booking.findUnique({ where: { id } });
  }

  findByReference(referenceNo: string) {
    return (this.prisma as any).booking.findUnique({ where: { referenceNo } });
  }

  updateStatus(id: string, status: string) {
    this.logger.log(`Updating booking ${id} status to ${status}`);
    return (this.prisma as any).booking.update({ where: { id }, data: { status } });
  }

  updatePaymentStatus(id: string, paymentStatus: string) {
    return (this.prisma as any).booking.update({ where: { id }, data: { paymentStatus } });
  }

  remove(id: string) {
    this.logger.log(`Soft deleting booking ${id}`);
    return (this.prisma as any).booking.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}