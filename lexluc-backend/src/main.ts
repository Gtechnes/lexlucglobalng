import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const NODE_ENV = process.env.NODE_ENV || 'development';

  const CORS_ORIGIN = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

  // Security Middleware
  app.use(helmet());

  app.enableCors({
    origin: CORS_ORIGIN,
    credentials: true,
  });

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: NODE_ENV === 'production' ? 100 : 5000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
  });

  app.use('/api/', limiter);

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // API Prefix
  app.setGlobalPrefix('api/v1');

  const PORT = process.env.PORT || 3001;

  await app.listen(PORT, '0.0.0.0');

  console.log(
    `🚀 Lexluc Global API running on port ${PORT}/api/v1`,
  );
}

bootstrap();
