import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/utils/constants";
import type { ISettings } from "@/models/Settings";

const socialIcons: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube
};

export default function Footer({ settings }: { settings?: Partial<ISettings> | null }) {
  const socials = settings?.socialLinks || {};

  return (
    <footer className="bg-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="font-display text-xl font-extrabold text-primary">{SITE_NAME}</h3>
          <p className="mt-4 text-sm leading-relaxed text-dark-100">
            {settings?.footerText || "We build digital products and experiences that help brands grow."}
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Quick Links</h4>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-dark-100 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Contact</h4>
          <ul className="space-y-3 text-sm text-dark-100">
            {settings?.email && (
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary" /> {settings.email}
              </li>
            )}
            {settings?.phone && (
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary" /> {settings.phone}
              </li>
            )}
            {settings?.address && (
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" /> {settings.address}
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Follow Us</h4>
          <div className="flex gap-3">
            {Object.entries(socials).map(([key, url]) => {
              const Icon = socialIcons[key];
              if (!url || !Icon) return null;
              return (
                <a
                  key={key}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary hover:text-dark"
                >
                  <Icon size={17} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-dark-200">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
