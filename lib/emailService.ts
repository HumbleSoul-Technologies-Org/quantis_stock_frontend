import { Resend } from 'resend';

interface EmailConfig {
  provider: 'sendgrid' | 'resend' | 'console';
  apiKey?: string;
  fromEmail: string;
  fromName: string;
}

interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(message);
        case 'resend':
          return await this.sendWithResend(message);
        case 'console':
        default:
          return await this.sendToConsole(message);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  private async sendWithSendGrid(message: EmailMessage): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: Array.isArray(message.to) ? message.to.map(email => ({ email })) : [{ email: message.to }],
        }],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        subject: message.subject,
        content: [
          {
            type: 'text/html',
            value: message.html,
          },
        ],
      }),
    });

    return response.ok;
  }

  private async sendWithResend(message: EmailMessage): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error('Resend API key not configured');
    }

    try {
      const resend = new Resend(this.config.apiKey);
      const { error } = await resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      });

      if (error) {
        console.error('Resend error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Resend exception:', error);
      return false;
    }
  }

  private async sendToConsole(message: EmailMessage): Promise<boolean> {
    console.log('=== EMAIL NOTIFICATION ===');
    console.log(`To: ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`);
    console.log(`Subject: ${message.subject}`);
    console.log(`HTML: ${message.html}`);
    console.log('===========================');
    return true;
  }

  // Maintenance-specific email templates
  async sendMaintenanceStartNotification(subscribers: string[]): Promise<boolean> {
    const subject = 'StockOS - Maintenance Started';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Maintenance Started</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">StockOS Maintenance Started</h1>
            <p>Dear StockOS User,</p>
            <p>We're currently performing scheduled maintenance on our system to bring you improved features and better performance.</p>
            <p><strong>Expected Duration:</strong> 2-4 hours</p>
            <p><strong>What we're doing:</strong></p>
            <ul>
              <li>System updates and improvements</li>
              <li>Performance optimizations</li>
              <li>Security enhancements</li>
              <li>Bug fixes</li>
            </ul>
            <p>You'll receive another notification when maintenance is complete and the system is back online.</p>
            <p>Thank you for your patience!</p>
            <p>Best regards,<br>The StockOS Team</p>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: subscribers,
      subject,
      html,
    });
  }

  async sendMaintenanceCompleteNotification(subscribers: string[]): Promise<boolean> {
    const subject = 'StockOS - Maintenance Complete - System Back Online';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Maintenance Complete</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #059669;">StockOS is Back Online!</h1>
            <p>Dear StockOS User,</p>
            <p>Great news! Our scheduled maintenance has been completed successfully and StockOS is now back online.</p>
            <p><strong>What we accomplished:</strong></p>
            <ul>
              <li>✅ System updates completed</li>
              <li>✅ Performance improvements implemented</li>
              <li>✅ Security enhancements applied</li>
              <li>✅ Bug fixes deployed</li>
            </ul>
            <p>You can now access StockOS at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com'}" style="color: #2563eb;">your dashboard</a>.</p>
            <p>Thank you for your patience during the maintenance period!</p>
            <p>Best regards,<br>The StockOS Team</p>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: subscribers,
      subject,
      html,
    });
  }
}

// Create email service instance
const emailConfig: EmailConfig = {
  provider: (process.env.EMAIL_PROVIDER as EmailConfig['provider']) || 'resend',
  apiKey: process.env.EMAIL_API_KEY,
  fromEmail: process.env.EMAIL_FROM || 'noreply@stockos.com',
  fromName: process.env.EMAIL_FROM_NAME || 'StockOS',
};

export const emailService = new EmailService(emailConfig);
export type { EmailMessage, EmailConfig };