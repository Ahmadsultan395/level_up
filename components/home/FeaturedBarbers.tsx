import { BarberCard } from '@/components/shared/BarberCard';
import { EmptyState } from '@/components/shared/States';
import { getFeaturedBarbers } from '@/lib/queries/public';

export async function FeaturedBarbers() {
  const barbers = await getFeaturedBarbers(4);

  return (
    <section className="border-y border-border bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-gold">Meet the team</p>
          <h2 className="mt-2 font-display text-3xl text-text-primary">Our Master Barbers</h2>
        </div>

        {barbers.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Team coming soon" description="Our barber profiles will appear here shortly." />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {barbers.map((barber) => (
              <BarberCard key={barber._id.toString()} barber={barber as never} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
