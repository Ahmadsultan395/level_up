import type { Metadata } from 'next';
import { PackagesTable } from '@/components/admin/PackagesTable';

export const metadata: Metadata = { title: 'Packages | Admin' };

export default function AdminPackagesPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Packages</h1>
      <p className="mt-1 text-text-secondary">Bundle services together at a special price.</p>
      <div className="mt-8">
        <PackagesTable />
      </div>
    </div>
  );
}
