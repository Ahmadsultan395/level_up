import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { ServiceForm } from '@/components/admin/ServiceForm';

export const metadata: Metadata = { title: 'Add Service | Admin' };

export default async function NewServicePage() {
  await connectDB();
  const categories = await Category.find({ type: 'service' }).select('name').sort({ name: 1 }).lean();

  if (categories.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-display text-3xl text-text-primary">Add Service</h1>
        <p className="mt-4 text-text-secondary">
          You need at least one service category first.{' '}
          <Link href="/admin/categories/new" className="text-gold hover:text-gold-bright">
            Create one →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Add Service</h1>
      <div className="mt-8">
        <ServiceForm categories={categories.map((c) => ({ _id: c._id.toString(), name: c.name }))} />
      </div>
    </div>
  );
}
