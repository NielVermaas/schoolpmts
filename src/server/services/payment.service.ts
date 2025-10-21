import { PrismaClient, PaymentMethod, PaymentStatus } from '@prisma/client';
import { NetcashService } from './netcash.service';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class PaymentService {
  private netcashService: NetcashService;

  constructor() {
    this.netcashService = new NetcashService();
  }

  /**
   * Create a payment request
   */
  async createPayment(params: {
    familyId: string;
    invoiceId?: string;
    amount: number;
    method: PaymentMethod;
    payerEmail: string;
    payerName: string;
  }) {
    try {
      // Generate payment reference
      const reference = this.generatePaymentReference();

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          paymentReference: reference,
          familyId: params.familyId,
          invoiceId: params.invoiceId,
          amount: params.amount,
          method: params.method,
          status: 'PENDING',
          payerEmail: params.payerEmail,
          payerName: params.payerName
        },
        include: {
          family: {
            include: {
              school: true
            }
          },
          invoice: true
        }
      });

      // Create Netcash payment request
      if (params.method !== 'MANUAL') {
        const netcashRequest = await this.netcashService.createPayment({
          amount: params.amount,
          reference: reference,
          email: params.payerEmail,
          method: params.method as 'CARD' | 'INSTANT_EFT' | 'QR_CODE' | 'DEBICHECK',
          returnUrl: `${process.env.FRONTEND_URL}/payment/success?ref=${reference}`,
          cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel?ref=${reference}`,
          notifyUrl: `${process.env.FRONTEND_URL}/api/payments/netcash/notify`
        });

        // Update payment with Netcash details
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            netcashRequestId: netcashRequest.requestId,
            netcashPaymentUrl: netcashRequest.paymentUrl,
            status: 'PROCESSING'
          }
        });

        return {
          payment,
          paymentUrl: netcashRequest.paymentUrl,
          qrCode: netcashRequest.qrCode
        };
      }

      return { payment };
    } catch (error) {
      console.error('Payment creation error:', error);
      throw new AppError('Failed to create payment', 500);
    }
  }

  /**
   * Handle Netcash payment notification
   */
  async handleNetcashNotification(data: {
    requestId: string;
    reference: string;
    amount: string;
    status: string;
    transactionId?: string;
  }) {
    try {
      // Verify payment with Netcash
      const isValid = await this.netcashService.verifyPayment(data);

      if (!isValid) {
        throw new AppError('Invalid payment notification', 400);
      }

      // Find payment
      const payment = await prisma.payment.findUnique({
        where: { paymentReference: data.reference },
        include: { invoice: true }
      });

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      // Update payment status
      const status: PaymentStatus = data.status === 'ACCEPTED' || data.status === 'PAID'
        ? 'COMPLETED'
        : 'FAILED';

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          netcashTransactionId: data.transactionId,
          completedAt: status === 'COMPLETED' ? new Date() : null,
          failureReason: status === 'FAILED' ? data.status : null
        }
      });

      // If payment is successful and linked to invoice, update invoice
      if (status === 'COMPLETED' && payment.invoiceId) {
        await this.updateInvoicePayment(payment.invoiceId, payment.amount);
      }

      return { success: true, status };
    } catch (error) {
      console.error('Netcash notification handling error:', error);
      throw error;
    }
  }

  /**
   * Update invoice with payment
   */
  private async updateInvoicePayment(invoiceId: string, amount: number) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    const newAmountPaid = invoice.amountPaid + amount;
    const newAmountDue = invoice.total - newAmountPaid;

    let status = invoice.status;
    if (newAmountDue === 0) {
      status = 'PAID';
    } else if (newAmountPaid > 0 && newAmountDue > 0) {
      status = 'PARTIALLY_PAID';
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        status
      }
    });
  }

  /**
   * Get payment by reference
   */
  async getPaymentByReference(reference: string) {
    const payment = await prisma.payment.findUnique({
      where: { paymentReference: reference },
      include: {
        family: {
          include: {
            school: true,
            students: true
          }
        },
        invoice: true
      }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    return payment;
  }

  /**
   * Get payments for a family
   */
  async getFamilyPayments(familyId: string, filters?: {
    status?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.payment.findMany({
      where: {
        familyId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          createdAt: { gte: filters.startDate }
        }),
        ...(filters?.endDate && {
          createdAt: { lte: filters.endDate }
        })
      },
      include: {
        invoice: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Process manual payment (e.g., cash, cheque)
   */
  async recordManualPayment(params: {
    familyId: string;
    invoiceId?: string;
    amount: number;
    payerName: string;
    notes?: string;
    recordedBy: string;
  }) {
    const reference = this.generatePaymentReference();

    const payment = await prisma.payment.create({
      data: {
        paymentReference: reference,
        familyId: params.familyId,
        invoiceId: params.invoiceId,
        amount: params.amount,
        method: 'MANUAL',
        status: 'COMPLETED',
        payerName: params.payerName,
        notes: params.notes,
        completedAt: new Date()
      }
    });

    // Update invoice if provided
    if (params.invoiceId) {
      await this.updateInvoicePayment(params.invoiceId, params.amount);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: params.recordedBy,
        action: 'MANUAL_PAYMENT_RECORDED',
        entity: 'Payment',
        entityId: payment.id,
        changes: params
      }
    });

    return payment;
  }

  /**
   * Generate unique payment reference
   */
  private generatePaymentReference(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `PAY${timestamp}${random}`;
  }

  /**
   * Get payment statistics for a school
   */
  async getSchoolPaymentStats(schoolId: string, startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: {
        family: { schoolId },
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const count = payments.length;
    const byMethod = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      count,
      average: count > 0 ? total / count : 0,
      byMethod
    };
  }
}
