import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import type { IBarber } from '@/models/Barber';

export function BarberCard({ barber }: { barber: IBarber & { _id: string } }) {
  return (
    <Link href={`/barbers/${barber.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-gold">
        <div className="relative aspect-square w-full overflow-hidden bg-bg-secondary">
          {barber.imageUrl ? (
            <Image
              src={barber.imageUrl}
              alt={barber.name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">No image</div>
          )}
        </div>
        <CardBody>
          <h3 className="font-display text-lg text-text-primary">{barber.name}</h3>
          {barber.specialties.length > 0 && (
            <p className="mt-1 line-clamp-1 text-sm text-text-muted">{barber.specialties.join(', ')}</p>
          )}
          {barber.ratingCount > 0 && (
            <div className="mt-2 flex items-center gap-1 text-sm text-gold">
              <Star className="h-3.5 w-3.5 fill-current" />
              {barber.ratingAvg.toFixed(1)}
              <span className="text-text-muted">({barber.ratingCount})</span>
            </div>
          )}
        </CardBody>
      </Card>
    </Link>
  );
}
