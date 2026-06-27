import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Bypass authentication in development mode
    if (process.env.NODE_ENV === 'development' || process.env.ENVIRONMENT === 'development') {
      return true;
    }
    return super.canActivate(context);
  }
}