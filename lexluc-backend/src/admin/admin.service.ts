import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [users, services, tours, bookings, blogPosts, unreadContacts] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.service.count({ where: { deletedAt: null } }),
      this.prisma.tour.count({ where: { deletedAt: null } }),
      this.prisma.booking.count({ where: { deletedAt: null } }),
      this.prisma.blogPost.count({ where: { deletedAt: null } }),
      this.prisma.contactMessage.count({ where: { deletedAt: null, isRead: false } }),
    ]);

    return {
      users,
      services,
      tours,
      bookings,
      posts: blogPosts,
      unreadContacts,
    };
  }
}
