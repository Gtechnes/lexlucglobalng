import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedHandler: any = null;
const expressApp = express();

async function createNestApp() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const NODE_ENV = process.env.NODE_ENV || 'development';
  const CORS_ORIGIN = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'https://lexlucglobalng.vercel.app', 'https://lexlucglobalng-back.vercel.app'];

  // Security Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: CORS_ORIGIN,
      credentials: true,
    }),
  );

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

  // Global Pipes & Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // API Prefix
  app.setGlobalPrefix('api/v1');

  await app.init();
  return expressApp;
}

// For local development - start server
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  createNestApp().then(app => {
    app.listen(PORT, () => {
      console.log(`🚀 Application is running on: http://localhost:${PORT}/api/v1`);
    });
  });
}

// For Vercel serverless
export default async function handler(req: any, res: any) {
  const app = await createNestApp();
  return serverless(app)(req, res);
}