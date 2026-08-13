import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const service = await Service.findOne({ slug: params.slug, status: 'active' }).populate('category').lean();

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (err) {
    console.error('GET /api/services/[slug] error:', err);
    return NextResponse.json({ error: 'Failed to load service' }, { status: 500 });
  }
}
