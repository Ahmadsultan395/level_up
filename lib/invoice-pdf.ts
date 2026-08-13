import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoicePdfData {
  invoiceNumber: string;
  issuedAt: Date;
  status: string;
  customerName: string;
  customerEmail: string;
  siteName: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  total: number;
}

/** Generates a simple, clean invoice PDF and returns it as a Buffer. */
export function generateInvoicePdf(data: InvoicePdfData): Buffer {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  doc.setFontSize(18);
  doc.text(data.siteName, 40, 50);

  doc.setFontSize(11);
  doc.text('INVOICE', 450, 50);
  doc.setFontSize(10);
  doc.text(`Invoice #: ${data.invoiceNumber}`, 450, 66);
  doc.text(`Date: ${formatDate(data.issuedAt)}`, 450, 80);
  doc.text(`Status: ${data.status.toUpperCase()}`, 450, 94);

  doc.setFontSize(10);
  doc.text('Billed to:', 40, 100);
  doc.text(data.customerName, 40, 114);
  doc.text(data.customerEmail, 40, 128);

  autoTable(doc, {
    startY: 160,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: data.items.map((item) => [
      item.description,
      String(item.quantity),
      formatCurrency(item.unitPrice),
      formatCurrency(item.total),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 28, 25] },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;

  let y = finalY;
  doc.text(`Subtotal: ${formatCurrency(data.subtotal)}`, 400, y);
  y += 16;
  if (data.discount > 0) {
    doc.text(`Discount${data.couponCode ? ` (${data.couponCode})` : ''}: -${formatCurrency(data.discount)}`, 400, y);
    y += 16;
  }
  if (data.tax > 0) {
    doc.text(`Tax: ${formatCurrency(data.tax)}`, 400, y);
    y += 16;
  }
  doc.setFontSize(12);
  doc.text(`Total: ${formatCurrency(data.total)}`, 400, y + 6);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('Thank you for your business.', 40, 780);

  return Buffer.from(doc.output('arraybuffer'));
}
