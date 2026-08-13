import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, ArrowLeft } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Service } from '@/models/Service';
import { Barber } from '@/models/Barber';
import { BarberCard } from '@/components/shared/BarberCard';
import { BookCTA } from '@/components/public/BookCTA';
import { formatCurrency } from '@/lib/utils';

interface Props {
  params: { slug: string };
}

async function getService(slug: string) {
  await connectDB();
  const service = await Service.findOne({ slug, status: 'active' }).populate('category').lean();
  return service;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: service.name,
    description: service.description.slice(0, 155),
  };
}

export default async function ServiceDetailsPage({ params }: Props) {
  const service = await getService(params.slug);
  if (!service) notFound();

  const barbers = await Barber.find({ status: 'active', services: service._id })
    .sort({ ratingAvg: -1 })
    .limit(4)
    .lean();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Link href="/services" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Services
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-bg-secondary">
          {service.imageUrl ? (
            <Image src={service.imageUrl} alt={service.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">No image</div>
          )}
        </div>

        <div>
          {service.category && (
            <p className="font-mono text-xs uppercase tracking-widest text-gold">
              {(service.category as unknown as { name: string }).name}
            </p>
          )}
          <h1 className="mt-2 font-display text-3xl text-text-primary">{service.name}</h1>

          <div className="mt-4 flex items-center gap-4">
            <span className="font-display text-2xl text-gold">
              {service.discountPrice ? (
                <>
                  <span className="mr-2 text-base text-text-muted line-through">
                    {formatCurrency(service.price)}
                  </span>
                  {formatCurrency(service.discountPrice)}
                </>
              ) : (
                formatCurrency(service.price)
              )}
            </span>
            <span className="flex items-center gap-1 text-sm text-text-muted">
              <Clock className="h-4 w-4" />
              {service.durationMinutes} minutes
            </span>
          </div>

          <p className="mt-6 text-text-secondary">{service.description}</p>

          <BookCTA serviceSlug={service.slug} className="mt-8 inline-block" />
        </div>
      </div>

      {barbers.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl text-text-primary">Barbers offering this service</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {barbers.map((barber) => (
              <BarberCard key={barber._id.toString()} barber={barber as never} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
