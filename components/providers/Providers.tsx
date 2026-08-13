'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          },
          success: { iconTheme: { primary: 'var(--color-success)', secondary: 'var(--color-bg-elevated)' } },
          error: { iconTheme: { primary: 'var(--color-danger)', secondary: 'var(--color-bg-elevated)' } },
        }}
      />
    </SessionProvider>
  );
}
