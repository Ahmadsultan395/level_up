import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full h-10 rounded-md border bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted',
            'transition-colors duration-200 outline-none',
            error ? 'border-status-danger' : 'border-border focus:border-gold',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'w-full h-10 rounded-md border bg-bg-primary px-3 text-sm text-text-primary',
            'transition-colors duration-200 outline-none',
            error ? 'border-status-danger' : 'border-border focus:border-gold',
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-status-danger">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
