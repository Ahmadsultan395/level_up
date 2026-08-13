import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { ContactMessage } from '@/models/ContactMessage';
import { getSiteSettings } from '@/models/SiteSettings';
import { sendEmail } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().max(20).optional(),
  subject: z.string().min(2, 'Subject is required').max(150),
  message: z.string().min(10, 'Please write at least 10 characters').max(2000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const message = await ContactMessage.create(parsed.data);

    const settings = await getSiteSettings();

    // Notify admin
    if (settings.contactEmail) {
      await sendEmail({
        to: settings.contactEmail,
        subject: `New contact message: ${parsed.data.subject}`,
        html: `
          <p><strong>From:</strong> ${parsed.data.name} (${parsed.data.email})</p>
          ${parsed.data.phone ? `<p><strong>Phone:</strong> ${parsed.data.phone}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${parsed.data.message.replace(/\n/g, '<br/>')}</p>
        `,
      });
    }

    // Confirm to customer
    await sendEmail({
      to: parsed.data.email,
      subject: `We received your message — ${settings.siteName}`,
      html: `
        <p>Hi ${parsed.data.name},</p>
        <p>Thanks for reaching out. We've received your message and will get back to you shortly.</p>
        <p>— ${settings.siteName}</p>
      `,
    });

    return NextResponse.json({ id: message._id.toString() }, { status: 201 });
  } catch (err) {
    console.error('POST /api/contact error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
