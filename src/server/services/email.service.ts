import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import { AppError } from '../middleware/errorHandler';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  /**
   * Send invoice email with PDF attachment
   */
  async sendInvoiceEmail(params: {
    to: string;
    bcc?: string[];
    invoice: any;
    pdfBuffer: Buffer;
  }) {
    try {
      const { to, bcc, invoice, pdfBuffer } = params;

      const htmlContent = this.generateInvoiceEmailHTML(invoice);

      await this.transporter.sendMail({
        from: `${invoice.school.name} <${process.env.EMAIL_FROM}>`,
        to,
        bcc,
        subject: `Invoice ${invoice.invoiceNumber} - ${invoice.school.name}`,
        html: htmlContent,
        attachments: [
          {
            filename: `Invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      console.log(`Invoice email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send invoice email:', error);
      throw new AppError('Failed to send invoice email', 500);
    }
  }

  /**
   * Send statement email
   */
  async sendStatementEmail(params: {
    to: string;
    bcc?: string[];
    family: any;
    school: any;
    pdfBuffer: Buffer;
    period: { startDate: Date; endDate: Date };
  }) {
    try {
      const { to, bcc, family, school, pdfBuffer, period } = params;

      const htmlContent = this.generateStatementEmailHTML(family, school, period);

      await this.transporter.sendMail({
        from: `${school.name} <${process.env.EMAIL_FROM}>`,
        to,
        bcc,
        subject: `Account Statement - ${school.name}`,
        html: htmlContent,
        attachments: [
          {
            filename: `Statement-${format(period.startDate, 'yyyy-MM')}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      console.log(`Statement email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send statement email:', error);
      throw new AppError('Failed to send statement email', 500);
    }
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(params: {
    to: string;
    payment: any;
    invoice?: any;
  }) {
    try {
      const { to, payment, invoice } = params;

      const htmlContent = this.generatePaymentConfirmationHTML(payment, invoice);

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM!,
        to,
        subject: 'Payment Confirmation',
        html: htmlContent
      });

      console.log(`Payment confirmation sent to ${to}`);
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      // Don't throw error for confirmation emails
    }
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(params: {
    to: string;
    invoice: any;
    daysOverdue?: number;
  }) {
    try {
      const { to, invoice, daysOverdue } = params;

      const htmlContent = this.generatePaymentReminderHTML(invoice, daysOverdue);

      await this.transporter.sendMail({
        from: `${invoice.school.name} <${process.env.EMAIL_FROM}>`,
        to,
        subject: daysOverdue
          ? `Payment Overdue - Invoice ${invoice.invoiceNumber}`
          : `Payment Reminder - Invoice ${invoice.invoiceNumber}`,
        html: htmlContent
      });

      console.log(`Payment reminder sent to ${to}`);
    } catch (error) {
      console.error('Failed to send payment reminder:', error);
    }
  }

  /**
   * Generate invoice email HTML
   */
  private generateInvoiceEmailHTML(invoice: any): string {
    const primaryColor = invoice.school.primaryColor || '#1e40af';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${primaryColor}; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .invoice-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${invoice.school.name}</h1>
            </div>
            <div class="content">
              <h2>New Invoice</h2>
              <p>Dear ${invoice.family.primaryContact},</p>
              <p>Please find attached your invoice for school fees.</p>

              <div class="invoice-details">
                <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Invoice Date:</strong> ${format(new Date(invoice.issueDate), 'dd MMM yyyy')}</p>
                <p><strong>Due Date:</strong> ${format(new Date(invoice.dueDate), 'dd MMM yyyy')}</p>
                <p><strong>Amount Due:</strong> R ${(invoice.amountDue / 100).toFixed(2)}</p>
              </div>

              <p>You can make payment online by clicking the button below:</p>

              <a href="${process.env.FRONTEND_URL}/parent/invoices/${invoice.id}" class="button">
                View Invoice & Pay Online
              </a>

              <p>Thank you for your continued support.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>${invoice.school.name} | ${invoice.school.email}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate statement email HTML
   */
  private generateStatementEmailHTML(family: any, school: any, period: any): string {
    const primaryColor = school.primaryColor || '#1e40af';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${primaryColor}; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${school.name}</h1>
            </div>
            <div class="content">
              <h2>Account Statement</h2>
              <p>Dear ${family.primaryContact},</p>
              <p>Please find attached your account statement for the period ${format(period.startDate, 'dd MMM yyyy')} to ${format(period.endDate, 'dd MMM yyyy')}.</p>

              <a href="${process.env.FRONTEND_URL}/parent/statements" class="button">
                View Full Statement Online
              </a>

              <p>If you have any questions about your account, please contact us.</p>
            </div>
            <div class="footer">
              <p>${school.name} | ${school.email}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate payment confirmation HTML
   */
  private generatePaymentConfirmationHTML(payment: any, invoice: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .payment-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Payment Confirmed</h1>
            </div>
            <div class="content">
              <p>Dear ${payment.payerName},</p>
              <p>Thank you! Your payment has been successfully processed.</p>

              <div class="payment-details">
                <p><strong>Payment Reference:</strong> ${payment.paymentReference}</p>
                <p><strong>Amount:</strong> R ${(payment.amount / 100).toFixed(2)}</p>
                <p><strong>Date:</strong> ${format(new Date(payment.completedAt), 'dd MMM yyyy HH:mm')}</p>
                ${invoice ? `<p><strong>Invoice:</strong> ${invoice.invoiceNumber}</p>` : ''}
              </div>

              <p>A receipt has been generated and is available in your parent portal.</p>
            </div>
            <div class="footer">
              <p>This is an automated confirmation email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate payment reminder HTML
   */
  private generatePaymentReminderHTML(invoice: any, daysOverdue?: number): string {
    const primaryColor = invoice.school.primaryColor || '#1e40af';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${daysOverdue ? '#dc2626' : primaryColor}; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .invoice-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${daysOverdue ? 'Payment Overdue' : 'Payment Reminder'}</h1>
            </div>
            <div class="content">
              <p>Dear ${invoice.family.primaryContact},</p>
              <p>${daysOverdue
                ? `Your payment is ${daysOverdue} days overdue.`
                : 'This is a friendly reminder that your payment is due soon.'
              }</p>

              <div class="invoice-details">
                <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Due Date:</strong> ${format(new Date(invoice.dueDate), 'dd MMM yyyy')}</p>
                <p><strong>Amount Due:</strong> R ${(invoice.amountDue / 100).toFixed(2)}</p>
              </div>

              <p>Please make payment as soon as possible to avoid any late fees.</p>

              <a href="${process.env.FRONTEND_URL}/parent/invoices/${invoice.id}" class="button">
                Pay Now
              </a>
            </div>
            <div class="footer">
              <p>${invoice.school.name} | ${invoice.school.email}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
