import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Blog } from '@/models/Blog';
import { formatDate } from '@/lib/utils';
import { BlogCard } from '@/components/shared/BlogCard';

interface Props {
  params: { slug: string };
}

async function getBlog(slug: string) {
  await connectDB();
  // $inc happens once per render; acceptable for a view counter (not billing-critical).
  return Blog.findOneAndUpdate(
    { slug, status: 'active', publishedAt: { $lte: new Date() } },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', 'name avatarUrl')
    .populate('category', 'name slug')
    .lean();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  if (!blog) return { title: 'Post Not Found' };
  return {
    title: blog.title,
    description: blog.seoDescription || blog.excerpt,
  };
}

export default async function BlogDetailsPage({ params }: Props) {
  const blog = await getBlog(params.slug);
  if (!blog) notFound();

  await connectDB();
  const related = await Blog.find({
    status: 'active',
    _id: { $ne: blog._id },
    publishedAt: { $lte: new Date() },
    ...(blog.category ? { category: blog.category } : {}),
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .populate('category', 'name')
    .lean();

  const author = blog.author as unknown as { name: string } | undefined;
  const category = blog.category as unknown as { name: string } | undefined;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      <div className="mt-6">
        {category && <p className="font-mono text-xs uppercase tracking-widest text-gold">{category.name}</p>}
        <h1 className="mt-2 font-display text-4xl text-text-primary">{blog.title}</h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
          {author && <span>By {author.name}</span>}
          {blog.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(blog.publishedAt)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {blog.views} views
          </span>
        </div>
      </div>

      {blog.coverImageUrl && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg bg-bg-secondary">
          <Image src={blog.coverImageUrl} alt={blog.title} fill className="object-cover" priority />
        </div>
      )}

      <div className="prose prose-invert mt-8 max-w-none text-text-secondary">
        {blog.content.split('\n').filter(Boolean).map((para, i) => (
          <p key={i} className="mb-4 leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {blog.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl text-text-primary">Related Articles</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((post) => (
              <BlogCard key={post._id.toString()} blog={post as never} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
