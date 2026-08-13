import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { NewsletterSubscriber } from '@/models/NewsletterSubscriber';
import { requireAdmin } from '@/lib/session';
import { sendEmail } from '@/lib/email';

const schema = z.object({
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  body: z.string().min(2, 'Message must be at least 2 characters'),
  ids: z.array(z.string()).optional(), // omit to send to all subscribed
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const filter = parsed.data.ids?.length
      ? { _id: { $in: parsed.data.ids }, status: 'subscribed' }
      : { status: 'subscribed' };

    const subscribers = await NewsletterSubscriber.find(filter).select('email');

    // Send sequentially with basic error tolerance so one bad address doesn't abort the batch.
    let sent = 0;
    for (const sub of subscribers) {
      try {
        await sendEmail({ to: sub.email, subject: parsed.data.subject, html: parsed.data.body.replace(/\n/g, '<br/>') });
        sent++;
      } catch (err) {
        console.warn(`Newsletter send failed for ${sub.email}:`, err);
      }
    }

    return NextResponse.json({ message: `Sent to ${sent} of ${subscribers.length} subscribers` });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/newsletter/send error:', err);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
}
