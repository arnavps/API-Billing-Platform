import PDFDocument from 'pdfkit';
import { IInvoice } from '../models/Invoice';
import { IUser } from '../models/User';

export class PDFService {
  /**
   * Generates a professional PDF invoice.
   */
  static async generateInvoicePDF(invoice: IInvoice, user: IUser): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // Header - Company Info
        doc.fillColor('#0F172A') // Slate 900
           .font('Helvetica-Bold')
           .fontSize(24)
           .text('MeterFlow', 50, 50);
        
        doc.fillColor('#64748B') // Slate 500
           .font('Helvetica')
           .fontSize(10)
           .text('Premium API Billing Platform', 50, 80)
           .text('123 API Avenue, Suite 400', 50, 95)
           .text('San Francisco, CA 94103', 50, 110)
           .text('billing@meterflow.com', 50, 125);

        // Invoice Label & Number
        doc.fillColor('#0F172A')
           .font('Helvetica-Bold')
           .fontSize(28)
           .text('INVOICE', 0, 50, { align: 'right' });
        
        doc.fillColor('#64748B')
           .font('Helvetica')
           .fontSize(12)
           .text(invoice.invoiceNumber, 0, 85, { align: 'right' });

        this.generateHr(doc, 150);

        // Customer & Invoice Details
        const detailsTop = 170;
        
        // Bill To
        doc.fillColor('#0F172A')
           .font('Helvetica-Bold')
           .fontSize(10)
           .text('BILL TO', 50, detailsTop);
        
        doc.fillColor('#1E293B')
           .font('Helvetica')
           .fontSize(12)
           .text(`${user.firstName} ${user.lastName}`, 50, detailsTop + 20)
           .fontSize(10)
           .fillColor('#64748B')
           .text(user.email, 50, detailsTop + 35)
           .text(user.company || '', 50, detailsTop + 50);

        // Invoice Metadata
        doc.fillColor('#0F172A')
           .font('Helvetica-Bold')
           .fontSize(10)
           .text('INVOICE DETAILS', 350, detailsTop);
        
        const metadataY = detailsTop + 20;
        this.generateMetadataRow(doc, 'Date Issued:', new Date(invoice.createdAt).toLocaleDateString(), 350, metadataY);
        this.generateMetadataRow(doc, 'Period Start:', new Date(invoice.period.start).toLocaleDateString(), 350, metadataY + 15);
        this.generateMetadataRow(doc, 'Period End:', new Date(invoice.period.end).toLocaleDateString(), 350, metadataY + 30);
        this.generateMetadataRow(doc, 'Status:', invoice.status.toUpperCase(), 350, metadataY + 45);

        // Table Header
        const tableTop = 280;
        doc.fillColor('#F1F5F9')
           .rect(50, tableTop, 500, 25)
           .fill();
        
        doc.fillColor('#475569')
           .font('Helvetica-Bold')
           .fontSize(10)
           .text('DESCRIPTION', 60, tableTop + 8)
           .text('QTY', 300, tableTop + 8, { width: 50, align: 'right' })
           .text('UNIT PRICE', 360, tableTop + 8, { width: 80, align: 'right' })
           .text('AMOUNT', 450, tableTop + 8, { width: 90, align: 'right' });

        // Table Body
        let currentY = tableTop + 35;
        doc.font('Helvetica').fillColor('#1E293B');

        invoice.lineItems.forEach((item) => {
          doc.text(item.description, 60, currentY, { width: 230 });
          doc.text(item.quantity.toLocaleString(), 300, currentY, { width: 50, align: 'right' });
          doc.text(`$${(item.unitPrice / 100).toFixed(2)}`, 360, currentY, { width: 80, align: 'right' });
          doc.text(`$${(item.amount / 100).toFixed(2)}`, 450, currentY, { width: 90, align: 'right' });
          
          currentY += 25;
          this.generateHr(doc, currentY - 5, '#F1F5F9');
        });

        // Totals
        const totalsY = Math.min(currentY + 20, 650);
        this.generateTotalRow(doc, 'Subtotal', `$${(invoice.subtotal / 100).toFixed(2)}`, totalsY);
        
        let offset = 0;
        if (invoice.discount && invoice.discount.amount > 0) {
          offset += 20;
          this.generateTotalRow(doc, `Discount (${invoice.discount.code})`, `-$${(invoice.discount.amount / 100).toFixed(2)}`, totalsY + offset);
        }
        
        offset += 20;
        this.generateTotalRow(doc, `Tax (${invoice.tax.rate}%)`, `$${(invoice.tax.amount / 100).toFixed(2)}`, totalsY + offset);

        doc.rect(350, totalsY + offset + 25, 200, 40).fill('#F8FAFC');
        doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(14);
        doc.text('TOTAL', 360, totalsY + offset + 38);
        doc.text(`$${(invoice.total / 100).toFixed(2)}`, 450, totalsY + offset + 38, { width: 90, align: 'right' });

        // Footer
        const footerY = 750;
        this.generateHr(doc, footerY);
        doc.fillColor('#94A3B8')
           .font('Helvetica')
           .fontSize(8)
           .text('Payment is due within 15 days. Please contact support@meterflow.com for any questions.', 50, footerY + 15, { align: 'center', width: 500 });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private static generateHr(doc: PDFKit.PDFDocument, y: number, color = '#E2E8F0') {
    doc.strokeColor(color)
       .lineWidth(1)
       .moveTo(50, y)
       .lineTo(550, y)
       .stroke();
  }

  private static generateMetadataRow(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number) {
    doc.fillColor('#64748B').font('Helvetica').fontSize(9).text(label, x, y);
    doc.fillColor('#1E293B').font('Helvetica-Bold').text(value, x + 80, y);
  }

  private static generateTotalRow(doc: PDFKit.PDFDocument, label: string, value: string, y: number) {
    doc.fillColor('#64748B').font('Helvetica').fontSize(10).text(label, 350, y);
    doc.fillColor('#1E293B').font('Helvetica-Bold').text(value, 450, y, { width: 90, align: 'right' });
  }
}
