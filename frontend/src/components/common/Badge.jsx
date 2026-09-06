import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-ayur-50 text-ayur-800 border border-ayur-200',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
    // Ayurvedic Dosha Badges
    vata: 'bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold',
    pitta: 'bg-rose-50 text-rose-800 border border-rose-200 font-semibold',
    kapha: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
    tridosha: 'bg-teal-50 text-teal-900 border border-teal-300 font-semibold',
    // Clinical urgency
    urgent: 'bg-rose-100 text-rose-900 border border-rose-300 font-bold animate-pulse',
    waiting: 'bg-amber-50 text-amber-800 border border-amber-200',
    inProgress: 'bg-sky-50 text-sky-800 border border-sky-200',
    completed: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  };

  const dotColors = {
    primary: 'bg-ayur-600',
    secondary: 'bg-slate-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-slate-400',
    vata: 'bg-indigo-500',
    pitta: 'bg-rose-500',
    kapha: 'bg-emerald-600',
    tridosha: 'bg-teal-600',
    urgent: 'bg-rose-600',
    waiting: 'bg-amber-500',
    inProgress: 'bg-sky-500',
    completed: 'bg-emerald-500',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full leading-none
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.neutral}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || 'bg-slate-400'}`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
