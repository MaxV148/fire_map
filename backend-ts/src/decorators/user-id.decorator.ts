import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/request.interface';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.userId) {
      throw new Error('userId nicht in Request verfügbar');
    }
    return request.userId;
  },
);

export const UserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.userRole) {
      throw new Error('userRole nicht in Request verfügbar');
    }
    return request.userRole;
  },
);
