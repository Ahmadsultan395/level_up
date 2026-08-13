import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Award } from 'lucide-react';
import { connectDB } from '@/lib/db';
import { Barber } from '@/models/Barber';
import { BookCTA } from '@/components/public/BookCTA';
import { ServiceCard } from '@/components/shared/ServiceCard';
import { WorkingHoursTable } from '@/components/shared/WorkingHoursTable';
import { Card, CardBody } from '@/components/ui/Card';

interface Props {
  params: { slug: string };
}

async function getBarber(slug: string) {
  await connectDB();
  return Barber.findOne({ slug, status: 'active' }).populate('services').lean();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const barber = await getBarber(params.slug);
  if (!barber) return { title: 'Barber Not Found' };
  return { title: barber.name, description: barber.bio.slice(0, 155) };
}

export default async function BarberProfilePage({ params }: Props) {
  const barber = await getBarber(params.slug);
  if (!barber) notFound();

  const services = barber.services as unknown as (import('@/models/Service').IService & { _id: string })[];
  const galleryImages = barber.gallery.filter((g) => g.status === 'active');

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/barbers" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Barbers
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-bg-secondary">
            {barber.imageUrl ? (
              <Image src={barber.imageUrl} alt={barber.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted">No image</div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {barber.ratingCount > 0 && (
              <div className="flex items-center gap-1.5 text-gold">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-display text-lg">{barber.ratingAvg.toFixed(1)}</span>
                <span className="text-sm text-text-muted">({barber.ratingCount} reviews)</span>
              </div>
            )}
            {barber.experienceYears > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Award className="h-4 w-4 text-gold" />
                {barber.experienceYears} years of experience
              </div>
            )}

            <Card>
              <CardBody>
                <h3 className="font-display text-sm uppercase tracking-wide text-text-secondary">
                  Working Hours
                </h3>
                <div className="mt-3">
                  <WorkingHoursTable workingHours={barber.workingHours} />
                </div>
              </CardBody>
            </Card>

            <BookCTA barberSlug={barber.slug} className="block" fullWidth />
          </div>
        </div>

        <div className="md:col-span-2">
          <h1 className="font-display text-3xl text-text-primary">{barber.name}</h1>
          {barber.specialties.length > 0 && (
            <p className="mt-1 text-sm text-gold">{barber.specialties.join(' • ')}</p>
          )}
          <p className="mt-4 text-text-secondary">{barber.bio}</p>

          {services.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl text-text-primary">Services</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {services.map((s) => (
                  <ServiceCard key={s._id} service={s} />
                ))}
              </div>
            </div>
          )}

          {galleryImages.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl text-text-primary">Portfolio</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {galleryImages.map((img) => (
                  <div key={img.publicId} className="relative aspect-square overflow-hidden rounded-md bg-bg-secondary">
                    <Image src={img.url} alt={`${barber.name} portfolio`} fill className="object-cover" sizes="200px" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
