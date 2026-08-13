import { TestimonialCard } from '@/components/shared/TestimonialCard';
import { EmptyState } from '@/components/shared/States';
import { getApprovedTestimonials } from '@/lib/queries/public';

export async function TestimonialsSection() {
  const testimonials = await getApprovedTestimonials(6);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Kind words</p>
        <h2 className="mt-2 font-display text-3xl text-text-primary">What Our Clients Say</h2>
      </div>

      {testimonials.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No testimonials yet" description="Client stories will be featured here soon." />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t._id.toString()} testimonial={t as never} />
          ))}
        </div>
      )}
    </section>
  );
}
