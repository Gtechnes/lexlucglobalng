import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, PaymentStatus } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'SUPER_ADMIN', 'CONTENT_MANAGER')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('tourId') tourId?: string,
    @Query('search') search?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: 'asc' | 'desc',
  ) {
    return this.bookingsService.findAll(page, limit, status, tourId, search, paymentStatus, sortBy, sortDir);
  }

  @Get('reference/:referenceNo')
  findByReference(@Param('referenceNo') referenceNo: string) {
    return this.bookingsService.findByReference(referenceNo);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'SUPER_ADMIN', 'CONTENT_MANAGER')
  getStats() {
    return this.bookingsService.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'SUPER_ADMIN', 'CONTENT_MANAGER')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'SUPER_ADMIN')
  updateStatus(@Param('id') id: string, @Query('status') status: string) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Patch(':id/payment-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'SUPER_ADMIN')
  updatePaymentStatus(@Param('id') id: string, @Query('paymentStatus') paymentStatus: PaymentStatus) {
    return this.bookingsService.updatePaymentStatus(id, paymentStatus);
  }

  @Patch(':id/notes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'SUPER_ADMIN', 'CONTENT_MANAGER')
  updateNotes(@Param('id') id: string, @Body() body: { notes: string }) {
    return this.bookingsService.updateNotes(id, body.notes);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}