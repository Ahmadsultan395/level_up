import type { Metadata } from 'next';
import { CategoryForm } from '@/components/admin/CategoryForm';

export const metadata: Metadata = { title: 'Add Category | Admin' };

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Add Category</h1>
      <div className="mt-8">
        <CategoryForm />
      </div>
    </div>
  );
}
