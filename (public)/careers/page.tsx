import type { Metadata } from 'next';
import { CareerApplyForm } from '@/components/public/CareerApplyForm';
import { getPublicSiteSettings } from '@/lib/queries/public';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join our team of master barbers.',
};

export default async function CareersPage() {
  const settings = await getPublicSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Join the team</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Careers at {settings.siteName}</h1>
      <p className="mt-3 text-text-secondary">
        {settings.careersIntro ||
          "We're always looking for talented barbers and front-of-house staff who take pride in their craft. Tell us about yourself below."}
      </p>

      <div className="mt-10">
        <CareerApplyForm />
      </div>
    </div>
  );
}
