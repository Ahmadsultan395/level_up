import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { NewsletterSubscriber } from '@/models/NewsletterSubscriber';

const schema = z.object({ email: z.string().email('Enter a valid email address') });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();

    const existing = await NewsletterSubscriber.findOne({ email: parsed.data.email });
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'subscribed';
        await existing.save();
      }
      return NextResponse.json({ message: "You're subscribed!" }, { status: 200 });
    }

    await NewsletterSubscriber.create({ email: parsed.data.email, source: 'website_footer' });
    return NextResponse.json({ message: "You're subscribed!" }, { status: 201 });
  } catch (err) {
    console.error('POST /api/newsletter/subscribe error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
