import type { Metadata } from 'next';
import { BeforeAfterGrid } from '@/components/public/BeforeAfterGrid';

export const metadata: Metadata = {
  title: 'Before & After',
  description: 'Real transformations by our barbers.',
};

export default function BeforeAfterPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">The transformation</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Before &amp; After</h1>
      <p className="mt-3 max-w-xl text-text-secondary">
        Drag the slider to see the difference our barbers make.
      </p>

      <div className="mt-10">
        <BeforeAfterGrid />
      </div>
    </div>
  );
}
