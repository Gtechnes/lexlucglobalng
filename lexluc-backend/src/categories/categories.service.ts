import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  private logger = new Logger('CategoriesService');

  constructor(private prisma: PrismaService) {}

  async create(createBlogCategoryDto: any) {
    this.logger.log(`Creating blog category: name="${createBlogCategoryDto.name}"`);
    return (this.prisma as any).blogCategory.create({ data: createBlogCategoryDto });
  }

  async findAll() {
    this.logger.log('Fetching all blog categories');
    return (this.prisma as any).blogCategory.findMany() as any;
  }

  async findOne(id: string) {
    return (this.prisma as any).blogCategory.findUnique({ where: { id } }) as any;
  }

  async findBySlug(slug: string) {
    return (this.prisma as any).blogCategory.findUnique({ where: { slug } }) as any;
  }

  async update(id: string, updateBlogCategoryDto: any) {
    this.logger.log(`Updating blog category: id="${id}"`);
    return (this.prisma as any).blogCategory.update({ where: { id }, data: updateBlogCategoryDto });
  }

  async remove(id: string) {
    this.logger.log(`Deleting blog category: id="${id}"`);
    return (this.prisma as any).blogCategory.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}