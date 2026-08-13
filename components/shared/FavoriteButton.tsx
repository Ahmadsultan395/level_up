'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export function FavoriteButton({ serviceId, className }: { serviceId: string; className?: string }) {
  const { status } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') {
      setIsChecking(false);
      return;
    }
    fetch('/api/customers/me/favorites')
      .then((res) => res.json())
      .then((body) => setIsFavorited((body.data || []).some((s: { _id: string }) => s._id === serviceId)))
      .finally(() => setIsChecking(false));
  }, [serviceId, status]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated') {
      toast.error('Log in to save favorites');
      return;
    }

    setIsFavorited((prev) => !prev); // optimistic
    const res = await fetch('/api/customers/me/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId }),
    });
    if (!res.ok) {
      setIsFavorited((prev) => !prev); // rollback
      toast.error('Could not update wishlist');
    }
  }

  if (isChecking) return null;

  return (
    <button
      onClick={toggle}
      aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isFavorited}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-bg-overlay backdrop-blur transition-colors hover:bg-bg-primary',
        className
      )}
    >
      <Heart className={cn('h-4 w-4', isFavorited ? 'fill-gold text-gold' : 'text-text-primary')} />
    </button>
  );
}
