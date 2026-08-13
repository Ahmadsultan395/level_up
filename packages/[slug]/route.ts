import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Package } from '@/models/Package';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const pkg = await Package.findOne({ slug: params.slug, status: 'active' }).populate('services').lean();

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json(pkg);
  } catch (err) {
    console.error('GET /api/packages/[slug] error:', err);
    return NextResponse.json({ error: 'Failed to load package' }, { status: 500 });
  }
}
