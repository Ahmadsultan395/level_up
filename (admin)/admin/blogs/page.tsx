import type { Metadata } from 'next';
import { BlogsTable } from '@/components/admin/BlogsTable';

export const metadata: Metadata = { title: 'Blogs | Admin' };

export default function AdminBlogsPage() {
  return (
    <div className="px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Blog</h1>
      <p className="mt-1 text-text-secondary">Write and manage articles.</p>
      <div className="mt-8">
        <BlogsTable />
      </div>
    </div>
  );
}
