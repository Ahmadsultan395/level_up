import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ServiceCard } from '@/components/shared/ServiceCard';
import { EmptyState } from '@/components/shared/States';
import { Button } from '@/components/ui/Button';
import { getFeaturedServices } from '@/lib/queries/public';

export async function FeaturedServices() {
  const services = await getFeaturedServices(6);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-gold">What we offer</p>
          <h2 className="mt-2 font-display text-3xl text-text-primary">Featured Services</h2>
        </div>
        <Link href="/services">
          <Button variant="outline" size="sm">
            View all services <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="Services coming soon" description="Check back shortly for our full service menu." />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service._id.toString()} service={service as never} />
          ))}
        </div>
      )}
    </section>
  );
}
