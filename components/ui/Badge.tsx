import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Central status badge. Every status shown anywhere in the app — Active/
 * Inactive toggles, Approve/Reject moderation, appointment status, payment
 * status, message status — should map to one of these tones so the visual
 * language stays consistent across admin, customer, and public views.
 */
type Tone = 'success' | 'danger' | 'warning' | 'info' | 'pending' | 'neutral';

const toneClasses: Record<Tone, string> = {
  success: 'bg-status-successBg text-status-success',
  danger: 'bg-status-dangerBg text-status-danger',
  warning: 'bg-status-warningBg text-status-warning',
  info: 'bg-status-infoBg text-status-info',
  pending: 'bg-status-pendingBg text-status-pending',
  neutral: 'bg-bg-elevated text-text-muted',
};

/** Maps common status strings to a visual tone automatically. */
export function statusToTone(status: string): Tone {
  const s = status.toLowerCase();
  if (['active', 'approved', 'confirmed', 'completed', 'paid', 'resolved'].includes(s)) return 'success';
  if (['inactive', 'rejected', 'cancelled', 'failed', 'no_show'].includes(s)) return 'danger';
  if (['pending', 'new'].includes(s)) return 'pending';
  if (['in_progress', 'partially_refunded'].includes(s)) return 'info';
  if (['archived', 'refunded'].includes(s)) return 'neutral';
  return 'neutral';
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** If provided instead of `tone`, the tone is derived automatically from the status text. */
  status?: string;
}

export function Badge({ className, tone, status, children, ...props }: BadgeProps) {
  const resolvedTone = tone ?? (status ? statusToTone(status) : 'neutral');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize',
        toneClasses[resolvedTone],
        className
      )}
      {...props}
    >
      {children ?? status?.replace('_', ' ')}
    </span>
  );
}
