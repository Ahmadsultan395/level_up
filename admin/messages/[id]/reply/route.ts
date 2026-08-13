import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { ContactMessage } from '@/models/ContactMessage';
import { requireAdmin } from '@/lib/session';
import { sendEmail } from '@/lib/email';
import { getSiteSettings } from '@/models/SiteSettings';

const schema = z.object({ message: z.string().min(2).max(2000) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    await connectDB();
    const contactMessage = await ContactMessage.findById(params.id);
    if (!contactMessage) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

    contactMessage.replies.push({
      message: parsed.data.message,
      repliedBy: admin.name || 'Admin',
      repliedAt: new Date(),
    });
    contactMessage.status = 'replied';
    await contactMessage.save();

    const settings = await getSiteSettings();
    await sendEmail({
      to: contactMessage.email,
      subject: `Re: ${contactMessage.subject}`,
      html: `<p>${parsed.data.message.replace(/\n/g, '<br/>')}</p><p>— ${settings.siteName}</p>`,
    });

    return NextResponse.json(contactMessage);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/messages/[id]/reply error:', err);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
