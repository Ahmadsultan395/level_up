import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/session';
import { getSiteSettings } from '@/models/SiteSettings';

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('GET /api/admin/settings error:', err);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

const settingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  tagline: z.string().max(200).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(30).optional(),
  address: z.string().max(300).optional(),
  socialLinks: z.array(z.object({ platform: z.string(), url: z.string() })).optional(),
  footerText: z.string().max(300).optional(),
  heroTitle: z.string().max(150).optional(),
  heroSubtitle: z.string().max(300).optional(),
  aboutContent: z.string().max(5000).optional(),
  privacyPolicyContent: z.string().max(10000).optional(),
  termsContent: z.string().max(10000).optional(),
  refundPolicyContent: z.string().max(10000).optional(),
  careersIntro: z.string().max(1000).optional(),
  bankAccountTitle: z.string().max(150).optional(),
  bankAccountNumber: z.string().max(50).optional(),
  bankName: z.string().max(100).optional(),
  easypaisaNumber: z.string().max(20).optional(),
  jazzcashNumber: z.string().max(20).optional(),
  paymentInstructions: z.string().max(1000).optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string()).optional(),
  ogImageUrl: z.string().url().optional(),
  currency: z.string().max(10).optional(),
  taxRatePercent: z.number().min(0).max(100).optional(),
});

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const current = await getSiteSettings();
    Object.assign(current, parsed.data);
    await current.save();

    return NextResponse.json(current);
  } catch (err) {
    if ((err as { status?: number }).status) {
      return NextResponse.json({ error: (err as Error).message }, { status: (err as { status: number }).status });
    }
    console.error('PATCH /api/admin/settings error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
