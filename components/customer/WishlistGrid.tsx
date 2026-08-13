'use client';

import { useEffect, useState } from 'react';
import { ServiceCard } from '@/components/shared/ServiceCard';
import { SkeletonTable, EmptyState, ErrorState } from '@/components/shared/States';
import type { IService } from '@/models/Service';

export function WishlistGrid() {
  const [services, setServices] = useState<(IService & { _id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setIsLoading(true);
    setError(null);
    fetch('/api/customers/me/favorites')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((body) => setServices(body.data || []))
      .catch(() => setError('Could not load your wishlist.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (isLoading) return <SkeletonTable rows={2} cols={3} />;
  if (error) return <ErrorState onRetry={load} />;
  if (services.length === 0) {
    return <EmptyState title="Your wishlist is empty" description="Tap the heart on any service to save it here." />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </div>
  );
}
