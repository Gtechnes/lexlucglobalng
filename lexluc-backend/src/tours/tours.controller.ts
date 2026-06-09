import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto, UpdateTourDto, TourStatus } from './dto/create-tour.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('tours')
export class ToursController {
  constructor(private toursService: ToursService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  create(@Body() createTourDto: CreateTourDto) {
    return this.toursService.create(createTourDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: TourStatus,
    @Query('destination') destination?: string,
    @Query('featured') featured?: string,
  ) {
    return this.toursService.findAll(
      page,
      limit,
      status,
      destination,
      featured === 'true' ? true : featured === 'false' ? false : undefined,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN', 'BOOKING_MANAGER')
  getStats() {
    return this.toursService.getStats();
  }

  @Get('search')
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.toursService.search(query, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('featured')
  getFeatured(@Query('limit') limit?: string) {
    return this.toursService.getFeatured(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('status/:status')
  getByStatus(@Param('status') status: TourStatus, @Query('limit') limit?: string) {
    return this.toursService.getByStatus(status, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('destination/:destination')
  getByDestination(@Param('destination') destination: string, @Query('limit') limit?: string) {
    return this.toursService.getByDestination(destination, limit ? parseInt(limit, 10) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toursService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.toursService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    return this.toursService.update(id, updateTourDto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  publish(@Param('id') id: string) {
    return this.toursService.publish(id);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  unpublish(@Param('id') id: string) {
    return this.toursService.unpublish(id);
  }

  @Patch(':id/feature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  toggleFeatured(@Param('id') id: string) {
    return this.toursService.toggleFeatured(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}