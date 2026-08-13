import type { Metadata } from 'next';
import { ServicesTable } from '@/components/admin/ServicesTable';

export const metadata: Metadata = { title: 'Services | Admin' };

export default function AdminServicesPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Services</h1>
      <p className="mt-1 text-text-secondary">Manage the services you offer.</p>
      <div className="mt-8">
        <ServicesTable />
      </div>
    </div>
  );
}
