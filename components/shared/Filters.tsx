'use client';

import { Select } from '@/components/ui/Input';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  allLabel?: string;
}

/** A single dropdown filter (status, category, barber, etc.) used above lists/tables. */
export function FilterSelect({ label, value, options, onChange, allLabel = 'All' }: FilterSelectProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-text-muted">
      {label}
      <Select value={value || 'all'} onChange={(e) => onChange(e.target.value)} className="min-w-[9rem]">
        <option value="all">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

interface DateRangeFilterProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

/** From/To date filter, used on financial, appointment, and report list views. */
export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-text-muted">
        From
        <input
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          className="h-10 rounded-md border border-border bg-bg-primary px-2 text-sm text-text-primary outline-none focus:border-gold"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-text-muted">
        To
        <input
          type="date"
          value={to}
          onChange={(e) => onChange(from, e.target.value)}
          className="h-10 rounded-md border border-border bg-bg-primary px-2 text-sm text-text-primary outline-none focus:border-gold"
        />
      </label>
    </div>
  );
}
