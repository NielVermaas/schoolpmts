import { PrismaClient, InvoiceStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { PDFService } from './pdf.service';
import { EmailService } from './email.service';

const prisma = new PrismaClient();

export class InvoiceService {
  private pdfService: PDFService;
  private emailService: EmailService;

  constructor() {
    this.pdfService = new PDFService();
    this.emailService = new EmailService();
  }

  /**
   * Create a new invoice
   */
  async createInvoice(params: {
    schoolId: string;
    familyId: string;
    dueDate: Date;
    items: Array<{
      studentId?: string;
      type: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    paymentPlanId?: string;
    notes?: string;
  }) {
    try {
      // Calculate totals
      const subtotal = params.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);

      const tax = 0; // Configure tax if needed
      const total = subtotal + tax;

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(params.schoolId);

      // Create invoice with items
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          schoolId: params.schoolId,
          familyId: params.familyId,
          dueDate: params.dueDate,
          subtotal,
          tax,
          total,
          amountDue: total,
          status: 'DRAFT',
          paymentPlanId: params.paymentPlanId,
          isPaymentPlan: !!params.paymentPlanId,
          notes: params.notes,
          items: {
            create: params.items.map(item => ({
              studentId: item.studentId,
              type: item.type as any,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.quantity * item.unitPrice
            }))
          }
        },
        include: {
          items: {
            include: {
              student: true
            }
          },
          family: {
            include: {
              students: true
            }
          },
          school: true
        }
      });

      return invoice;
    } catch (error) {
      console.error('Invoice creation error:', error);
      throw new AppError('Failed to create invoice', 500);
    }
  }

  /**
   * Send invoice to family
   */
  async sendInvoice(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: {
          include: {
            student: true
          }
        },
        family: {
          include: {
            students: true
          }
        },
        school: true
      }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateInvoice(invoice);

    // Send email with PDF attachment
    await this.emailService.sendInvoiceEmail({
      to: invoice.family.email,
      bcc: invoice.family.billingEmails,
      invoice,
      pdfBuffer
    });

    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'SENT',
        sentAt: new Date()
      }
    });

    return { success: true };
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            student: true
          }
        },
        family: {
          include: {
            students: true
          }
        },
        school: true,
        payments: {
          where: {
            status: 'COMPLETED'
          },
          orderBy: {
            completedAt: 'desc'
          }
        }
      }
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return invoice;
  }

  /**
   * Get invoices for a family
   */
  async getFamilyInvoices(familyId: string, filters?: {
    status?: InvoiceStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.invoice.findMany({
      where: {
        familyId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          issueDate: { gte: filters.startDate }
        }),
        ...(filters?.endDate && {
          issueDate: { lte: filters.endDate }
        })
      },
      include: {
        items: true,
        payments: {
          where: { status: 'COMPLETED' }
        }
      },
      orderBy: { issueDate: 'desc' }
    });
  }

  /**
   * Get invoices for a school
   */
  async getSchoolInvoices(schoolId: string, filters?: {
    status?: InvoiceStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.invoice.findMany({
      where: {
        schoolId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          issueDate: { gte: filters.startDate }
        }),
        ...(filters?.endDate && {
          issueDate: { lte: filters.endDate }
        })
      },
      include: {
        family: true,
        items: true,
        payments: {
          where: { status: 'COMPLETED' }
        }
      },
      orderBy: { issueDate: 'desc' }
    });
  }

  /**
   * Update invoice
   */
  async updateInvoice(
    id: string,
    data: {
      dueDate?: Date;
      notes?: string;
      status?: InvoiceStatus;
    }
  ) {
    return prisma.invoice.update({
      where: { id },
      data,
      include: {
        items: true,
        family: true
      }
    });
  }

  /**
   * Mark overdue invoices
   */
  async markOverdueInvoices() {
    const now = new Date();

    const result = await prisma.invoice.updateMany({
      where: {
        dueDate: { lt: now },
        status: {
          in: ['SENT', 'PARTIALLY_PAID']
        },
        amountDue: { gt: 0 }
      },
      data: {
        status: 'OVERDUE'
      }
    });

    console.log(`Marked ${result.count} invoices as overdue`);
    return result;
  }

  /**
   * Generate invoice number
   */
  private async generateInvoiceNumber(schoolId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}`;

    // Get last invoice number for this school and year
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        schoolId,
        invoiceNumber: {
          startsWith: prefix
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(6, '0')}`;
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(schoolId: string, startDate: Date, endDate: Date) {
    const invoices = await prisma.invoice.findMany({
      where: {
        schoolId,
        issueDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const outstanding = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);

    const byStatus = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      count: invoices.length,
      total,
      paid,
      outstanding,
      byStatus
    };
  }
}
