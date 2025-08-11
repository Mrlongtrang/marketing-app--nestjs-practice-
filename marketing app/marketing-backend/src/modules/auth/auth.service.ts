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

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return user;
  }

  async validateRefreshToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      // Optional extra: check if token is still valid based on user record
      return user;
    } catch (err) {
      return null;
    }
  }

  async refresh(refreshToken: string): Promise<string> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const accessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_SECONDS),
        },
      );

      return accessToken;
    } catch (err) {
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
        expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_SECONDS),
        secret: process.env.JWT_SECRET,
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_SECONDS),
        secret: process.env.JWT_REFRESH_SECRET,
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
    user.resetPasswordToken = token;
    user.resetPasswordTokenExpires = new Date(Date.now() + 3600_000); // expires in 1 hour
    await this.userRepo.save(user);
    await this.mailService.sendResetPasswordEmail(user.email, token);
    return { message: 'Reset email sent' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { resetPasswordToken: token },
    });

    if (
      !user ||
      !user.resetPasswordTokenExpires ||
      user.resetPasswordTokenExpires < new Date()
    ) {
      throw new BadRequestException('Reset token is invalid or has expired');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;

    await this.userRepo.save(user);

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
  const user = await this.userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // 1. Verify old password
  const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
  if (!isMatch) {
    throw new BadRequestException('Old password is incorrect');
  }

  // 2. Hash new password
  const hashed = await bcrypt.hash(dto.newPassword, 10);

  // 3) prevent reusing the same password
  const isSame = await bcrypt.compare(dto.newPassword, user.password);
  if (isSame) throw new BadRequestException('New password must be different from the old password');


  // 4. Save new password
  user.password = hashed;
  await this.userRepo.save(user);

  return { message: 'Password changed successfully' };
}

}
