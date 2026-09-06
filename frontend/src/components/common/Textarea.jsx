import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export const Textarea = forwardRef(({
  label,
  error,
  hint,
  maxLength,
  value = '',
  rows = 3,
  className = '',
  containerClassName = '',
  id,
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
          {maxLength && (
            <span className="text-[11px] text-slate-400">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
      )}
      <div className="relative rounded-lg shadow-sm">
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          className={`
            block w-full rounded-lg text-sm transition-colors duration-150
            bg-white text-slate-900 placeholder:text-slate-400
            border ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-ayur-600 focus:ring-ayur-100'}
            focus:outline-none focus:ring-3
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            p-3
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {!error && hint && (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
