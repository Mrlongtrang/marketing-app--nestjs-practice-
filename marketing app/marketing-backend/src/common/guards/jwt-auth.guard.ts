import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  handleRequest<TUser = JwtPayload>(
    err: unknown,
    user: TUser | false | null,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const req = context.switchToHttp().getRequest<RequestWithCookies>();
    const res = context.switchToHttp().getResponse<Response>();

    // Debugging (remove if you want)
    console.log('[GUARD] JWT Auth Guard triggered');
    console.log('[GUARD] User:', user);
    console.log('[GUARD] Error:', err);
    console.log('[GUARD] Info:', info);
    console.log('[GUARD] Cookies:', req.cookies);

    // ✅ If Passport already validated the user
    if (user) {
      return user;
    }

    // ✅ If token expired
    if (info instanceof TokenExpiredError) {
      const refreshToken = req.cookies?.['refreshToken'];
      if (!refreshToken) {
        throw new UnauthorizedException('Missing refresh token');
      }

      // Verify refresh token
      let payload: JwtPayload;
      try {
        payload = this.jwtService.verify<JwtPayload>(refreshToken, {
          secret: process.env.JWT_REFRESH_SECRET as string,
        });
      } catch {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Issue new access token (sync version)
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, role: payload.role },
        {
          secret: process.env.JWT_ACCESS_SECRET as string,
          expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
        },
      );

      // Set new access token as cookie
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: false, // set true in production over HTTPS
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      console.log('[GUARD] Silent refresh issued a new access token');
      return { sub: payload.sub, role: payload.role } as unknown as TUser;
    }

    // ❌ Otherwise throw unauthorized
    throw new UnauthorizedException();
  }
}
