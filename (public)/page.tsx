import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { FeaturedServices } from '@/components/home/FeaturedServices';
import { FeaturedBarbers } from '@/components/home/FeaturedBarbers';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { getPublicSiteSettings } from '@/lib/queries/public';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return {
    title: settings.seoTitle || settings.siteName,
    description: settings.seoDescription || settings.tagline,
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <FeaturedBarbers />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
