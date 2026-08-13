import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { BarberForm } from '@/components/admin/BarberForm';

export const metadata: Metadata = { title: 'Add Barber | Admin' };

export default async function NewBarberPage() {
  await connectDB();
  const services = await Service.find().select('name').sort({ name: 1 }).lean();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Add Barber</h1>
      <p className="mt-1 text-text-secondary">Create a new barber profile.</p>

      <div className="mt-8">
        <BarberForm allServices={services.map((s) => ({ _id: s._id.toString(), name: s.name }))} />
      </div>
    </div>
  );
}
