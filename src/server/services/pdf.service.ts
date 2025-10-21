import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

export class PDFService {
  /**
   * Generate invoice PDF
   */
  async generateInvoice(invoice: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header with school branding
        if (invoice.school.logoUrl) {
          // In production, load and add logo image
          doc.fontSize(20)
            .text(invoice.school.name, 50, 50, { align: 'left' });
        } else {
          doc.fontSize(20)
            .fillColor(invoice.school.primaryColor || '#1e40af')
            .text(invoice.school.name, 50, 50, { align: 'left' });
        }

        doc.fontSize(10)
          .fillColor('#000000')
          .text(invoice.school.address || '', 50, 80)
          .text(`Email: ${invoice.school.email}`, 50, 95)
          .text(`Phone: ${invoice.school.phone || 'N/A'}`, 50, 110);

        // Invoice title and number
        doc.fontSize(24)
          .fillColor(invoice.school.primaryColor || '#1e40af')
          .text('INVOICE', 400, 50, { align: 'right' });

        doc.fontSize(10)
          .fillColor('#000000')
          .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 80, { align: 'right' })
          .text(`Date: ${format(new Date(invoice.issueDate), 'dd MMM yyyy')}`, 400, 95, { align: 'right' })
          .text(`Due Date: ${format(new Date(invoice.dueDate), 'dd MMM yyyy')}`, 400, 110, { align: 'right' });

        // Bill to section
        doc.fontSize(12)
          .fillColor('#000000')
          .text('Bill To:', 50, 150);

        doc.fontSize(10)
          .text(invoice.family.primaryContact, 50, 170)
          .text(invoice.family.email, 50, 185)
          .text(invoice.family.phone || '', 50, 200)
          .text(invoice.family.address || '', 50, 215);

        // Invoice items table
        const tableTop = 280;
        let y = tableTop;

        // Table header
        doc.fontSize(10)
          .fillColor('#FFFFFF')
          .rect(50, y, 495, 25)
          .fill(invoice.school.primaryColor || '#1e40af');

        doc.fillColor('#FFFFFF')
          .text('Description', 60, y + 8)
          .text('Student', 250, y + 8)
          .text('Qty', 350, y + 8)
          .text('Unit Price', 400, y + 8)
          .text('Amount', 480, y + 8, { align: 'right', width: 55 });

        y += 25;

        // Table rows
        doc.fillColor('#000000');
        invoice.items.forEach((item: any, i: number) => {
          const rowColor = i % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
          doc.rect(50, y, 495, 20).fill(rowColor);

          doc.fillColor('#000000')
            .text(item.description, 60, y + 5, { width: 180 })
            .text(item.student ? `${item.student.firstName} ${item.student.lastName}` : '-', 250, y + 5, { width: 90 })
            .text(item.quantity.toString(), 350, y + 5)
            .text(`R ${(item.unitPrice / 100).toFixed(2)}`, 400, y + 5)
            .text(`R ${(item.amount / 100).toFixed(2)}`, 480, y + 5, { align: 'right', width: 55 });

          y += 20;
        });

        // Totals
        y += 20;

        doc.fontSize(10)
          .text('Subtotal:', 400, y)
          .text(`R ${(invoice.subtotal / 100).toFixed(2)}`, 480, y, { align: 'right', width: 55 });

        y += 20;

        if (invoice.tax > 0) {
          doc.text('Tax:', 400, y)
            .text(`R ${(invoice.tax / 100).toFixed(2)}`, 480, y, { align: 'right', width: 55 });
          y += 20;
        }

        doc.fontSize(12)
          .fillColor(invoice.school.primaryColor || '#1e40af')
          .text('Total:', 400, y)
          .text(`R ${(invoice.total / 100).toFixed(2)}`, 480, y, { align: 'right', width: 55 });

        y += 25;

