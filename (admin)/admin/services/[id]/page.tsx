import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { Category } from '@/models/Category';
import { ServiceForm } from '@/components/admin/ServiceForm';

export const metadata: Metadata = { title: 'Edit Service | Admin' };

export default async function EditServicePage({ params }: { params: { id: string } }) {
  await connectDB();
  const [service, categories] = await Promise.all([
    Service.findById(params.id).lean(),
    Category.find({ type: 'service' }).select('name').sort({ name: 1 }).lean(),
  ]);

  if (!service) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Edit Service</h1>
      <div className="mt-8">
        <ServiceForm
          serviceId={params.id}
          categories={categories.map((c) => ({ _id: c._id.toString(), name: c.name }))}
          initial={{
            name: service.name,
            description: service.description,
            category: service.category.toString(),
            price: service.price,
            discountPrice: service.discountPrice,
            durationMinutes: service.durationMinutes,
            imageUrl: service.imageUrl,
            imagePublicId: service.imagePublicId,
            status: service.status,
            featured: service.featured,
            order: service.order,
          }}
        />
      </div>
    </div>
  );
}
