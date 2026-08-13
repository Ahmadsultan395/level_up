import type { Metadata } from 'next';
import { FaqAccordion } from '@/components/public/FaqAccordion';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to frequently asked questions.',
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Need help?</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Frequently Asked Questions</h1>
      <p className="mt-3 text-text-secondary">Can&apos;t find what you&apos;re looking for? Reach out on our Contact page.</p>

      <div className="mt-10">
        <FaqAccordion />
      </div>
    </div>
  );
}
