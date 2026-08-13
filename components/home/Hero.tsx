import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { getActiveBanners, getPublicSiteSettings } from '@/lib/queries/public';

export async function Hero() {
  const [banners, settings] = await Promise.all([
    getActiveBanners('hero'),
    getPublicSiteSettings(),
  ]);

  const banner = banners[0];
  const title = banner?.title || settings.heroTitle || 'Where great style meets great conversation.';
  const subtitle = banner?.subtitle || settings.heroSubtitle || 'Book your next cut with our master barbers.';
  const ctaText = banner?.ctaText || 'Book an Appointment';
  const ctaLink = banner?.ctaLink || '/services';

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0">
        {banner?.imageUrl && (
          <Image src={banner.imageUrl} alt="" fill priority className="object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/40 via-bg-primary/70 to-bg-primary" />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
          {settings.siteName}
        </p>
        <h1 className="mt-5 font-display text-4xl leading-tight text-text-primary sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg">{subtitle}</p>
        <Link href={ctaLink} className="mt-8">
          <Button size="lg">{ctaText}</Button>
        </Link>
      </div>
    </section>
  );
}
