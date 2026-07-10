import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

export interface CompanyInquiryEmail {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly enabled: boolean;
  private readonly companyEmail: string;
  private readonly mailFrom: string;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<string>('EMAIL_ENABLED', 'true') !== 'false';
    this.companyEmail = this.configService.get<string>('EMAIL_TO', 'Lexlucglobalservices@gmail.com');
    this.mailFrom = this.configService.get<string>('EMAIL_FROM', 'LexLuc Global Services <Lexlucglobalservices@gmail.com>');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
      port: Number(this.configService.get<number>('EMAIL_PORT', 587)),
      secure: this.configService.get<string>('EMAIL_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendCompanyInquiryNotification(data: CompanyInquiryEmail) {
    if (!this.enabled) {
      this.logger.warn('Email notifications disabled. Skipping company inquiry email.');
      return;
    }

    this.ensureConfigured();

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #2563eb; margin-top: 0;">New Website Inquiry</h2>
        <p>A new inquiry was submitted through the LexLuc Global website.</p>
        <table style="width: 100%; max-width: 600px; border-collapse: collapse;">
          <tbody>
            ${this.emailRow('Full Name', data.fullName)}
            ${this.emailRow('Email', data.email)}
            ${this.emailRow('Phone Number', data.phone || 'Not provided')}
            ${this.emailRow('Company', data.company || 'Not provided')}
            ${this.emailRow('Subject', data.subject)}
            ${this.emailRow('Date Submitted', data.submittedAt.toLocaleString())}
          </tbody>
        </table>
        <h3 style="margin-top: 24px;">Message</h3>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${this.escapeHtml(data.message)}</div>
      </div>
    `;

    await this.sendWithRetry({
      from: this.mailFrom,
      to: this.companyEmail,
      subject: `New Website Inquiry - ${data.subject}`,
      html,
    });
  }

  async sendCustomerConfirmation(data: Pick<CompanyInquiryEmail, 'email' | 'fullName' | 'subject'>) {
    if (!this.enabled) {
      this.logger.warn('Email notifications disabled. Skipping customer confirmation email.');
      return;
    }

    this.ensureConfigured();

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.7;">
        <h2 style="color: #2563eb; margin-top: 0;">Thank You for Contacting LexLuc Global</h2>
        <p>Hello ${this.escapeHtml(data.fullName)},</p>
        <p>Thank you for reaching out to LexLuc Global Services.</p>
        <p>We have received your inquiry${data.subject ? ` about "${this.escapeHtml(data.subject)}"` : ''} and a member of our team will respond shortly.</p>
        <p>Best Regards,<br />LexLuc Global Services</p>
      </div>
    `;

    await this.sendWithRetry({
      from: this.mailFrom,
      to: data.email,
      subject: 'Thank You for Contacting LexLuc Global',
      html,
    });
  }

  private ensureConfigured() {
    if (!this.configService.get<string>('EMAIL_USER') || !this.configService.get<string>('EMAIL_PASS')) {
      throw new Error('Email service is enabled but EMAIL_USER or EMAIL_PASS is not configured.');
    }
  }

  private async sendWithRetry(mail: { from: string; to: string; subject: string; html: string }) {
    const maxAttempts = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.transporter.sendMail(mail);
        this.logger.log(`Email sent to ${mail.to}`);
        return;
      } catch (error) {
        lastError = error;
        this.logger.error(`Email send attempt ${attempt} failed for ${mail.to}`, error instanceof Error ? error.stack : error);
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  }

  private emailRow(label: string, value: string) {
    return `
      <tr>
        <td style="padding: 8px 0; font-weight: 700; width: 180px;">${this.escapeHtml(label)}</td>
        <td style="padding: 8px 0;">${this.escapeHtml(value)}</td>
      </tr>
    `;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
