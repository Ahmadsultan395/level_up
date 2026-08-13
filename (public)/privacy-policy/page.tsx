import type { Metadata } from 'next';
import { LegalPageContent } from '@/components/public/LegalPageContent';
import { getPublicSiteSettings } from '@/lib/queries/public';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default async function PrivacyPolicyPage() {
  const settings = await getPublicSiteSettings();

  return (
    <LegalPageContent
      title="Privacy Policy"
      content={settings.privacyPolicyContent}
      fallback={`This Privacy Policy explains how ${settings.siteName} collects, uses, and protects your personal information when you use our website and booking services.\n\nWe collect information you provide directly to us, such as your name, email, phone number, and appointment details, in order to process bookings, send confirmations and reminders, and improve our services.\n\nWe do not sell your personal information to third parties. We may share information with service providers (such as payment processors and email/SMS providers) solely to operate our booking system.\n\nYou may request access to, correction of, or deletion of your personal data at any time by contacting us.\n\nThis policy may be updated from time to time; the current version always applies.`}
    />
  );
}
