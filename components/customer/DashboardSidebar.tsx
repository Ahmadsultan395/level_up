'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Scissors, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { DASHBOARD_NAV } from '@/config/dashboard-nav';
import { cn } from '@/lib/utils';

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {DASHBOARD_NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              active ? 'bg-gold/10 text-gold' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-border p-5 md:sticky md:top-0 md:block">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-text-primary">
          <Scissors className="h-5 w-5 text-gold" aria-hidden="true" />
          The Barber Co.
        </Link>
        <div className="mt-8">
          <NavLinks />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="mt-8 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:bg-bg-elevated hover:text-status-danger"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </aside>

      {/* Mobile topbar + drawer */}
      <div className="flex items-center justify-between border-b border-border p-4 md:hidden">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-text-primary">
          <Scissors className="h-5 w-5 text-gold" aria-hidden="true" />
          The Barber Co.
        </Link>
        <button aria-label="Open menu" onClick={() => setIsOpen(true)} className="text-text-primary">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="h-screen w-64 overflow-y-auto bg-bg-primary p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg text-text-primary">Menu</span>
              <button aria-label="Close menu" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5 text-text-primary" />
              </button>
            </div>
            <div className="mt-6">
              <NavLinks onNavigate={() => setIsOpen(false)} />
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="mt-8 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-muted hover:text-status-danger"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
          <div className="flex-1 bg-bg-overlay" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
