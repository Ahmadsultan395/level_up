'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, X, Scissors, Search, ChevronDown } from 'lucide-react';
import { PUBLIC_NAV, PUBLIC_NAV_PRIMARY, PUBLIC_NAV_MORE } from '@/config/nav';
import { Button } from '@/components/ui/Button';
import { BookCTA } from '@/components/public/BookCTA';
import { cn } from '@/lib/utils';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-text-primary">
          <Scissors className="h-5 w-5 text-gold" aria-hidden="true" />
          The Barber Co.
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {PUBLIC_NAV_PRIMARY.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm transition-colors',
                  active ? 'text-gold' : 'text-text-secondary hover:text-text-primary'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}

          {PUBLIC_NAV_MORE.length > 0 && (
            <div className="relative" onMouseEnter={() => setIsMoreOpen(true)} onMouseLeave={() => setIsMoreOpen(false)}>
              <button
                className={cn(
                  'flex items-center gap-1 text-sm transition-colors',
                  PUBLIC_NAV_MORE.some((i) => i.href === pathname) ? 'text-gold' : 'text-text-secondary hover:text-text-primary'
                )}
                aria-expanded={isMoreOpen}
                aria-haspopup="true"
              >
                More <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {isMoreOpen && (
                <div className="absolute left-0 top-full pt-2">
                  <div className="w-48 rounded-md border border-border bg-bg-elevated py-2 shadow-lg">
                    {PUBLIC_NAV_MORE.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'block px-4 py-2 text-sm transition-colors',
                          pathname === item.href ? 'text-gold' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/search" aria-label="Search" className="text-text-secondary hover:text-text-primary">
            <Search className="h-5 w-5" />
          </Link>
          {status === 'authenticated' ? (
            <Link href={session.user.role === 'customer' ? '/dashboard' : '/admin'}>
              <Button variant="secondary" size="sm">
                {session.user.role === 'customer' ? 'My Dashboard' : 'Admin Panel'}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <BookCTA size="sm" label="Book Now" />
            </>
          )}
        </div>

        <button
          className="text-text-primary md:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <nav className="border-t border-border bg-bg-primary px-6 pb-6 pt-2 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-4">
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
            >
              <Search className="h-4 w-4" /> Search
            </Link>
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {status === 'authenticated' ? (
                <Link href={session.user.role === 'customer' ? '/dashboard' : '/admin'}>
                  <Button variant="secondary" size="sm" className="w-full">
                    {session.user.role === 'customer' ? 'My Dashboard' : 'Admin Panel'}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <BookCTA size="sm" label="Book Now" fullWidth />
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
