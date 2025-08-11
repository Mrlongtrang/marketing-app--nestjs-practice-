import {
  Body,
  Controller,
  Post,
  Res,
  UnauthorizedException,
  Req,
  HttpCode,
  Query,
  Get,
  Patch,
} from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {  Public } from 'src/common/decorators/public.decorator';
import { AuthenticatedRequest } from 'src/common/types/express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register user',
    description: 'Registers a new user and sends welcome email',
  })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed or user exists' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

@Get('refresh')
@Public()
refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

  const newAccessToken = this.authService.refresh(refreshToken);

  res.cookie('access_token', newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: Number(process.env.JWT_REFRESH_EXPIRES_SECONDS) * 1000,
  });

  return { message: 'Token refreshed' };
}


  @Public()
  @Get('verify')
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Register user',
    // eslint-disable-next-line prettier/prettier
    description: 'Use an email that have been made and sends verification email',
  })
  @ApiResponse({ status: 200, description: 'A Verify link have been sent to your Email, please verify.' })
  @ApiResponse({ status: 404, description: 'Invalid verification token' })
  async verifyEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
      
    }
    const { access_token, refresh_token } = await this.authService.login(user);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false, // set to false if not using HTTPS during dev
      sameSite: 'strict',
      maxAge: Number(process.env.JWT_ACCESS_EXPIRES_SECONDS) * 1000, 
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: Number(process.env.JWT_REFRESH_EXPIRES_SECONDS) * 1000,
    });

    return {
    message: 'Login successful',
    data: {
      token: access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Clears the refresh token cookie and logs out user',
  })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid current password.' })
  async changePassword(
  @Body() dto: ChangePasswordDto,
  @Req() req: AuthenticatedRequest,
) {
  return this.authService.changePassword(req.user.id, dto);
}

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
  return this.authService.forgotPassword(dto.email);
}
  @Public()
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPassword(dto.token, dto.newPassword);
}

}
