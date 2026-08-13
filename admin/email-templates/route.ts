import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { EmailTemplate } from '@/models/EmailTemplate';
import { requireAdmin } from '@/lib/session';
import { parseListQuery, buildListResponse } from '@/lib/list-query';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const query = parseListQuery(new URL(req.url).searchParams);

    const result = await buildListResponse(EmailTemplate, query, {
      filterFields: ['status'],
      searchFields: ['name', 'key', 'subject'],
      defaultSortBy: 'name',
    });

    return NextResponse.json(result);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/email-templates error:', err);
    return NextResponse.json({ error: 'Failed to load email templates' }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(2).max(150),
  key: z.string().min(2).max(100).regex(/^[a-z0-9_]+$/, 'Key must be lowercase letters, numbers, underscores'),
  subject: z.string().min(2).max(200),
  body: z.string().min(10),
  availableVariables: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    await connectDB();
    const existing = await EmailTemplate.findOne({ key: parsed.data.key });
    if (existing) {
      return NextResponse.json({ error: 'A template with this key already exists' }, { status: 409 });
    }

    const template = await EmailTemplate.create(parsed.data);
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('POST /api/admin/email-templates error:', err);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
