import { Response, NextFunction } from 'express';
import { InvoiceService } from '../services/invoice.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export class InvoiceController {
  private invoiceService: InvoiceService;

  constructor() {
    this.invoiceService = new InvoiceService();
  }

  createInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const invoice = await this.invoiceService.createInvoice(req.body);

      res.status(201).json({
        status: 'success',
        data: { invoice }
      });
    } catch (error) {
      next(error);
    }
  };

  getInvoiceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const invoice = await this.invoiceService.getInvoiceById(req.params.id);

      res.json({
        status: 'success',
        data: { invoice }
      });
    } catch (error) {
      next(error);
    }
  };

  downloadInvoicePDF = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const invoice = await this.invoiceService.getInvoiceById(req.params.id);
      const pdfService = new (await import('../services/pdf.service')).PDFService();
      const pdfBuffer = await pdfService.generateInvoice(invoice);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  sendInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.invoiceService.sendInvoice(req.params.id);

      res.json({
        status: 'success',
        message: 'Invoice sent successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getFamilyInvoices = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const invoices = await this.invoiceService.getFamilyInvoices(req.params.familyId);

      res.json({
        status: 'success',
        data: { invoices }
      });
    } catch (error) {
      next(error);
    }
  };

  getSchoolInvoices = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const invoices = await this.invoiceService.getSchoolInvoices(req.params.schoolId);

      res.json({
        status: 'success',
        data: { invoices }
      });
    } catch (error) {
      next(error);
    }
  };
}
