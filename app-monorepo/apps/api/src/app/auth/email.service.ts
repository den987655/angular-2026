import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        'SMTP не настроен. Письма будут выводиться в консоль. Задайте SMTP_HOST, SMTP_USER, SMTP_PASS.'
      );
    }
  }

  async sendConfirmation(to: string, confirmLink: string): Promise<void> {
    const html = `
      <h2>Подтверждение регистрации TgLab</h2>
      <p>Перейдите по ссылке для подтверждения email:</p>
      <p><a href="${confirmLink}">${confirmLink}</a></p>
      <p>Если вы не регистрировались — проигнорируйте письмо.</p>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@tglab.local',
        to,
        subject: 'Подтверждение регистрации TgLab',
        html,
      });
    } else {
      this.logger.log(`[DEMO] Письмо для ${to}:`);
      this.logger.log(`Ссылка подтверждения: ${confirmLink}`);
    }
  }
}
