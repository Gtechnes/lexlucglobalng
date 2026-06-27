import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, Logger } from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto, TourStatus } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('tours')
export class ToursController {
  private readonly logger = new Logger(ToursController.name);

  constructor(private toursService: ToursService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  create(@Body() createTourDto: CreateTourDto) {
    this.logger.log('POST /tours');
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
    this.logger.log('GET /tours');
    return this.toursService.findAll({
      page,
      limit,
      status,
      destination,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    });
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  findAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: TourStatus,
    @Query('destination') destination?: string,
    @Query('featured') featured?: string,
  ) {
    this.logger.log('GET /tours/admin');
    return this.toursService.findAdmin({
      page,
      limit,
      status,
      destination,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    });
  }

  @Get('published')
  findPublic(
    @Query('limit') limit?: string,
    @Query('status') status?: TourStatus,
    @Query('destination') destination?: string,
    @Query('featured') featured?: string,
  ) {
    this.logger.log('GET /tours/published');
    return this.toursService.findAll({
      limit,
      status,
      destination,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    });
  }

  @Get('home')
  getHome() {
    this.logger.log('GET /tours/home');
    return this.toursService.findHome();
  }

  @Get('past')
  getPast(@Query('limit') limit?: string) {
    this.logger.log('GET /tours/past');
    return this.toursService.findPast(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('completed')
  getCompleted(@Query('limit') limit?: string) {
    this.logger.log('GET /tours/completed');
    return this.toursService.findCompleted(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('current')
  getCurrent(@Query('limit') limit?: string) {
    this.logger.log('GET /tours/current');
    return this.toursService.findCurrent(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('ongoing')
  getOngoing(@Query('limit') limit?: string) {
    this.logger.log('GET /tours/ongoing');
    return this.toursService.findOngoing(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('upcoming')
  getUpcoming(@Query('limit') limit?: string) {
    this.logger.log('GET /tours/upcoming');
    return this.toursService.findUpcoming(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('categorized')
  getCategorized() {
    this.logger.log('GET /tours/categorized');
    return this.toursService.findCategorized();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN', 'BOOKING_MANAGER')
  getStats() {
    this.logger.log('GET /tours/stats');
    return this.toursService.getStats();
  }

  @Get('search')
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    this.logger.log(`GET /tours/search?q=${query}`);
    return this.toursService.search(query, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('featured')
  getFeatured(@Query('limit') limit?: string) {
    this.logger.log('GET /tours/featured');
    return this.toursService.findFeatured(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('status/:status')
  getByStatus(@Param('status') status: TourStatus, @Query('limit') limit?: string) {
    this.logger.log(`GET /tours/status/${status}`);
    return this.toursService.getByStatus(status, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('destination/:destination')
  getByDestination(@Param('destination') destination: string, @Query('limit') limit?: string) {
    this.logger.log(`GET /tours/destination/${destination}`);
    return this.toursService.getByDestination(destination, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    this.logger.log(`GET /tours/slug/${slug}`);
    return this.toursService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`GET /tours/${id}`);
    return this.toursService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    this.logger.log(`PATCH /tours/${id}`);
    return this.toursService.update(id, updateTourDto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  publish(@Param('id') id: string) {
    this.logger.log(`PATCH /tours/${id}/publish`);
    return this.toursService.publish(id);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  unpublish(@Param('id') id: string) {
    this.logger.log(`PATCH /tours/${id}/unpublish`);
    return this.toursService.unpublish(id);
  }

  @Patch(':id/feature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  toggleFeatured(@Param('id') id: string) {
    this.logger.log(`PATCH /tours/${id}/feature`);
    return this.toursService.toggleFeatured(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    this.logger.log(`DELETE /tours/${id}`);
    return this.toursService.remove(id);
  }
}
