import type { Metadata } from 'next';
import { BarbersGrid } from '@/components/public/BarbersGrid';

export const metadata: Metadata = {
  title: 'Barbers',
  description: 'Meet our team of master barbers.',
};

export default function BarbersPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Meet the team</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Our Barbers</h1>
      <p className="mt-3 max-w-xl text-text-secondary">
        Every barber on our team is licensed, experienced, and specialized.
      </p>

      <div className="mt-10">
        <BarbersGrid />
      </div>
    </div>
  );
}
