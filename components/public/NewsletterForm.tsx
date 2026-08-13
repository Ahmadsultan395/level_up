'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error || 'Something went wrong.');
        return;
      }

      toast.success(body.message);
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="h-10 flex-1 rounded-md border border-border bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        aria-label="Subscribe"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold text-text-inverse transition-colors hover:bg-gold-bright disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
