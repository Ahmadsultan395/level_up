'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { EmptyState, SkeletonTable, ErrorState } from '@/components/shared/States';
import { Card, CardBody } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface OverviewResults {
  services: { _id: string; name: string; slug: string; price: number }[];
  packages: { _id: string; name: string; slug: string; price: number }[];
  barbers: { _id: string; name: string; slug: string }[];
  blogs: { _id: string; title: string; slug: string }[];
}

const SECTION_META: Record<keyof OverviewResults, { label: string; hrefPrefix: string; getLabel: (item: never) => string }> = {
  services: { label: 'Services', hrefPrefix: '/services', getLabel: (i: { name: string }) => i.name },
  packages: { label: 'Packages', hrefPrefix: '/packages', getLabel: (i: { name: string }) => i.name },
  barbers: { label: 'Barbers', hrefPrefix: '/barbers', getLabel: (i: { name: string }) => i.name },
  blogs: { label: 'Blog', hrefPrefix: '/blog', getLabel: (i: { title: string }) => i.title },
};

export function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<OverviewResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((body) => setResults(body.data))
      .catch((err) => {
        if (err.name !== 'AbortError') setError('Search failed. Please try again.');
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [query]);

  function handleSearch(term: string) {
    setQuery(term);
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  }

  const hasAnyResults =
    results && (results.services.length + results.packages.length + results.barbers.length + results.blogs.length) > 0;

  return (
    <div>
      <SearchInput value={query} onChange={handleSearch} placeholder="Search services, packages, barbers, articles..." className="max-w-xl" />

      <div className="mt-10">
        {!query ? (
          <EmptyState
            icon={<SearchIcon className="h-6 w-6" />}
            title="Search The Barber Co."
            description="Find services, packages, barbers, and articles."
          />
        ) : isLoading ? (
          <SkeletonTable rows={4} cols={1} />
        ) : error ? (
          <ErrorState onRetry={() => handleSearch(query)} />
        ) : !hasAnyResults ? (
          <EmptyState title={`No results for "${query}"`} description="Try a different search term." />
        ) : (
          <div className="space-y-10">
            {(Object.keys(SECTION_META) as (keyof OverviewResults)[]).map((key) => {
              const items = results![key];
              if (items.length === 0) return null;
              const meta = SECTION_META[key];

              return (
                <div key={key}>
                  <h2 className="font-display text-xl text-text-primary">{meta.label}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {items.map((item) => (
                      <Link key={item._id} href={`${meta.hrefPrefix}/${item.slug}`}>
                        <Card>
                          <CardBody className="flex items-center justify-between py-3">
                            <span className="text-sm text-text-primary">{meta.getLabel(item as never)}</span>
                            {'price' in item && (
                              <span className="text-sm text-gold">{formatCurrency((item as { price: number }).price)}</span>
                            )}
                          </CardBody>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
