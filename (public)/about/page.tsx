import type { Metadata } from 'next';
import { getFeaturedBarbers, getPublicSiteSettings } from '@/lib/queries/public';
import { BarberCard } from '@/components/shared/BarberCard';
import { EmptyState } from '@/components/shared/States';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return {
    title: 'About',
    description: settings.aboutContent?.slice(0, 155) || `Learn about ${settings.siteName}.`,
  };
}

export default async function AboutPage() {
  const [settings, barbers] = await Promise.all([getPublicSiteSettings(), getFeaturedBarbers(8)]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">About Us</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">The Story Behind {settings.siteName}</h1>

      <div className="mt-8 space-y-4 text-text-secondary">
        {settings.aboutContent ? (
          settings.aboutContent
            .split('\n')
            .filter(Boolean)
            .map((para, i) => <p key={i}>{para}</p>)
        ) : (
          <p>
            {settings.siteName} brings together master barbers and a premium, unhurried atmosphere —
            classic technique, modern style, and genuinely great conversation.
          </p>
        )}
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl text-text-primary">Meet the Team</h2>
        {barbers.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Team coming soon" description="Barber profiles will appear here shortly." />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {barbers.map((barber) => (
              <BarberCard key={barber._id.toString()} barber={barber as never} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
