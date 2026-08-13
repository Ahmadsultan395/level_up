import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { formatCurrency } from '@/lib/utils';
import type { IService } from '@/models/Service';

export function ServiceCard({ service }: { service: IService & { _id: string } }) {
  return (
    <Link href={`/services/${service.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-gold">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-secondary">
          {service.imageUrl ? (
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">No image</div>
          )}
          <FavoriteButton serviceId={service._id} className="absolute right-2 top-2" />
        </div>
        <CardBody>
          <h3 className="font-display text-lg text-text-primary">{service.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">{service.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="h-3.5 w-3.5" />
              {service.durationMinutes} min
            </span>
            <span className="font-display text-gold">
              {service.discountPrice ? (
                <>
                  <span className="mr-1.5 text-xs text-text-muted line-through">
                    {formatCurrency(service.price)}
                  </span>
                  {formatCurrency(service.discountPrice)}
                </>
              ) : (
                formatCurrency(service.price)
              )}
            </span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
            View details <ArrowRight className="h-3 w-3" />
          </span>
        </CardBody>
      </Card>
    </Link>
  );
}
