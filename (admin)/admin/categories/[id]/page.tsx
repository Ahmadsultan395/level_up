import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { CategoryForm } from '@/components/admin/CategoryForm';

export const metadata: Metadata = { title: 'Edit Category | Admin' };

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  await connectDB();
  const category = await Category.findById(params.id).lean();
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Edit Category</h1>
      <div className="mt-8">
        <CategoryForm
          categoryId={params.id}
          initial={{
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl,
            imagePublicId: category.imagePublicId,
            type: category.type,
            status: category.status,
            order: category.order,
          }}
        />
      </div>
    </div>
  );
}
