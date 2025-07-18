import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no role restrictions
    }

    interface User {
      role?: string;
      // add other user properties if needed
    }
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();
    const user: User | undefined = request.user;
    return requiredRoles.includes(user?.role ?? '');
  }
}
