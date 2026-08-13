'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

interface BookCTAProps {
  serviceSlug?: string;
  packageId?: string;
  barberSlug?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  fullWidth?: boolean;
}

/**
 * The single "Book" call-to-action used across Service/Package/Barber
 * detail pages. Logged-in customers go straight into the booking wizard
 * with their selection preloaded; everyone else is sent to log in first,
 * then bounced into the same booking flow via callbackUrl.
 */
export function BookCTA({ serviceSlug, packageId, barberSlug, size = 'lg', className, label = 'Book an Appointment', fullWidth }: BookCTAProps) {
  const { status } = useSession();

  const bookingParams = new URLSearchParams();
  if (serviceSlug) bookingParams.set('service', serviceSlug);
  if (packageId) bookingParams.set('package', packageId);
  if (barberSlug) bookingParams.set('barber', barberSlug);
  const bookingUrl = `/dashboard/book${bookingParams.toString() ? `?${bookingParams}` : ''}`;

  const href = status === 'authenticated' ? bookingUrl : `/login?callbackUrl=${encodeURIComponent(bookingUrl)}`;

  return (
    <Link href={href} className={className}>
      <Button size={size} className={fullWidth ? 'w-full' : undefined}>
        {status === 'authenticated' ? label : 'Log in to Book'}
      </Button>
    </Link>
  );
}
