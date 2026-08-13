import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Package } from '@/models/Package';
import { Service } from '@/models/Service';
import { PackageForm } from '@/components/admin/PackageForm';

export const metadata: Metadata = { title: 'Edit Package | Admin' };

export default async function EditPackagePage({ params }: { params: { id: string } }) {
  await connectDB();
  const [pkg, services] = await Promise.all([
    Package.findById(params.id).lean(),
    Service.find().select('name durationMinutes').sort({ name: 1 }).lean(),
  ]);

  if (!pkg) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Edit Package</h1>
      <div className="mt-8">
        <PackageForm
          packageId={params.id}
          allServices={services.map((s) => ({ _id: s._id.toString(), name: s.name, durationMinutes: s.durationMinutes }))}
          initial={{
            name: pkg.name,
            description: pkg.description,
            services: pkg.services.map((s) => s.toString()),
            price: pkg.price,
            discountPrice: pkg.discountPrice,
            durationMinutes: pkg.durationMinutes,
            imageUrl: pkg.imageUrl,
            imagePublicId: pkg.imagePublicId,
            status: pkg.status,
            featured: pkg.featured,
            order: pkg.order,
          }}
        />
      </div>
    </div>
  );
}
