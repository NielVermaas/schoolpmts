import { PrismaClient, PayoutStatus } from '@prisma/client';
import { addDays, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

export class PayoutService {
  /**
   * Process scheduled payouts
   */
  async processScheduledPayouts() {
    try {
      console.log('Processing scheduled payouts...');

      const now = new Date();

      // Get all pending payouts that are due
      const duepayouts = await prisma.payout.findMany({
        where: {
          status: 'PENDING',
          scheduledDate: {
            lte: now
          }
        },
        include: {
          school: true
        }
      });

      console.log(`Found ${duepayouts.length} payouts to process`);

      for (const payout of duepayouts) {
        try {
          await this.processPayout(payout.id);
        } catch (error) {
          console.error(`Failed to process payout ${payout.id}:`, error);

          // Mark as failed
          await prisma.payout.update({
            where: { id: payout.id },
            data: {
              status: 'FAILED',
              failureReason: error instanceof Error ? error.message : 'Unknown error'
            }
          });
        }
      }

      console.log('Scheduled payout processing complete');
    } catch (error) {
      console.error('Scheduled payout processing error:', error);
      throw error;
    }
  }

  /**
   * Create payout for a school
   */
  async createPayout(schoolId: string, scheduledDate: Date) {
    try {
      // Get the last payout date for this school
      const lastPayout = await prisma.payout.findFirst({
        where: { schoolId },
        orderBy: { createdAt: 'desc' }
      });

      const startDate = lastPayout
        ? new Date(lastPayout.createdAt)
        : addDays(new Date(), -30);

      const endDate = new Date();

      // Get all completed and reconciled payments since last payout
      const payments = await prisma.payment.findMany({
        where: {
          family: { schoolId },
          status: 'COMPLETED',
          reconciled: true,
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          // Ensure payment isn't already included in another payout
          NOT: {
            id: {
              in: await this.getPaymentsInPayouts(schoolId)
            }
          }
        }
      });

      if (payments.length === 0) {
        console.log(`No payments to payout for school ${schoolId}`);
        return null;
      }

      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const paymentIds = payments.map(p => p.id);

      // Create payout
      const payout = await prisma.payout.create({
        data: {
          schoolId,
          amount: totalAmount,
          scheduledDate,
          status: 'PENDING',
          paymentIds
        },
        include: {
          school: true
        }
      });

      console.log(`Created payout ${payout.id} for school ${schoolId}: R${(totalAmount / 100).toFixed(2)}`);

      return payout;
    } catch (error) {
      console.error('Payout creation error:', error);
      throw error;
    }
  }

  /**
   * Process a payout
   */
  async processPayout(payoutId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: { school: true }
    });

    if (!payout) {
      throw new Error('Payout not found');
    }

    if (payout.status !== 'PENDING') {
      throw new Error('Payout is not pending');
    }

    // Update status to processing
    await prisma.payout.update({
      where: { id: payoutId },
      data: { status: 'PROCESSING' }
    });

    try {
      // In production, integrate with bank API or payment gateway
      // For now, we'll simulate the payout
      const transactionId = this.generateTransactionId();

      // Update payout as completed
      await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'COMPLETED',
          completedDate: new Date(),
          transactionId,
          bankReference: `PAYOUT-${payout.school.name.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`
        }
      });

      console.log(`Payout ${payoutId} completed: ${transactionId}`);

      return { success: true, transactionId };
    } catch (error) {
      // Mark as failed
      await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'FAILED',
          failureReason: error instanceof Error ? error.message : 'Processing failed'
        }
      });

      throw error;
    }
  }

  /**
   * Get payouts for a school
   */
  async getSchoolPayouts(schoolId: string, filters?: {
    status?: PayoutStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.payout.findMany({
      where: {
        schoolId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          scheduledDate: { gte: filters.startDate }
        }),
        ...(filters?.endDate && {
          scheduledDate: { lte: filters.endDate }
        })
      },
      orderBy: { scheduledDate: 'desc' }
    });
  }

  /**
   * Get payout by ID
   */
  async getPayoutById(payoutId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        school: true
      }
    });

    if (!payout) {
      throw new Error('Payout not found');
    }

    // Get payment details
    const payments = await prisma.payment.findMany({
      where: {
        id: {
          in: payout.paymentIds
        }
      },
      include: {
        family: true,
        invoice: true
      }
    });

    return {
      ...payout,
      payments
    };
  }

  /**
   * Cancel a payout
   */
  async cancelPayout(payoutId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId }
    });

    if (!payout) {
      throw new Error('Payout not found');
    }

    if (payout.status !== 'PENDING') {
      throw new Error('Can only cancel pending payouts');
    }

    await prisma.payout.delete({
      where: { id: payoutId }
    });

    return { success: true };
  }

  /**
   * Get payout statistics
   */
  async getPayoutStats(schoolId: string, startDate: Date, endDate: Date) {
    const payouts = await prisma.payout.findMany({
      where: {
        schoolId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const total = payouts.length;
    const completed = payouts.filter(p => p.status === 'COMPLETED').length;
    const pending = payouts.filter(p => p.status === 'PENDING').length;
    const processing = payouts.filter(p => p.status === 'PROCESSING').length;
    const failed = payouts.filter(p => p.status === 'FAILED').length;

    const totalAmount = payouts
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      total,
      completed,
      pending,
      processing,
      failed,
      totalAmount
    };
  }

  /**
   * Helper: Get payment IDs already included in payouts
   */
  private async getPaymentsInPayouts(schoolId: string): Promise<string[]> {
    const payouts = await prisma.payout.findMany({
      where: {
        schoolId,
        status: {
          in: ['PENDING', 'PROCESSING', 'COMPLETED']
        }
      },
      select: {
        paymentIds: true
      }
    });

    return payouts.flatMap(p => p.paymentIds);
  }

  /**
   * Generate transaction ID
   */
  private generateTransactionId(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  }

  /**
   * Schedule automatic payouts for all schools
   */
  async scheduleMonthlyPayouts() {
    try {
      const schools = await prisma.school.findMany({
        where: { active: true }
      });

      // Schedule payout for first day of next month
      const scheduledDate = startOfDay(addDays(new Date(), 7)); // 7 days from now

      for (const school of schools) {
        try {
          await this.createPayout(school.id, scheduledDate);
        } catch (error) {
          console.error(`Failed to schedule payout for school ${school.id}:`, error);
        }
      }

      console.log(`Scheduled payouts for ${schools.length} schools`);
    } catch (error) {
      console.error('Payout scheduling error:', error);
      throw error;
    }
  }
}
