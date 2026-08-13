'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Select } from '@/components/ui/Input';

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const;

export function AppointmentStatusSelect({
  id,
  status,
  onChanged,
}: {
  id: string;
  status: string;
  onChanged?: (status: string) => void;
}) {
  const [current, setCurrent] = useState(status);
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(newStatus: string) {
    const previous = current;
    setCurrent(newStatus); // optimistic
    setIsSaving(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error || 'Could not update status');
        setCurrent(previous);
        return;
      }
      toast.success('Status updated');
      onChanged?.(newStatus);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Select
      value={current}
      disabled={isSaving}
      onChange={(e) => handleChange(e.target.value)}
      className="h-8 min-w-[9rem] text-xs capitalize"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s.replace('_', ' ')}
        </option>
      ))}
    </Select>
  );
}
