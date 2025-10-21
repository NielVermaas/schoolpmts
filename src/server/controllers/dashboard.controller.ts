import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

export class DashboardController {
  getSchoolDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { schoolId } = req.params;
      const thirtyDaysAgo = subDays(new Date(), 30);

      // Get summary statistics
      const [totalFamilies, totalStudents, totalInvoices, totalPayments] = await Promise.all([
        prisma.family.count({ where: { schoolId } }),
        prisma.student.count({
          where: { family: { schoolId } }
        }),
        prisma.invoice.count({ where: { schoolId } }),
        prisma.payment.count({
          where: {
            family: { schoolId },
            status: 'COMPLETED'
          }
        })
      ]);

      // Get financial summary
      const invoices = await prisma.invoice.findMany({
        where: { schoolId }
      });

      const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
      const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);

      // Recent activity
      const recentInvoices = await prisma.invoice.findMany({
        where: {
          schoolId,
          createdAt: { gte: thirtyDaysAgo }
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          family: true
        }
      });

      const recentPayments = await prisma.payment.findMany({
        where: {
          family: { schoolId },
          createdAt: { gte: thirtyDaysAgo },
          status: 'COMPLETED'
        },
        take: 10,
        orderBy: { completedAt: 'desc' },
        include: {
          family: true,
          invoice: true
        }
      });

      res.json({
        status: 'success',
        data: {
          summary: {
            totalFamilies,
            totalStudents,
            totalInvoices,
            totalPayments,
            totalInvoiced,
            totalPaid,
            totalOutstanding
          },
          recentInvoices,
          recentPayments
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getParentDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { familyId } = req.params;

      // Get family details with students
      const family = await prisma.family.findUnique({
        where: { id: familyId },
        include: {
          students: true,
          school: true
        }
      });

      // Get invoices
      const invoices = await prisma.invoice.findMany({
        where: { familyId },
        include: {
          items: true,
          payments: {
            where: { status: 'COMPLETED' }
          }
        },
        orderBy: { issueDate: 'desc' }
      });

      // Get payments
      const payments = await prisma.payment.findMany({
        where: {
          familyId,
          status: 'COMPLETED'
        },
        include: {
          invoice: true
        },
        orderBy: { completedAt: 'desc' },
        take: 10
      });

      // Calculate summary
      const totalOwed = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
      const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
      const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE').length;

      res.json({
        status: 'success',
        data: {
          family,
          summary: {
            totalOwed,
            totalPaid,
            overdueInvoices,
            totalInvoices: invoices.length
          },
          invoices,
          payments
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
