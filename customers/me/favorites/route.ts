import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { requireUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();
    const profile = await User.findById(user.id).populate('favoriteServices').select('favoriteServices');
    return NextResponse.json({ data: profile?.favoriteServices || [] });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('GET /api/customers/me/favorites error:', err);
    return NextResponse.json({ error: 'Failed to load favorites' }, { status: 500 });
  }
}

const schema = z.object({ serviceId: z.string().min(1) });

/** Toggles a service in/out of the customer's wishlist. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    await connectDB();
    const profile = await User.findById(user.id);
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const idStr = parsed.data.serviceId;
    const exists = profile.favoriteServices.some((id) => id.toString() === idStr);

    if (exists) {
      profile.favoriteServices = profile.favoriteServices.filter((id) => id.toString() !== idStr) as never;
    } else {
      profile.favoriteServices.push(idStr as never);
    }
    await profile.save();

    return NextResponse.json({ favorited: !exists });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('POST /api/customers/me/favorites error:', err);
    return NextResponse.json({ error: 'Failed to update favorites' }, { status: 500 });
  }
}
