import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Invoice } from '@/models/Invoice';
import { requireUser } from '@/lib/session';
import { generateInvoicePdf } from '@/lib/invoice-pdf';
import { getSiteSettings } from '@/models/SiteSettings';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    await connectDB();

    const invoice = await Invoice.findById(params.id).populate('customer', 'name email');
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const customer = invoice.customer as unknown as { _id: { toString(): string }; name: string; email: string };
    const isOwner = customer._id.toString() === user.id;
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const settings = await getSiteSettings();

    const pdfBuffer = generateInvoicePdf({
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt,
      status: invoice.status,
      customerName: customer.name,
      customerEmail: customer.email,
      siteName: settings.siteName,
      items: invoice.items,
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      couponCode: invoice.couponCode,
      tax: invoice.tax,
      total: invoice.total,
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('GET /api/invoices/[id]/download error:', err);
    return NextResponse.json({ error: 'Could not generate invoice PDF' }, { status: 500 });
  }
}