        doc.fontSize(10)
          .fillColor('#000000')
          .text('Amount Paid:', 400, y)
          .text(`R ${(invoice.amountPaid / 100).toFixed(2)}`, 480, y, { align: 'right', width: 55 });

        y += 20;

        doc.fontSize(12)
          .fillColor(invoice.amountDue > 0 ? '#DC2626' : '#16A34A')
          .text('Amount Due:', 400, y)
          .text(`R ${(invoice.amountDue / 100).toFixed(2)}`, 480, y, { align: 'right', width: 55 });

        // Payment instructions
        y += 50;

        if (invoice.amountDue > 0) {
          doc.fontSize(10)
            .fillColor('#000000')
            .text('Payment Instructions:', 50, y);

          y += 20;

          doc.fontSize(9)
            .text('Please make payment using one of the following methods:', 50, y)
            .text('• Online payment: Visit the parent portal', 50, y + 15)
            .text('• Card payment, Instant EFT, or QR Code via Netcash', 50, y + 30)
            .text('• Direct deposit to the school account', 50, y + 45);

          if (invoice.school.bankName) {
            y += 75;
            doc.text(`Bank: ${invoice.school.bankName}`, 50, y)
              .text(`Account: ${invoice.school.accountNumber}`, 50, y + 15)
              .text(`Branch: ${invoice.school.branchCode}`, 50, y + 30)
              .text(`Reference: ${invoice.invoiceNumber}`, 50, y + 45);
          }
        }

        // Notes
        if (invoice.notes) {
          y += 80;
          doc.fontSize(9)
            .fillColor('#6B7280')
            .text('Notes:', 50, y)
            .text(invoice.notes, 50, y + 15, { width: 495 });
        }

        // Footer
        doc.fontSize(8)
          .fillColor('#9CA3AF')
          .text(
            'This invoice was generated automatically. For questions, please contact the school.',
            50,
            doc.page.height - 50,
            { align: 'center', width: 495 }
          );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate statement PDF (summary of all invoices and payments)
   */
  async generateStatement(data: {
    family: any;
    school: any;
    invoices: any[];
    payments: any[];
    startDate: Date;
    endDate: Date;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header
        doc.fontSize(20)
          .fillColor(data.school.primaryColor || '#1e40af')
          .text(data.school.name, 50, 50);

        doc.fontSize(10)
          .fillColor('#000000')
          .text(data.school.address || '', 50, 80);

        // Statement title
        doc.fontSize(24)
          .fillColor(data.school.primaryColor || '#1e40af')
          .text('STATEMENT', 400, 50, { align: 'right' });

        doc.fontSize(10)
          .fillColor('#000000')
          .text(`Period: ${format(data.startDate, 'dd MMM yyyy')} - ${format(data.endDate, 'dd MMM yyyy')}`, 400, 80, { align: 'right' });

        // Family details
        doc.fontSize(12)
          .text('Account Details:', 50, 140);

        doc.fontSize(10)
          .text(data.family.primaryContact, 50, 160)
          .text(data.family.email, 50, 175);

        // Summary
        const totalInvoiced = data.invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalPaid = data.payments.reduce((sum, pay) => sum + pay.amount, 0);
        const balance = totalInvoiced - totalPaid;

        let y = 220;

        doc.fontSize(12)
          .fillColor(data.school.primaryColor || '#1e40af')
          .text('Summary:', 50, y);

        y += 25;

        doc.fontSize(10)
          .fillColor('#000000')
          .text('Total Invoiced:', 50, y)
          .text(`R ${(totalInvoiced / 100).toFixed(2)}`, 200, y);

        y += 20;

        doc.text('Total Paid:', 50, y)
          .text(`R ${(totalPaid / 100).toFixed(2)}`, 200, y);

        y += 20;

        doc.fontSize(12)
          .fillColor(balance > 0 ? '#DC2626' : '#16A34A')
          .text('Balance:', 50, y)
          .text(`R ${(balance / 100).toFixed(2)}`, 200, y);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
