export interface NavItem {
  label: string;
  href: string;
}

/**
 * Public site navigation. This list grows as later steps add more public
 * pages (Packages/Gallery/Barbers in Step 6, Blog/FAQ/Reviews in Step 7,
 * Contact/Careers/Legal in Step 8) — update this single file each time
 * rather than hardcoding links in the Header.
 */
export const PUBLIC_NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Packages', href: '/packages' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Before & After', href: '/before-after' },
  { label: 'Barbers', href: '/barbers' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '/careers' },
];

/** First N items shown directly in the desktop nav bar; the rest live under "More". */
export const PUBLIC_NAV_PRIMARY = PUBLIC_NAV.slice(0, 6);
export const PUBLIC_NAV_MORE = PUBLIC_NAV.slice(6);

export const PUBLIC_FOOTER_LINKS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Barbers', href: '/barbers' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '/careers' },
];

export const LEGAL_LINKS: NavItem[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-conditions' },
  { label: 'Refund Policy', href: '/refund-policy' },
];
