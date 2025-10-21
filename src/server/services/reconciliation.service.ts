import { PrismaClient, PaymentStatus } from '@prisma/client';
import { NetcashService } from './netcash.service';

const prisma = new PrismaClient();

export class ReconciliationService {
  private netcashService: NetcashService;

  constructor() {
    this.netcashService = new NetcashService();
  }

  /**
   * Auto-reconcile pending payments
   */
  async autoReconcile() {
    try {
      console.log('Starting auto-reconciliation...');

      // Get all pending/processing payments older than 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      const pendingPayments = await prisma.payment.findMany({
        where: {
          status: {
            in: ['PENDING', 'PROCESSING']
          },
          createdAt: {
            lt: tenMinutesAgo
          },
          netcashRequestId: {
            not: null
          }
        }
      });

      console.log(`Found ${pendingPayments.length} payments to reconcile`);

      let reconciledCount = 0;
      let failedCount = 0;

      for (const payment of pendingPayments) {
        try {
          // Query Netcash for payment status
          const status = await this.netcashService.queryPaymentStatus(
            payment.netcashRequestId!
          );

          let newStatus: PaymentStatus = payment.status;

          if (status.status === 'COMPLETED') {
            newStatus = 'COMPLETED';
            await this.markPaymentComplete(payment.id);
            reconciledCount++;
          } else if (status.status === 'FAILED' || status.status === 'CANCELLED') {
            newStatus = 'FAILED';
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: newStatus,
                failureReason: `Auto-reconciled: ${status.status}`
              }
            });
            failedCount++;
          }

          // Mark as reconciled if status changed
          if (newStatus !== payment.status) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                reconciled: true,
                reconciledAt: new Date()
              }
            });
          }
        } catch (error) {
          console.error(`Failed to reconcile payment ${payment.id}:`, error);
        }
      }

      console.log(`Auto-reconciliation complete: ${reconciledCount} completed, ${failedCount} failed`);

      return {
        processed: pendingPayments.length,
        reconciled: reconciledCount,
        failed: failedCount
      };
    } catch (error) {
      console.error('Auto-reconciliation error:', error);
      throw error;
    }
  }

  /**
   * Mark payment as complete and update related invoice
   */
  private async markPaymentComplete(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true }
    });

    if (!payment) return;

    // Update payment
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        reconciled: true,
        reconciledAt: new Date()
      }
    });

    // Update invoice if linked
    if (payment.invoiceId && payment.invoice) {
      const newAmountPaid = payment.invoice.amountPaid + payment.amount;
      const newAmountDue = payment.invoice.total - newAmountPaid;

      let status = payment.invoice.status;
      if (newAmountDue === 0) {
        status = 'PAID';
      } else if (newAmountPaid > 0 && newAmountDue > 0) {
        status = 'PARTIALLY_PAID';
      }

      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status
        }
      });
    }
  }

  /**
   * Manual reconciliation
   */
  async manualReconcile(paymentId: string, reconciledBy: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    await this.markPaymentComplete(paymentId);

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        reconciledBy
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: reconciledBy,
        action: 'MANUAL_RECONCILIATION',
        entity: 'Payment',
        entityId: paymentId,
        changes: { paymentId }
      }
    });

    return { success: true };
  }

  /**
   * Get reconciliation report
   */
  async getReconciliationReport(schoolId: string, startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: {
        family: { schoolId },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        invoice: true,
        family: true
      }
    });

    const total = payments.length;
    const reconciled = payments.filter(p => p.reconciled).length;
    const unreconciled = total - reconciled;
    const completed = payments.filter(p => p.status === 'COMPLETED').length;
    const pending = payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').length;
    const failed = payments.filter(p => p.status === 'FAILED').length;

    const totalAmount = payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      summary: {
        total,
        reconciled,
        unreconciled,
        completed,
        pending,
        failed,
        totalAmount
      },
      payments: payments.map(p => ({
        id: p.id,
        reference: p.paymentReference,
        amount: p.amount,
        status: p.status,
        reconciled: p.reconciled,
        reconciledAt: p.reconciledAt,
        family: p.family.primaryContact,
        invoice: p.invoice?.invoiceNumber,
        createdAt: p.createdAt
      }))
    };
  }
}
