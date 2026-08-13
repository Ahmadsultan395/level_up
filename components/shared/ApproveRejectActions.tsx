'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ApproveRejectActionsProps {
  id: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  /** API endpoint that accepts { moderationStatus, rejectReason? } via PATCH */
  endpoint: string;
  onChanged?: (status: 'approved' | 'rejected') => void;
}

/**
 * Reusable Approve/Reject control for anything a customer/public user
 * submits: Reviews (with photos), Testimonials, customer-uploaded Gallery
 * images. Pending items are never shown publicly (see spec section 4/11);
 * once moderated, only the badge remains.
 */
export function ApproveRejectActions({ id, moderationStatus, endpoint, onChanged }: ApproveRejectActionsProps) {
  const [status, setStatus] = useState(moderationStatus);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function updateStatus(newStatus: 'approved' | 'rejected', rejectReason?: string) {
    setIsSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderationStatus: newStatus, rejectReason }),
      });
      if (!res.ok) throw new Error();
      setStatus(newStatus);
      toast.success(newStatus === 'approved' ? 'Approved' : 'Rejected');
      onChanged?.(newStatus);
      setShowRejectModal(false);
      setReason('');
    } catch {
      toast.error('Could not update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (status !== 'pending') {
    return <Badge status={status} />;
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" isLoading={isSaving} onClick={() => updateStatus('approved')}>
        <Check className="h-3.5 w-3.5" /> Approve
      </Button>
      <Button size="sm" variant="danger" disabled={isSaving} onClick={() => setShowRejectModal(true)}>
        <X className="h-3.5 w-3.5" /> Reject
      </Button>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-bg-elevated p-5 shadow-lg">
            <h3 className="font-display text-lg text-text-primary">Reject this submission?</h3>
            <p className="mt-1 text-sm text-text-muted">Optionally add a reason (not shown publicly).</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-md border border-border bg-bg-primary p-2 text-sm text-text-primary outline-none focus:border-gold"
              placeholder="Reason (optional)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" isLoading={isSaving} onClick={() => updateStatus('rejected', reason)}>
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
