import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient, ServiceStatus } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000;

  private async connectWithRetry(): Promise<void> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await super.$connect();
        this.logger.log('Connected to PostgreSQL through Prisma');
        return;
      } catch (error: any) {
        this.logger.warn(`Database connection attempt ${attempt}/${this.maxRetries} failed: ${error?.message || error}`);
        if (attempt === this.maxRetries) {
          throw new Error(`Failed to connect to database after ${this.maxRetries} attempts: ${error?.message || error}`);
        }
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected Prisma client');
  }
}

export { ServiceStatus };
