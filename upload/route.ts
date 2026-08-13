import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/session';
import { uploadImage, CLOUDINARY_FOLDERS, type CloudinaryFolder } from '@/lib/cloudinary';

const schema = z.object({
  fileBase64: z.string().min(1),
  folder: z.custom<CloudinaryFolder>((v) => typeof v === 'string' && v in CLOUDINARY_FOLDERS),
});

export async function POST(req: Request) {
  try {
    await requireUser();
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid upload request' }, { status: 400 });
    }

    const result = await uploadImage(parsed.data.fileBase64, parsed.data.folder);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if ((err as { status?: number }).status === 401) {
      return NextResponse.json({ error: 'Please log in.' }, { status: 401 });
    }
    console.error('POST /api/upload error:', err);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
