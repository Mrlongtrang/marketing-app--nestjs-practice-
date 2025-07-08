import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    console.log('[GUARD] JWT Auth Guard triggered');
    console.log('[GUARD] User:', user);
    console.log('[GUARD] Error:', err);
    console.log('[GUARD] Info:', info);
    console.log('[GUARD] Cookies:', req.cookies);

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
