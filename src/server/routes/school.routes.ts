import { Router } from 'express';
import { SchoolController } from '../controllers/school.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const schoolController = new SchoolController();

router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN'), schoolController.getAllSchools);
router.post('/', authorize('SUPER_ADMIN'), schoolController.createSchool);
router.get('/:id', schoolController.getSchoolById);
router.put('/:id', authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), schoolController.updateSchool);

export default router;
