import type { Metadata } from 'next';
import { PriceListTable } from '@/components/public/PriceListTable';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Full pricing for all services and packages.',
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Transparent pricing</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Pricing</h1>
      <p className="mt-3 max-w-xl text-text-secondary">
        No hidden fees. Every price includes a full consultation with your barber.
      </p>

      <div className="mt-12">
        <h2 className="font-display text-2xl text-text-primary">Services</h2>
        <div className="mt-4">
          <PriceListTable endpoint="/api/services" paramPrefix="svc" categoryType="service" />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl text-text-primary">Packages</h2>
        <div className="mt-4">
          <PriceListTable endpoint="/api/packages" paramPrefix="pkg" />
        </div>
      </div>
    </div>
  );
}
