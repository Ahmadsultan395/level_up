import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Blog } from '@/models/Blog';
import { Category } from '@/models/Category';
import { BlogForm } from '@/components/admin/BlogForm';

export const metadata: Metadata = { title: 'Edit Post | Admin' };

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  await connectDB();
  const [blog, categories] = await Promise.all([
    Blog.findById(params.id).lean(),
    Category.find({ type: 'blog' }).select('name').sort({ name: 1 }).lean(),
  ]);

  if (!blog) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Edit Post</h1>
      <div className="mt-8">
        <BlogForm
          blogId={params.id}
          categories={categories.map((c) => ({ _id: c._id.toString(), name: c.name }))}
          initial={{
            title: blog.title,
            excerpt: blog.excerpt,
            content: blog.content,
            category: blog.category?.toString(),
            tags: blog.tags,
            coverImageUrl: blog.coverImageUrl,
            coverImagePublicId: blog.coverImagePublicId,
            status: blog.status,
            publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : undefined,
            seoTitle: blog.seoTitle,
            seoDescription: blog.seoDescription,
          }}
        />
      </div>
    </div>
  );
}
