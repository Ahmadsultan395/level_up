import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Check } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { IPackage } from '@/models/Package';
import type { IService } from '@/models/Service';

export function PackageCard({ pkg }: { pkg: IPackage & { _id: string; services: (IService & { _id: string })[] } }) {
  return (
    <Link href={`/packages/${pkg.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-gold">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-secondary">
          {pkg.imageUrl ? (
            <Image
              src={pkg.imageUrl}
              alt={pkg.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text-muted">No image</div>
          )}
        </div>
        <CardBody>
          <h3 className="font-display text-lg text-text-primary">{pkg.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">{pkg.description}</p>

          {pkg.services.length > 0 && (
            <ul className="mt-3 space-y-1">
              {pkg.services.slice(0, 3).map((s) => (
                <li key={s._id} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Check className="h-3 w-3 text-gold" /> {s.name}
                </li>
              ))}
              {pkg.services.length > 3 && (
                <li className="text-xs text-text-muted">+{pkg.services.length - 3} more</li>
              )}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="h-3.5 w-3.5" />
              {pkg.durationMinutes} min
            </span>
            <span className="font-display text-gold">
              {pkg.discountPrice ? (
                <>
                  <span className="mr-1.5 text-xs text-text-muted line-through">{formatCurrency(pkg.price)}</span>
                  {formatCurrency(pkg.discountPrice)}
                </>
              ) : (
                formatCurrency(pkg.price)
              )}
            </span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
            View package <ArrowRight className="h-3 w-3" />
          </span>
        </CardBody>
      </Card>
    </Link>
  );
}
