import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center font-mono text-xs uppercase tracking-widest text-gold">
          The Barber Co.
        </Link>
        {children}
      </div>
    </main>
  );
}
