import type { Metadata } from 'next';
import { LegalPageContent } from '@/components/public/LegalPageContent';
import { getPublicSiteSettings } from '@/lib/queries/public';

export const metadata: Metadata = { title: 'Refund Policy' };

export default async function RefundPolicyPage() {
  const settings = await getPublicSiteSettings();

  return (
    <LegalPageContent
      title="Refund Policy"
      content={settings.refundPolicyContent}
      fallback={`We want you to be happy with every visit to ${settings.siteName}.\n\nCancellations made at least 24 hours before your scheduled appointment are eligible for a full refund. Cancellations made less than 24 hours in advance may be subject to a cancellation fee.\n\nIf you are not satisfied with a service, please let us know within 48 hours so we can make it right — this may include a complimentary correction or, at our discretion, a partial or full refund.\n\nRefunds are issued to the original payment method and may take several business days to appear on your statement.\n\nPackage and gift card purchases are non-refundable but do not expire.`}
    />
  );
}
