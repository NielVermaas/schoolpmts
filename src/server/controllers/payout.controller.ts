import { Response, NextFunction } from 'express';
import { PayoutService } from '../services/payout.service';
import { AuthRequest } from '../middleware/auth';

export class PayoutController {
  private payoutService: PayoutService;

  constructor() {
    this.payoutService = new PayoutService();
  }

  createPayout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { scheduledDate } = req.body;
      const payout = await this.payoutService.createPayout(
        req.params.schoolId,
        new Date(scheduledDate)
      );

      res.status(201).json({
        status: 'success',
        data: { payout }
      });
    } catch (error) {
      next(error);
    }
  };

  getSchoolPayouts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const payouts = await this.payoutService.getSchoolPayouts(req.params.schoolId);

      res.json({
        status: 'success',
        data: { payouts }
      });
    } catch (error) {
      next(error);
    }
  };

  getPayoutById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const payout = await this.payoutService.getPayoutById(req.params.id);

      res.json({
        status: 'success',
        data: { payout }
      });
    } catch (error) {
      next(error);
    }
  };

  processPayout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.payoutService.processPayout(req.params.id);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  cancelPayout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.payoutService.cancelPayout(req.params.id);

      res.json({
        status: 'success',
        message: 'Payout cancelled'
      });
    } catch (error) {
      next(error);
    }
  };
}
