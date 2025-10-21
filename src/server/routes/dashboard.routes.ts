import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

router.get('/school/:schoolId', authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), dashboardController.getSchoolDashboard);
router.get('/parent/:familyId', dashboardController.getParentDashboard);

export default router;
