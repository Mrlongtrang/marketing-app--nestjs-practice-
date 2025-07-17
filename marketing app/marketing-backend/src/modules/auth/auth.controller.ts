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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register user',
    description: 'Registers a new user and sends welcome email',
  })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed or user exists' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.username,
      dto.password,
      dto.email ?? null,
    );
  }

  @Get('verify')
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Register user',
    // eslint-disable-next-line prettier/prettier
    description: 'Use an email that have been made and sends verification email',
  })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 404, description: 'Invalid verification token' })
  async verifyEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    return this.authService.verifyEmail(token);
  }

  @Get('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates new access token from refresh token cookie',
  })
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies as { refresh_token?: string })
      ?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException();

    const access_token = this.authService.refresh(refreshToken);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Token refreshed' };
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      dto.username,
      dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { access_token, refresh_token } = this.authService.login(user);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false, // set to false if not using HTTPS during dev
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Login successful' };
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
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email resent.' })
  // eslint-disable-next-line prettier/prettier
  @ApiResponse({ status: 404, description: 'User not found or already verified.' })
  resendVerification(): void {
    // TODO: implement later
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  forgotPassword(): void {
    // TODO: implement later
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid current password.' })
  changePassword(@Body() dto: ChangePasswordDto): Promise<{ message: string }> {
    return this.authService.changePassword(dto);
  }
}
