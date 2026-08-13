import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Scissors, FolderTree, ListChecks, PackageIcon, CalendarCheck, Star, MessageSquareQuote, Image as ImageIcon, GitCompare, Newspaper, HelpCircle, GalleryHorizontal, FileEdit, Mail, MessageCircle, FileText, CreditCard, Receipt, DollarSign, Ticket, BarChart3, Users, Palette, ScrollText, DatabaseBackup, Megaphone } from 'lucide-react';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/**
 * Admin sidebar navigation, grouped to match the spec's Admin Panel module
 * list. New groups/items are appended here as each admin step (13–19)
 * ships — this file is the single source of truth, same pattern as the
 * public/customer nav configs.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    label: 'Team',
    items: [{ label: 'Barbers', href: '/admin/barbers', icon: Scissors }],
  },
  {
    label: 'Bookings',
    items: [{ label: 'Appointments', href: '/admin/appointments', icon: CalendarCheck }],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Services', href: '/admin/services', icon: ListChecks },
      { label: 'Packages', href: '/admin/packages', icon: PackageIcon },
      { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    ],
  },
  {
    label: 'Content Moderation',
    items: [
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
      { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
      { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
      { label: 'Before & After', href: '/admin/before-after', icon: GitCompare },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Blog', href: '/admin/blogs', icon: Newspaper },
      { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
      { label: 'Banners', href: '/admin/banners', icon: GalleryHorizontal },
    ],
  },
  {
    label: 'Communications',
    items: [
      { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
      { label: 'Messages', href: '/admin/messages', icon: MessageCircle },
      { label: 'Email Templates', href: '/admin/email-templates', icon: FileText },
      { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
      { label: 'Invoices', href: '/admin/invoices', icon: Receipt },
      { label: 'Expenses', href: '/admin/expenses', icon: DollarSign },
      { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Users & Roles', href: '/admin/users', icon: Users },
      { label: 'Website Content', href: '/admin/cms', icon: FileEdit },
      { label: 'Theme', href: '/admin/theme', icon: Palette },
      { label: 'Activity Logs', href: '/admin/activity-logs', icon: ScrollText },
      { label: 'Backups', href: '/admin/backups', icon: DatabaseBackup },
    ],
  },
];
