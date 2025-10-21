import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import { authenticate, authorize, checkFamilyAccess } from '../middleware/auth';

const router = Router();
const familyController = new FamilyController();

router.use(authenticate);

router.get('/school/:schoolId', authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), familyController.getSchoolFamilies);
router.post('/', authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), familyController.createFamily);
router.get('/:id', checkFamilyAccess, familyController.getFamilyById);
router.put('/:id', checkFamilyAccess, familyController.updateFamily);

export default router;
