import type { Metadata } from 'next';
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm';

export const metadata: Metadata = { title: 'Website Content | Admin' };

export default function AdminCmsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-3xl text-text-primary">Website Content</h1>
      <p className="mt-1 text-text-secondary">
        Edit homepage, about, legal pages, contact info, and SEO defaults without touching code.
      </p>
      <div className="mt-8">
        <SiteSettingsForm />
      </div>
    </div>
  );
}
