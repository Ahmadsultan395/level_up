import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import type { ITestimonial } from '@/models/Testimonial';

export function TestimonialCard({ testimonial }: { testimonial: ITestimonial & { _id: string } }) {
  return (
    <Card className="h-full">
      <CardBody className="flex h-full flex-col">
        <Quote className="h-6 w-6 text-gold-muted" aria-hidden="true" />
        <p className="mt-3 flex-1 text-sm text-text-secondary">&ldquo;{testimonial.message}&rdquo;</p>

        <div className="mt-5 flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold/10 text-sm font-medium text-gold">
            {testimonial.photoUrl ? (
              <Image src={testimonial.photoUrl} alt={testimonial.name} fill className="object-cover" />
            ) : (
              testimonial.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">{testimonial.name}</p>
            {testimonial.roleOrTitle && <p className="text-xs text-text-muted">{testimonial.roleOrTitle}</p>}
          </div>
          {testimonial.rating && (
            <div className="ml-auto flex items-center gap-0.5 text-gold">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
