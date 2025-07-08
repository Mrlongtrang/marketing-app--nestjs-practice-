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
import { User } from '../user/user.entity';
import { randomBytes } from 'crypto';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  async verifyEmail(token: string): Promise<{ message: string }> {
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

  async register(
    username: string,
    password: string,
    email?: string,
  ): Promise<User> {
    const safeEmail = email ?? ''; // or null

    const hash = await bcrypt.hash(password, 10);
    const verificationToken = randomBytes(32).toString('hex'); // generate token
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 1);
    const user = this.userRepo.create({
      username,
      password: hash,
      email: safeEmail,
      isVerified: false, //  mark unverified
      verificationToken,
      verificationTokenExpires,
    });

    const savedUser = await this.userRepo.save(user);
    // send verification email (optional - implement mailer later)
    await this.mailService.sendVerificationEmail(safeEmail, verificationToken);
    return savedUser;
  }
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: number }>(token);
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();

      return {
        access_token: this.jwtService.sign(
          { username: user.username, sub: user.id },
          { expiresIn: '15m' },
        ),
      };
    } catch (err) {
      console.error('Refresh token verification failed:', err);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  login(user: User) {
    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
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
}
