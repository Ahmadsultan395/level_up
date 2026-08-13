import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { BlogForm } from '@/components/admin/BlogForm';

export const metadata: Metadata = { title: 'New Post | Admin' };

export default async function NewBlogPage() {
  await connectDB();
  const categories = await Category.find({ type: 'blog' }).select('name').sort({ name: 1 }).lean();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">New Post</h1>
      <div className="mt-8">
        <BlogForm categories={categories.map((c) => ({ _id: c._id.toString(), name: c.name }))} />
      </div>
    </div>
  );
}
