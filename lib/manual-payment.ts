import { connectDB } from '@/lib/db';
import { Payment } from '@/models/Payment';
import { Invoice } from '@/models/Invoice';
import { Appointment } from '@/models/Appointment';
import { notifyUser } from '@/lib/notifications';

async function generateInvoiceNumber(): Promise<string> {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
}

/**
 * Finance rule (spec section 9): a financial record (Payment marked paid,
 * Invoice) is created ONLY once an admin has manually verified that money
 * actually changed hands — cash handed over in person, or a bank/EasyPaisa/
 * JazzCash transfer confirmed against the reference number the customer
 * provided. Never called automatically at booking time.
 */
export async function confirmManualPayment(paymentId: string, adminId: string) {
  await connectDB();

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found');
  if (payment.status === 'paid') {
    const invoice = await Invoice.findOne({ payment: payment._id });
    return { payment, invoice };
  }

  const appointment = await Appointment.findById(payment.appointment)
    .populate('services', 'name price')
    .populate('package', 'name price');
  if (!appointment) throw new Error('Appointment not found for this payment');

  payment.status = 'paid';
  payment.paidAt = new Date();
  payment.confirmedBy = adminId as never;
  await payment.save();

  const lineItems = appointment.package
    ? [
        {
          description: (appointment.package as unknown as { name: string }).name,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount,
        },
      ]
    : (appointment.services as unknown as { name: string; price: number }[]).map((s) => ({
        description: s.name,
        quantity: 1,
        unitPrice: s.price,
        total: s.price,
      }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const discount = Math.max(0, subtotal - payment.amount);

  const invoiceNumber = await generateInvoiceNumber();
  const invoice = await Invoice.create({
    invoiceNumber,
    customer: appointment.customer,
    appointment: appointment._id,
    payment: payment._id,
    items: lineItems,
    subtotal,
    discount,
    tax: 0,
    total: payment.amount,
    status: 'paid',
    issuedAt: new Date(),
  });

  payment.invoice = invoice._id;
  await payment.save();

  appointment.status = 'confirmed';
  appointment.invoice = invoice._id;
  await appointment.save();

  await notifyUser({
    userId: appointment.customer.toString(),
    type: 'payment_success',
    title: 'Payment confirmed — appointment confirmed',
    message: `We've confirmed your payment of ${payment.amount} ${payment.currency}. Invoice ${invoiceNumber} is available in your dashboard. Your appointment is now confirmed.`,
    relatedId: appointment._id.toString(),
  });

  return { payment, invoice };
}
