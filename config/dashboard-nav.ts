import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  History,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Star,
  Bell,
  Heart,
  Settings,
  KeyRound,
} from 'lucide-react';

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Appointments', href: '/dashboard/appointments', icon: CalendarCheck },
  { label: 'Booking History', href: '/dashboard/booking-history', icon: History },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },
  { label: 'Gallery', href: '/dashboard/gallery', icon: ImageIcon },
  { label: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Change Password', href: '/dashboard/change-password', icon: KeyRound },
];
