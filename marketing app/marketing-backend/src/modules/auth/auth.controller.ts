import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenDto } from './dto/refresh-token.dto';



@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
   @ApiResponse({ status: 201, description: 'User successfully registered' })
   @ApiResponse({ status: 400, description: 'Validation failed or user exists' })
   register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.password);
  }

  

  @Post('refresh')
    refresh(@Body() dto: RefreshTokenDto) {
   return this.authService.refresh(dto.token);
    }


  @Post('login')
 @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid username or password' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.username, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
