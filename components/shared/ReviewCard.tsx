import Image from 'next/image';
import { Star } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface ReviewCardProps {
  review: {
    _id: string;
    rating: number;
    comment: string;
    images: { url: string; publicId: string }[];
    adminReply?: string;
    createdAt: string;
    customer: { name: string; avatarUrl?: string };
    barber?: { name: string; slug: string };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-bg-secondary">
              {review.customer.avatarUrl && (
                <Image src={review.customer.avatarUrl} alt={review.customer.name} fill className="object-cover" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{review.customer.name}</p>
              <p className="text-xs text-text-muted">
                {formatDate(review.createdAt)}
                {review.barber && ` • with ${review.barber.name}`}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-current' : 'text-border'}`} />
            ))}
          </div>
        </div>

        <p className="mt-3 text-sm text-text-secondary">{review.comment}</p>

        {review.images.length > 0 && (
          <div className="mt-3 flex gap-2">
            {review.images.map((img) => (
              <div key={img.publicId} className="relative h-16 w-16 overflow-hidden rounded-md bg-bg-secondary">
                <Image src={img.url} alt="Review photo" fill className="object-cover" sizes="64px" />
              </div>
            ))}
          </div>
        )}

        {review.adminReply && (
          <div className="mt-3 rounded-md bg-bg-secondary p-3">
            <p className="text-xs font-medium text-gold">Response from us</p>
            <p className="mt-1 text-sm text-text-muted">{review.adminReply}</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
