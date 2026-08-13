import type { Metadata } from 'next';
import { LegalPageContent } from '@/components/public/LegalPageContent';
import { getPublicSiteSettings } from '@/lib/queries/public';

export const metadata: Metadata = { title: 'Terms & Conditions' };

export default async function TermsPage() {
  const settings = await getPublicSiteSettings();

  return (
    <LegalPageContent
      title="Terms & Conditions"
      content={settings.termsContent}
      fallback={`By booking an appointment with ${settings.siteName}, you agree to the following terms.\n\nAppointments must be booked in advance through our website. We ask that you arrive on time; late arrivals may result in a shortened service or the need to reschedule.\n\nPrices listed on our website are current at time of booking and are subject to change. Payment is due at the time of service unless otherwise arranged.\n\nWe reserve the right to refuse service to anyone behaving in a disruptive or unsafe manner.\n\nThese terms may be updated periodically; continued use of our services constitutes acceptance of the current terms.`}
    />
  );
}
