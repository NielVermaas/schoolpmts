import { Router } from 'express';
import { PayoutController } from '../controllers/payout.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const payoutController = new PayoutController();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'));

router.post('/school/:schoolId', payoutController.createPayout);
router.get('/school/:schoolId', payoutController.getSchoolPayouts);
router.get('/:id', payoutController.getPayoutById);
router.post('/:id/process', payoutController.processPayout);
router.delete('/:id', payoutController.cancelPayout);

export default router;
