import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const paymentController = new PaymentController();

// Public routes (for Netcash callbacks)
router.post('/netcash/notify', paymentController.handleNetcashNotification);

// Protected routes
router.use(authenticate);

router.post('/', paymentController.createPayment);
router.get('/:reference', paymentController.getPaymentByReference);
router.get('/family/:familyId', paymentController.getFamilyPayments);

// Admin only
router.post(
  '/manual',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  paymentController.recordManualPayment
);

router.get(
  '/school/:schoolId/stats',
  authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  paymentController.getSchoolPaymentStats
);

export default router;
