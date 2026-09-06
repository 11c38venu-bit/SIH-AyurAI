import React, { forwardRef } from 'react';
import { AlertCircle, X } from 'lucide-react';

export const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  trailingIcon: TrailingIcon,
  onClear,
  value,
  className = '',
  containerClassName = '',
  id,
  type = 'text',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        </div>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          disabled={disabled}
          required={required}
          className={`
            block w-full rounded-lg text-sm transition-colors duration-150
            bg-white text-slate-900 placeholder:text-slate-400
            border ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:border-ayur-600 focus:ring-ayur-100'}
            focus:outline-none focus:ring-3
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${Icon ? 'pl-9' : 'pl-3.5'}
            ${TrailingIcon || onClear ? 'pr-9' : 'pr-3.5'}
            py-2.5 min-h-[42px]
            ${className}
          `}
          {...props}
        />
        {onClear && value && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!onClear && TrailingIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <TrailingIcon className="h-4 w-4" />
          </div>
        )}
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

Input.displayName = 'Input';
export default Input;
