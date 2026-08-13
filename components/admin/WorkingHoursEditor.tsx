'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { BarberInput } from '@/validations/barber';

type WorkingHours = BarberInput['workingHours'];

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};
const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface Props {
  value: WorkingHours;
  onChange: (value: WorkingHours) => void;
}

export function WorkingHoursEditor({ value, onChange }: Props) {
  const byDay = new Map(value.map((wh) => [wh.day, wh]));

  function updateDay(day: string, updates: Partial<WorkingHours[number]>) {
    onChange(value.map((wh) => (wh.day === day ? { ...wh, ...updates } : wh)));
  }

  function addBreak(day: string) {
    const wh = byDay.get(day);
    if (!wh) return;
    updateDay(day, { breaks: [...wh.breaks, { startTime: '13:00', endTime: '14:00' }] });
  }

  function updateBreak(day: string, index: number, updates: Partial<{ startTime: string; endTime: string }>) {
    const wh = byDay.get(day);
    if (!wh) return;
    const breaks = wh.breaks.map((b, i) => (i === index ? { ...b, ...updates } : b));
    updateDay(day, { breaks });
  }

  function removeBreak(day: string, index: number) {
    const wh = byDay.get(day);
    if (!wh) return;
    updateDay(day, { breaks: wh.breaks.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      {DAY_ORDER.map((day) => {
        const wh = byDay.get(day);
        if (!wh) return null;
        return (
          <div key={day} className="rounded-md border border-border p-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex w-28 items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={!wh.isOff}
                  onChange={(e) => updateDay(day, { isOff: !e.target.checked })}
                  className="h-4 w-4 accent-[var(--color-gold)]"
                />
                {DAY_LABELS[day]}
              </label>

              {!wh.isOff && (
                <>
                  <input
                    type="time"
                    value={wh.startTime}
                    onChange={(e) => updateDay(day, { startTime: e.target.value })}
                    className="h-9 rounded-md border border-border bg-bg-primary px-2 text-sm text-text-primary"
                  />
                  <span className="text-text-muted">to</span>
                  <input
                    type="time"
                    value={wh.endTime}
                    onChange={(e) => updateDay(day, { endTime: e.target.value })}
                    className="h-9 rounded-md border border-border bg-bg-primary px-2 text-sm text-text-primary"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => addBreak(day)}>
                    <Plus className="h-3.5 w-3.5" /> Break
                  </Button>
                </>
              )}
            </div>

            {!wh.isOff && wh.breaks.length > 0 && (
              <div className="mt-2 space-y-2 pl-8">
                {wh.breaks.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Break:</span>
                    <input
                      type="time"
                      value={b.startTime}
                      onChange={(e) => updateBreak(day, i, { startTime: e.target.value })}
                      className="h-8 rounded-md border border-border bg-bg-primary px-2 text-xs text-text-primary"
                    />
                    <span className="text-xs text-text-muted">to</span>
                    <input
                      type="time"
                      value={b.endTime}
                      onChange={(e) => updateBreak(day, i, { endTime: e.target.value })}
                      className="h-8 rounded-md border border-border bg-bg-primary px-2 text-xs text-text-primary"
                    />
                    <button type="button" onClick={() => removeBreak(day, i)} aria-label="Remove break">
                      <X className="h-3.5 w-3.5 text-text-muted hover:text-status-danger" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
