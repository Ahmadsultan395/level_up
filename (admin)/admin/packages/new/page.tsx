import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { PackageForm } from '@/components/admin/PackageForm';

export const metadata: Metadata = { title: 'Add Package | Admin' };

export default async function NewPackagePage() {
  await connectDB();
  const services = await Service.find().select('name durationMinutes').sort({ name: 1 }).lean();

  if (services.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-display text-3xl text-text-primary">Add Package</h1>
        <p className="mt-4 text-text-secondary">
          You need at least one service first.{' '}
          <Link href="/admin/services/new" className="text-gold hover:text-gold-bright">
            Create one →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Add Package</h1>
      <div className="mt-8">
        <PackageForm allServices={services.map((s) => ({ _id: s._id.toString(), name: s.name, durationMinutes: s.durationMinutes }))} />
      </div>
    </div>
  );
}
