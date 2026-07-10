import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        details = exceptionResponse;
      } else {
        message = String(exceptionResponse || exception.message);
        details = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = { stack: exception.stack };
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
    }

    const responseBody: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    if (details !== null) {
      responseBody.details = details;
    }

    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      responseBody.stack = exception.stack;
    }

    response.status(status).json(responseBody);
  }
}
