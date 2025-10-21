import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const invoiceController = new InvoiceController();

router.use(authenticate);

router.post('/', authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoiceById);
router.get('/:id/pdf', invoiceController.downloadInvoicePDF);
router.post('/:id/send', authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), invoiceController.sendInvoice);
router.get('/family/:familyId', invoiceController.getFamilyInvoices);
router.get('/school/:schoolId', authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), invoiceController.getSchoolInvoices);

export default router;
