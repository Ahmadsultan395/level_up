'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface StatusToggleProps {
  id: string;
  status: 'active' | 'inactive';
  /** API endpoint that accepts { status } via PATCH, e.g. `/api/barbers/${id}/status` */
  endpoint: string;
  label?: string;
  onChanged?: (newStatus: 'active' | 'inactive') => void;
  disabled?: boolean;
}

/**
 * Single reusable Active/Inactive switch. Used across Barbers, Services,
 * Packages, Categories, Blogs, Gallery, Before/After, Testimonials,
 * Banners, FAQs, Coupons — anywhere the spec requires a visibility toggle
 * on the public site. Optimistically updates, rolls back on failure.
 */
export function StatusToggle({ id, status, endpoint, label, onChanged, disabled }: StatusToggleProps) {
  const [current, setCurrent] = useState(status);
  const [isSaving, setIsSaving] = useState(false);
  const isActive = current === 'active';

  async function toggle() {
    const next = isActive ? 'inactive' : 'active';
    setCurrent(next); // optimistic
    setIsSaving(true);

    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next === 'active' ? 'Activated' : 'Deactivated');
      onChanged?.(next);
    } catch {
      setCurrent(isActive ? 'active' : 'inactive'); // rollback
      toast.error('Could not update status. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={label ?? (isActive ? 'Active — click to deactivate' : 'Inactive — click to activate')}
      disabled={disabled || isSaving}
      onClick={toggle}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50',
        isActive ? 'bg-status-success' : 'bg-bg-elevated border border-border'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-text-primary transition-transform duration-200',
          isActive ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}
