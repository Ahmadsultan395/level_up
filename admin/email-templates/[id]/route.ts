import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { EmailTemplate } from '@/models/EmailTemplate';
import { requireAdmin } from '@/lib/session';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const template = await EmailTemplate.findById(params.id);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    return NextResponse.json(template);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/email-templates/[id] error:', err);
    return NextResponse.json({ error: 'Failed to load template' }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  subject: z.string().min(2).max(200).optional(),
  body: z.string().min(10).optional(),
  availableVariables: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const template = await EmailTemplate.findByIdAndUpdate(params.id, parsed.data, { new: true, runValidators: true });
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    return NextResponse.json(template);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/email-templates/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const template = await EmailTemplate.findByIdAndDelete(params.id);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    return NextResponse.json({ message: 'Template deleted' });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('DELETE /api/admin/email-templates/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
