'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

interface SearchResults {
  customers?: { _id: string; name: string; email: string }[];
  appointments?: { _id: string; date: string; startTime: string; status: string; customer?: { name: string } }[];
  services?: { _id: string; name: string; slug: string }[];
  packages?: { _id: string; name: string; slug: string }[];
  invoices?: { _id: string; invoiceNumber: string; total: number; status: string }[];
  barbers?: { _id: string; name: string; slug: string }[];
  blogs?: { _id: string; title: string; slug: string }[];
  messages?: { _id: string; name: string; subject: string; status: string }[];
}

const SECTION_ROUTES: Record<keyof SearchResults, (id: string) => string> = {
  customers: () => '/admin/users',
  appointments: (id) => `/admin/appointments/${id}`,
  services: () => '/admin/services',
  packages: () => '/admin/packages',
  invoices: () => '/admin/invoices',
  barbers: (id) => `/admin/barbers/${id}`,
  blogs: (id) => `/admin/blogs/${id}`,
  messages: (id) => `/admin/messages/${id}`,
};

const SECTION_LABELS: Record<keyof SearchResults, string> = {
  customers: 'Customers',
  appointments: 'Appointments',
  services: 'Services',
  packages: 'Packages',
  invoices: 'Invoices',
  barbers: 'Barbers',
  blogs: 'Blog Posts',
  messages: 'Messages',
};

function getLabel(section: keyof SearchResults, item: Record<string, unknown>): string {
  switch (section) {
    case 'customers':
      return `${item.name} (${item.email})`;
    case 'appointments':
      return `${item.date} ${item.startTime} — ${(item.customer as { name: string } | undefined)?.name || 'Unknown'}`;
    case 'invoices':
      return `${item.invoiceNumber} — ${item.status}`;
    case 'messages':
      return `${item.name}: ${item.subject}`;
    default:
      return (item.title as string) || (item.name as string) || 'Untitled';
  }
}

export function AdminGlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({});
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((body) => setResults(body.data || {}))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-text-muted hover:border-gold hover:text-text-primary"
      >
        <Search className="h-4 w-4" />
        Search everything...
        <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-xs">⌘K</kbd>
      </button>
    );
  }

  const sections = Object.keys(SECTION_LABELS) as (keyof SearchResults)[];
  const hasResults = sections.some((s) => (results[s]?.length ?? 0) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-bg-overlay p-4 pt-24" onClick={() => setIsOpen(false)}>
      <div
        className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-bg-elevated shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border p-3">
          <Search className="h-4 w-4 text-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, appointments, invoices, barbers, blogs, messages..."
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-text-muted" />}
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {!query || query.length < 2 ? (
            <p className="p-4 text-center text-sm text-text-muted">Type at least 2 characters to search.</p>
          ) : !isLoading && !hasResults ? (
            <p className="p-4 text-center text-sm text-text-muted">No results for &quot;{query}&quot;</p>
          ) : (
            sections.map((section) => {
              const items = results[section];
              if (!items || items.length === 0) return null;
              return (
                <div key={section} className="mb-2">
                  <p className="px-2 py-1 text-xs uppercase tracking-wide text-text-muted">{SECTION_LABELS[section]}</p>
                  {items.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => {
                        router.push(SECTION_ROUTES[section](item._id));
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className="block w-full rounded-md px-2 py-2 text-left text-sm text-text-primary hover:bg-bg-secondary"
                    >
                      {getLabel(section, item as unknown as Record<string, unknown>)}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
