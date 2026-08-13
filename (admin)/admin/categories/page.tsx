import type { Metadata } from 'next';
import { CategoriesTable } from '@/components/admin/CategoriesTable';

export const metadata: Metadata = { title: 'Categories | Admin' };

export default function AdminCategoriesPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Categories</h1>
      <p className="mt-1 text-text-secondary">Organize services, blog posts, and gallery photos.</p>
      <div className="mt-8">
        <CategoriesTable />
      </div>
    </div>
  );
}
