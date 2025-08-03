import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface JwtPayload {
  sub: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {
    super();
  }

  handleRequest<TUser = JwtPayload>(
    err: unknown,
    user: TUser | false | null,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return {} as TUser;
    }

    const req = context.switchToHttp().getRequest<RequestWithCookies>();
    const res = context.switchToHttp().getResponse<Response>();

    // Debugging (remove if you want)
    console.log('[GUARD] JWT Auth Guard triggered');
    console.log('[GUARD] User:', user);
    console.log('[GUARD] Error:', err);
    console.log('[GUARD] Info:', info);
    console.log('[GUARD] Cookies:', req.cookies);

    //  If Passport already validated the user
    if (user) {
      return user;
    }

    //  If token expired
    if (
      info instanceof TokenExpiredError ||
      (info instanceof Error && info.message === 'No auth token')
    ) {
      const refreshToken = req.cookies?.['refresh_token'];
      if (!refreshToken) {
        throw new UnauthorizedException('Missing refresh token');
      }
      if (refreshToken) {
        console.log('[GUARD] Refresh token found, attempting silent refresh');
      }

      // Verify refresh token
      let payload: JwtPayload;
      try {
        payload = this.jwtService.verify<JwtPayload>(refreshToken, {
          secret: process.env.JWT_REFRESH_SECRET,
        });
      } catch (error) {
        console.error('[GUARD] Refresh token verification failed:', error);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const expirationSeconds =
        Number(process.env.JWT_ACCESS_EXPIRES_SECONDS) || 15 * 60; // Default to 15 minutes

      // Issue new access token (sync version)
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, role: payload.role, email: payload.email },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: expirationSeconds,
        },
      );
      console.log('[GUARD] New access token generated:', newAccessToken);

      // Set new access token as cookie
      res.cookie('access_token', newAccessToken, {
        httpOnly: false,
        secure: false, // set true in production over HTTPS
        sameSite: 'lax',
        maxAge: expirationSeconds * 1000, // Convert seconds to milliseconds
      });

      console.log('[GUARD] Silent refresh issued a new access token');
      return {
        sub: payload.sub,
        role: payload.role,
        email: payload.email,
      } as TUser;
    }

    //  Otherwise throw unauthorized
    throw new UnauthorizedException();
  }
}
