import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Check } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Package } from '@/models/Package';
import { BookCTA } from '@/components/public/BookCTA';
import { formatCurrency } from '@/lib/utils';

interface Props {
  params: { slug: string };
}

async function getPackage(slug: string) {
  await connectDB();
  return Package.findOne({ slug, status: 'active' }).populate('services').lean();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pkg = await getPackage(params.slug);
  if (!pkg) return { title: 'Package Not Found' };
  return { title: pkg.name, description: pkg.description.slice(0, 155) };
}

export default async function PackageDetailsPage({ params }: Props) {
  const pkg = await getPackage(params.slug);
  if (!pkg) notFound();

  const services = pkg.services as unknown as { _id: string; name: string; description: string }[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/packages" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Packages
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-bg-secondary">
          {pkg.imageUrl ? (
            <Image src={pkg.imageUrl} alt={pkg.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">No image</div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl text-text-primary">{pkg.name}</h1>

          <div className="mt-4 flex items-center gap-4">
            <span className="font-display text-2xl text-gold">
              {pkg.discountPrice ? (
                <>
                  <span className="mr-2 text-base text-text-muted line-through">{formatCurrency(pkg.price)}</span>
                  {formatCurrency(pkg.discountPrice)}
                </>
              ) : (
                formatCurrency(pkg.price)
              )}
            </span>
            <span className="flex items-center gap-1 text-sm text-text-muted">
              <Clock className="h-4 w-4" />
              {pkg.durationMinutes} minutes
            </span>
          </div>

          <p className="mt-6 text-text-secondary">{pkg.description}</p>

          <div className="mt-6">
            <h2 className="text-sm font-medium text-text-secondary">What&apos;s included</h2>
            <ul className="mt-3 space-y-2">
              {services.map((s) => (
                <li key={s._id} className="flex items-start gap-2 text-sm text-text-primary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {s.name}
                </li>
              ))}
            </ul>
          </div>

          <BookCTA packageId={pkg._id.toString()} className="mt-8 inline-block" />
        </div>
      </div>
    </div>
  );
}
