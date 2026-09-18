import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AuthFieldProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  error?: string;
  required?: boolean;
  hint?: string;
  children?: React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

/**
 * One labelled field for the auth forms.
 *
 * The error is tied to the input with aria-describedby and aria-invalid, which
 * the hand-written fields were missing — a screen reader announced the field as
 * valid while a red message sat under it.
 */
const AuthField: React.FC<AuthFieldProps> = ({
  id,
  label,
  icon: Icon,
  error,
  required,
  hint,
  children,
  inputProps,
}) => {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-900 mb-1">
        {label} {required && <span className="text-red-600" aria-hidden="true">*</span>}
        {required && <span className="sr-only">(required)</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none"
            aria-hidden="true"
          />
        )}
        {children ?? (
          <input
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            className={`w-full bg-white border rounded-lg py-2.5 sm:py-3 pr-3 text-slate-900 placeholder-slate-400
              text-sm sm:text-base transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
              ${Icon ? 'pl-9 sm:pl-10' : 'pl-3'}
              ${error ? 'border-red-400' : 'border-slate-300'}`}
            {...inputProps}
          />
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthField;
