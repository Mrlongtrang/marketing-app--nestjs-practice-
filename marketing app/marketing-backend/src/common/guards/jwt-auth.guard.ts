import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface JwtUser {
  id: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    const req = context.switchToHttp().getRequest<Request>();

    console.log('[GUARD] JWT Auth Guard triggered');
    console.log('[GUARD] User:', user);
    console.log('[GUARD] Error:', err);
    console.log('[GUARD] Info:', info);
    console.log('[GUARD] Cookies:', req.cookies);

    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user as TUser;
  }
}
