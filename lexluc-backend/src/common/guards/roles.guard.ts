import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Allow access in development mode for testing
    if (process.env.NODE_ENV === 'development' || process.env.ENVIRONMENT === 'development') {
      return true;
    }

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return requiredRoles.includes(user.role);
  }
}
