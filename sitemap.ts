import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { Package } from '@/models/Package';
import { Barber } from '@/models/Barber';
import { Blog } from '@/models/Blog';

const STATIC_ROUTES = [
  '',
  '/about',
  '/services',
  '/packages',
  '/gallery',
  '/before-after',
  '/barbers',
  '/pricing',
  '/reviews',
  '/testimonials',
  '/blog',
  '/faq',
  '/contact',
  '/careers',
  '/privacy-policy',
  '/terms-conditions',
  '/refund-policy',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  await connectDB();
  const [services, packages, barbers, blogs] = await Promise.all([
    Service.find({ status: 'active' }).select('slug updatedAt').lean(),
    Package.find({ status: 'active' }).select('slug updatedAt').lean(),
    Barber.find({ status: 'active' }).select('slug updatedAt').lean(),
    Blog.find({ status: 'active', publishedAt: { $lte: new Date() } }).select('slug updatedAt').lean(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...services.map((s) => ({ url: `${baseUrl}/services/${s.slug}`, lastModified: s.updatedAt, priority: 0.6 })),
    ...packages.map((p) => ({ url: `${baseUrl}/packages/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...barbers.map((b) => ({ url: `${baseUrl}/barbers/${b.slug}`, lastModified: b.updatedAt, priority: 0.6 })),
    ...blogs.map((b) => ({ url: `${baseUrl}/blog/${b.slug}`, lastModified: b.updatedAt, priority: 0.5 })),
  ];

  return [...staticEntries, ...dynamicEntries];
}
