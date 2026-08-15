import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, ServiceStatus } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected Prisma client');
  }
}

export { ServiceStatus };
