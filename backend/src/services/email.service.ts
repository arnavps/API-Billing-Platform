import nodemailer from 'nodemailer';
import { IInvoice } from '../models/Invoice';
import { IUser } from '../models/User';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  /**
   * Sends an invoice to the user with the PDF attached.
   */
  static async sendInvoice(user: IUser, invoice: IInvoice, pdfBuffer: Buffer) {
    const mailOptions = {
      from: '"MeterFlow Billing" <billing@meterflow.com>',
      to: user.email,
      subject: `Invoice ${invoice.invoiceNumber} from MeterFlow`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h1 style="color: #0F172A;">MeterFlow</h1>
          <hr />
          <h2>Hello ${user.firstName},</h2>
          <p>Your invoice for the period ${new Date(invoice.period.start).toLocaleDateString()} - ${new Date(invoice.period.end).toLocaleDateString()} is now available.</p>
          <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #64748B;">Amount Due</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #0F172A;">$${(invoice.total / 100).toFixed(2)}</p>
          </div>
          <p>You can view and pay this invoice directly in your MeterFlow dashboard.</p>
          <a href="${process.env.FRONTEND_URL}/billing/invoices" style="display: inline-block; background: #0F172A; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">View Invoice</a>
          <p style="margin-top: 30px; font-size: 12px; color: #94A3B8;">Thank you for your business!</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    return this.transporter.sendMail(mailOptions);
  }

  /**
   * Sends a notification when a payment succeeds.
   */
  static async sendPaymentSuccess(user: IUser, invoice: IInvoice) {
    const mailOptions = {
      from: '"MeterFlow Billing" <billing@meterflow.com>',
      to: user.email,
      subject: `Payment Success: Invoice ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px;">
          <h1 style="color: #10B981;">Payment Successful</h1>
          <p>Hi ${user.firstName},</p>
          <p>We've successfully processed your payment for invoice <strong>${invoice.invoiceNumber}</strong>.</p>
          <p>Amount Paid: <strong>$${(invoice.total / 100).toFixed(2)}</strong></p>
          <p>Thank you for your continued support!</p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  /**
   * Sends a notification when a payment fails.
   */
  static async sendPaymentFailed(user: IUser, invoice: IInvoice) {
    const mailOptions = {
      from: '"MeterFlow Billing" <billing@meterflow.com>',
      to: user.email,
      subject: `Urgent: Payment Failed for Invoice ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px;">
          <h1 style="color: #EF4444;">Payment Failed</h1>
          <p>Hi ${user.firstName},</p>
          <p>Unfortunately, your payment for invoice <strong>${invoice.invoiceNumber}</strong> ($${(invoice.total / 100).toFixed(2)}) could not be processed.</p>
          <p>Please update your payment method in the dashboard to avoid any service interruption.</p>
          <a href="${process.env.FRONTEND_URL}/billing/payment-methods" style="display: inline-block; background: #EF4444; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Update Payment Method</a>
        </div>
      `,
    };
    return this.transporter.sendMail(mailOptions);
  }

  /**
   * Sends a payment reminder email.
   */
  static async sendPaymentReminder(user: IUser, invoice: IInvoice) {
    const mailOptions = {
      from: '"MeterFlow Billing" <billing@meterflow.com>',
      to: user.email,
      subject: `Reminder: Payment Due for Invoice ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px;">
          <h1>Payment Reminder</h1>
          <p>Hi ${user.firstName},</p>
          <p>This is a friendly reminder that invoice <strong>${invoice.invoiceNumber}</strong> ($${(invoice.total / 100).toFixed(2)}) is due soon on ${new Date(invoice.dueDate).toLocaleDateString()}.</p>
          <p>Please ensure you have a valid payment method on file to avoid any service interruption.</p>
          <a href="${process.env.FRONTEND_URL}/billing/invoices" style="display: inline-block; background: #0F172A; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Pay Invoice</a>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  /**
   * Sends a referral invitation email.
   */
  static async sendReferralInvite(referrer: IUser, targetEmail: string, referralCode: string) {
    const inviteLink = `${process.env.FRONTEND_URL}/register?ref=${referralCode}`;
    const mailOptions = {
      from: '"MeterFlow" <no-reply@meterflow.com>',
      to: targetEmail,
      subject: `${referrer.firstName} invited you to join MeterFlow`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h1 style="color: #0F172A; margin-bottom: 24px;">MeterFlow</h1>
          <p style="font-size: 16px; line-height: 1.5;">Hi there!</p>
          <p style="font-size: 16px; line-height: 1.5;"><strong>${referrer.firstName} ${referrer.lastName}</strong> is using MeterFlow to manage their API usage and billing, and they think you'd love it too.</p>
          
          <div style="background: #F8FAFC; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748B; font-weight: bold; uppercase; tracking-wider;">Your Welcome Bonus</p>
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #10B981;">200 Credits ($2.00)</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748B;">When you sign up using the link below</p>
          </div>

          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">MeterFlow is the usage-based billing platform for modern API companies. Scale with confidence, manage quotas, and automate your revenue.</p>
          
          <a href="${inviteLink}" style="display: inline-block; background: #0F172A; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; text-align: center; width: 100%; box-sizing: border-box;">Accept Invitation</a>
          
          <p style="margin-top: 32px; font-size: 12px; color: #94A3B8; text-align: center;">
            You received this because ${referrer.email} invited you. <br />
            © 2026 MeterFlow Inc. All rights reserved.
          </p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  /**
   * Generic send method for notifications and other simple emails.
   */
  static async send(to: string, subject: string, data: any) {
    const mailOptions = {
      from: '"MeterFlow" <no-reply@meterflow.com>',
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px;">
          <h2>${data.notification?.title || subject}</h2>
          <p>${data.notification?.message || ''}</p>
          ${data.notification?.actionUrl ? `
            <a href="${process.env.FRONTEND_URL}${data.notification.actionUrl}" style="display: inline-block; background: #0F172A; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              ${data.notification.actionText || 'View Details'}
            </a>
          ` : ''}
          <p style="margin-top: 30px; font-size: 12px; color: #94A3B8;">This is an automated notification from MeterFlow.</p>
        </div>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
