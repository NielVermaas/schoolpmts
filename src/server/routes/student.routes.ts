import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const studentController = new StudentController();

router.use(authenticate);

router.get('/family/:familyId', studentController.getFamilyStudents);
router.post('/', authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), studentController.createStudent);
router.put('/:id', authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), studentController.updateStudent);

export default router;
