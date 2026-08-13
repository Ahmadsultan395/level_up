import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface BlogCardProps {
  blog: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImageUrl?: string;
    publishedAt?: string;
    views: number;
    category?: { name: string };
  };
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blog/${blog.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-gold">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-bg-secondary">
          {blog.coverImageUrl ? (
            <Image
              src={blog.coverImageUrl}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">No image</div>
          )}
        </div>
        <CardBody>
          {blog.category && (
            <p className="font-mono text-xs uppercase tracking-widest text-gold">{blog.category.name}</p>
          )}
          <h3 className="mt-1 font-display text-lg text-text-primary">{blog.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-text-muted">{blog.excerpt}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
            {blog.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {formatDate(blog.publishedAt)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {blog.views}
            </span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
