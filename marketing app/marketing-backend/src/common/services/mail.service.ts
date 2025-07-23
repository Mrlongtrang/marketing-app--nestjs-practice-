import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.getOrThrow<string>('EMAIL_HOST');
    const port = parseInt(
      this.configService.get<string>('EMAIL_PORT') ?? '587',
      10,
    );
    const user = this.configService.getOrThrow<string>('EMAIL_USER');
    const pass = this.configService.getOrThrow<string>('EMAIL_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const url = `http://localhost:3000/auth/verify?token=${token}`;
    const from = `"Marketing App" <${this.configService.get<string>('EMAIL_USER')}>`;

    await this.transporter.sendMail({
      from,
      to,
      subject: 'Verify your email',
      html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
    });
  }

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const url = `http://localhost:3000/auth/reset-password?token=${token}`;
    const from = `"Marketing App" <${this.configService.get<string>('EMAIL_USER')}>`;

    await this.transporter.sendMail({
      from,
      to,
      subject: 'Reset your password',
      html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
    });
  }
}
