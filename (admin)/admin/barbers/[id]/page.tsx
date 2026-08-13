import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Barber } from '@/models/Barber';
import { Service } from '@/models/Service';
import { BarberForm } from '@/components/admin/BarberForm';

export const metadata: Metadata = { title: 'Edit Barber | Admin' };

interface Props {
  params: { id: string };
}

export default async function EditBarberPage({ params }: Props) {
  await connectDB();
  const [barber, services] = await Promise.all([
    Barber.findById(params.id).lean(),
    Service.find().select('name').sort({ name: 1 }).lean(),
  ]);

  if (!barber) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Edit Barber</h1>
      <p className="mt-1 text-text-secondary">{barber.name}</p>

      <div className="mt-8">
        <BarberForm
          barberId={params.id}
          allServices={services.map((s) => ({ _id: s._id.toString(), name: s.name }))}
          initial={{
            name: barber.name,
            bio: barber.bio,
            imageUrl: barber.imageUrl,
            imagePublicId: barber.imagePublicId,
            specialties: barber.specialties,
            experienceYears: barber.experienceYears,
            services: barber.services.map((s) => s.toString()),
            workingHours: barber.workingHours as never,
            vacations: barber.vacations.map((v) => ({
              startDate: new Date(v.startDate).toISOString().slice(0, 10),
              endDate: new Date(v.endDate).toISOString().slice(0, 10),
              reason: v.reason,
            })),
            socialLinks: barber.socialLinks,
            status: barber.status,
          }}
        />
      </div>
    </div>
  );
}
