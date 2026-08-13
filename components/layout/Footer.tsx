import Link from 'next/link';
import { Scissors, Facebook, Instagram, Twitter } from 'lucide-react';
import { PUBLIC_FOOTER_LINKS, LEGAL_LINKS } from '@/config/nav';
import { getPublicSiteSettings } from '@/lib/queries/public';
import { NewsletterForm } from '@/components/public/NewsletterForm';

const SOCIAL_ICONS: Record<string, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
};

export async function Footer() {
  const settings = await getPublicSiteSettings();

  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-lg text-text-primary">
              <Scissors className="h-5 w-5 text-gold" aria-hidden="true" />
              {settings.siteName}
            </Link>
            {settings.tagline && <p className="mt-3 text-sm text-text-muted">{settings.tagline}</p>}

            {settings.socialLinks.length > 0 && (
              <div className="mt-4 flex gap-3">
                {settings.socialLinks.map((link) => {
                  const Icon = SOCIAL_ICONS[link.platform.toLowerCase()];
                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="text-text-muted transition-colors hover:text-gold"
                    >
                      {Icon ? <Icon className="h-5 w-5" /> : link.platform}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-wide text-text-secondary">Navigate</h3>
            <ul className="mt-4 space-y-2">
              {PUBLIC_FOOTER_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-text-muted hover:text-text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-wide text-text-secondary">Legal</h3>
            <ul className="mt-4 space-y-2">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-text-muted hover:text-text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {(settings.contactEmail || settings.contactPhone || settings.address) && (
              <ul className="mt-6 space-y-2 text-sm text-text-muted">
                {settings.contactEmail && <li>{settings.contactEmail}</li>}
                {settings.contactPhone && <li>{settings.contactPhone}</li>}
                {settings.address && <li>{settings.address}</li>}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-wide text-text-secondary">Newsletter</h3>
            <p className="mt-4 text-sm text-text-muted">Grooming tips and offers, straight to your inbox.</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-text-muted">
          {settings.footerText || `© ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}
