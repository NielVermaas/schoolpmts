import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  createPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { familyId, invoiceId, amount, method, payerEmail, payerName } = req.body;

      if (!familyId || !amount || !method || !payerEmail || !payerName) {
        throw new AppError('Missing required fields', 400);
      }

      const result = await this.paymentService.createPayment({
        familyId,
        invoiceId,
        amount,
        method,
        payerEmail,
        payerName
      });

      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  handleNetcashNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.paymentService.handleNetcashNotification(req.body);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getPaymentByReference = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reference } = req.params;
      const payment = await this.paymentService.getPaymentByReference(reference);

      res.json({
        status: 'success',
        data: { payment }
      });
    } catch (error) {
      next(error);
    }
  };

  getFamilyPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { familyId } = req.params;
      const { status, startDate, endDate } = req.query;

      const payments = await this.paymentService.getFamilyPayments(familyId, {
        status: status as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      res.json({
        status: 'success',
        data: { payments }
      });
    } catch (error) {
      next(error);
    }
  };

  recordManualPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { familyId, invoiceId, amount, payerName, notes } = req.body;

      if (!familyId || !amount || !payerName) {
        throw new AppError('Missing required fields', 400);
      }

      const payment = await this.paymentService.recordManualPayment({
        familyId,
        invoiceId,
        amount,
        payerName,
        notes,
        recordedBy: req.user!.id
      });

      res.status(201).json({
        status: 'success',
        data: { payment }
      });
    } catch (error) {
      next(error);
    }
  };

  getSchoolPaymentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schoolId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError('Start date and end date are required', 400);
      }

      const stats = await this.paymentService.getSchoolPaymentStats(
        schoolId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({
        status: 'success',
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  };
}
