import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, Logger } from '@nestjs/common';
import { BlogService } from './blog.service';
import { AssistBlogDto, CreateBlogPostDto, GenerateBlogDto } from './dto/create-blog-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('blog')
export class BlogController {
  private logger = new Logger('BlogController');

  constructor(private blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  create(@Body() createBlogPostDto: CreateBlogPostDto) {
    this.logger.log(`POST /blog - Creating post`);
    return this.blogService.create(createBlogPostDto);
  }

  @Post('ai/sources')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  getAiSources(@Body() sourceSelection = {}) {
    this.logger.log('POST /blog/ai/sources');
    return this.blogService.getAiSources(sourceSelection);
  }

  @Post('ai/generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  generate(@Body() generateBlogDto: GenerateBlogDto) {
    this.logger.log('POST /blog/ai/generate');
    return this.blogService.generateAiBlog(generateBlogDto);
  }

  @Post('ai/assist')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  assist(@Body() assistBlogDto: AssistBlogDto) {
    this.logger.log(`POST /blog/ai/assist - action=${assistBlogDto.action}`);
    return this.blogService.assistAiBlog(assistBlogDto);
  }

  /**
   * Public endpoint - returns only published posts
   * Supports filtering by category
   * MUST be before @Get(':id') to match correctly
   */
  @Get('public')
  async findAllPublic(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    this.logger.log(`GET /blog/public - page=${page}, limit=${limit}, categoryId=${categoryId}`);
    const results = await this.blogService.findAllPublic(page, limit, categoryId);
    this.logger.log(`GET /blog/public - Returning ${Array.isArray(results) ? results.length : 0} posts`);
    return results;
  }

  /**
   * Admin endpoint - returns all posts (published + draft)
   * MUST be before @Get(':id') to match correctly
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  async findAllAdmin(@Query('page') page?: string, @Query('limit') limit?: string) {
    this.logger.log(`GET /blog/admin - page=${page}, limit=${limit}`);
    const results = await this.blogService.findAllAdmin(page, limit);
    this.logger.log(`GET /blog/admin - Returning ${Array.isArray(results) ? results.length : 0} posts`);
    return results;
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  getStats() {
    return this.blogService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`GET /blog/:id - id=${id}`);
    return this.blogService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    this.logger.log(`GET /blog/slug/:slug - slug=${slug}`);
    return this.blogService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() updateBlogPostDto: CreateBlogPostDto) {
    this.logger.log(`PATCH /blog/:id - id=${id}`);
    return this.blogService.update(id, updateBlogPostDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.blogService.update(id, { status: body.status as any });
  }

  @Patch(':id/autosave')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  autosave(@Param('id') id: string, @Body() body: Partial<CreateBlogPostDto>) {
    return this.blogService.update(id, { ...body, lastAutosavedAt: new Date().toISOString() });
  }

  @Post(':id/increment-views')
  incrementViews(@Param('id') id: string) {
    return this.blogService.incrementViews(id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  publish(@Param('id') id: string) {
    this.logger.log(`POST /blog/:id/publish - id=${id}`);
    return this.blogService.publish(id);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  archive(@Param('id') id: string) {
    this.logger.log(`POST /blog/:id/archive - id=${id}`);
    return this.blogService.archive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CONTENT_MANAGER', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    this.logger.log(`DELETE /blog/:id - id=${id}`);
    return this.blogService.remove(id);
  }
}
