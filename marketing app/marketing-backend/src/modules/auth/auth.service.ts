import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entity/user.entity';
import { randomBytes } from 'crypto';
import { MailService } from 'src/common/services/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  async verifyEmail(token: string): Promise<{ message: string }> {
    console.log('[VERIFY] Called with token:', token);
    const user = await this.userRepo.findOne({
      where: { verificationToken: token },
    });

    if (
      !user ||
      !user.verificationTokenExpires ||
      user.verificationTokenExpires < new Date()
    ) {
      throw new BadRequestException('Invalid verification token');
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await this.userRepo.save(user);
    return { message: 'Email verified successfully!' };
  }

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const { email, password } = dto;

    // Kiểm tra email đã tồn tại chưa
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email has already been registered');
    }

    const hash = await bcrypt.hash(password, 10);

    const verificationToken = randomBytes(32).toString('hex');
    const expiresHours = parseInt(
      process.env.EMAIL_VERIFICATION_EXPIRES_HOURS || '24',
      10,
    );
    const verificationTokenExpires = new Date(
      Date.now() + expiresHours * 60 * 60 * 1000,
    );

    const user = this.userRepo.create({
      email,
      password: hash,
      role: 'user',
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await this.userRepo.save(user);

    await this.mailService.sendVerificationEmail(email, verificationToken);

    return { message: 'User successfully registered' };
  }

  async validateUser(email: string,  password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
   // console.log('[LOGIN] Found user:', user);
     if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  //console.log('[LOGIN] Password match:', isMatch);

  if (!isMatch) return null;

  return user;
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: number }>(token);
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();

      return {
        access_token: this.jwtService.sign(
          { email: user.email, sub: user.id },
          { expiresIn: '15m' },
        ),
      };
    } catch (err) {
      console.error('Refresh token verification failed:', err);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async login(user: User) {
  const payload = {
    email: user.email,
    sub: user.id,
    role: user.role,
  };

  return {
    access_token: this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    }),
    refresh_token: this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    }),
  };
}


  async forgotPassword(email: string): Promise<{ message: string }> {
  return this.requestPasswordReset(email);
}

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    if (!email || email.trim() === '') {
      throw new BadRequestException('Email is required');
    }

    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiry

    user.resetPasswordToken = token;
    user.resetPasswordTokenExpires = expires;
    await this.userRepo.save(user);

    await this.mailService.sendResetPasswordEmail(user.email, token);

    return { message: 'Reset email sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const user = await this.userRepo.findOne({ where: { resetPasswordToken: token } });

  if (!user || !user.resetPasswordTokenExpires || user.resetPasswordTokenExpires < new Date()) {
    throw new BadRequestException('Reset token is invalid or has expired');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpires = null;

  await this.userRepo.save(user);

  return { message: 'Password has been reset successfully' };
}

  changePassword(dto: ChangePasswordDto): Promise<{ message: string }> {
    return Promise.resolve({
      message: `Password changed to: ${dto.newPassword}`,
    });
  }
}
