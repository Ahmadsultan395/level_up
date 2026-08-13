import type { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/public/ContactForm';
import { getPublicSiteSettings } from '@/lib/queries/public';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with our team.',
};

export default async function ContactPage() {
  const settings = await getPublicSiteSettings();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">Get in touch</p>
      <h1 className="mt-2 font-display text-4xl text-text-primary">Contact Us</h1>
      <p className="mt-3 max-w-xl text-text-secondary">
        Questions, feedback, or just want to say hello? We&apos;d love to hear from you.
      </p>

      <div className="mt-12 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <ContactForm />
        </div>

        <div className="space-y-5">
          {settings.contactEmail && (
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-gold" />
              <div>
                <p className="text-sm font-medium text-text-primary">Email</p>
                <p className="text-sm text-text-muted">{settings.contactEmail}</p>
              </div>
            </div>
          )}
          {settings.contactPhone && (
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-gold" />
              <div>
                <p className="text-sm font-medium text-text-primary">Phone</p>
                <p className="text-sm text-text-muted">{settings.contactPhone}</p>
              </div>
            </div>
          )}
          {settings.address && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gold" />
              <div>
                <p className="text-sm font-medium text-text-primary">Address</p>
                <p className="text-sm text-text-muted">{settings.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
