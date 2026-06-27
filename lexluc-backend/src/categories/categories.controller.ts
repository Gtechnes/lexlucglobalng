import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  private logger = new Logger('CategoriesController');

  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  create(@Body() createBlogCategoryDto: CreateBlogCategoryDto) {
    this.logger.log(`POST /categories - Creating category: "${createBlogCategoryDto.name}"`);
    return this.categoriesService.create(createBlogCategoryDto);
  }

  /**
   * Public endpoint - get all categories
   */
  @Get()
  findAll() {
    this.logger.log('GET /categories - Fetching all categories');
    return this.categoriesService.findAll();
  }

  /**
   * Get category by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`GET /categories/:id - id=${id}`);
    return this.categoriesService.findOne(id);
  }

  /**
   * Get category by slug
   */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    this.logger.log(`GET /categories/slug/:slug - slug=${slug}`);
    return this.categoriesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() updateBlogCategoryDto: CreateBlogCategoryDto) {
    this.logger.log(`PATCH /categories/:id - id=${id}`);
    return this.categoriesService.update(id, updateBlogCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    this.logger.log(`DELETE /categories/:id - id=${id}`);
    return this.categoriesService.remove(id);
  }
}
