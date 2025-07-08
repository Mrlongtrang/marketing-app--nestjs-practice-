import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const url = `http://localhost:3000/auth/verify?token=${token}`;
    await this.transporter.sendMail({
      from: `"Marketing App" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Verify your email',
      html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
    });
  }

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
  const url = `http://localhost:3000/auth/reset-password?token=${token}`;
  await this.transporter.sendMail({
    from: `"Marketing App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your password',
    html: `<p>Click <a href="${url}">here</a> to reset your password. The link will expire in 1 hour.</p>`,
  });
}

}
