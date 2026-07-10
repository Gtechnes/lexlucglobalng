import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  async create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.servicesService.findAll(page, limit);
  }

  @Get('public')
  findPublic() {
    return this.servicesService.findPublic();
  }

  @Get('featured')
  findFeatured(@Query('limit') limit?: string) {
    return this.servicesService.findFeatured(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('stats')
  getStats() {
    return this.servicesService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!id) throw new BadRequestException('ID is required');
    return this.servicesService.findOne(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    if (!slug) throw new BadRequestException('Slug is required');
    return this.servicesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  async update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Patch(':id/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  async reorder(@Param('id') id: string, @Body('newOrder') newOrder: number) {
    if (typeof newOrder !== 'number' || !Number.isFinite(newOrder)) {
      throw new BadRequestException('Valid newOrder number is required');
    }
    return this.servicesService.reorder(id, newOrder);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
