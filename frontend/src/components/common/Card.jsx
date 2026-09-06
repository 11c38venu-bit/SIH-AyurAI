import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  accent = null, // 'vata' | 'pitta' | 'kapha' | 'ayur' | 'amber'
  onClick,
  ...props
}) => {
  const accentBorders = {
    vata: 'border-l-4 border-l-indigo-500',
    pitta: 'border-l-4 border-l-rose-500',
    kapha: 'border-l-4 border-l-emerald-600',
    ayur: 'border-l-4 border-l-ayur-600',
    amber: 'border-l-4 border-l-amber-500',
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden
        ${accent ? accentBorders[accent] || '' : ''}
        ${hoverEffect ? 'hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', action = null }) => (
  <div className={`p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-4 ${className}`}>
    <div className="space-y-1 flex-1">{children}</div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardTitle = ({ children, className = '', as: Tag = 'h3' }) => (
  <Tag className={`text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2 ${className}`}>
    {children}
  </Tag>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs text-slate-500 font-normal leading-relaxed ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-4 px-5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-3 ${className}`}>
    {children}
  </div>
);

export default Card;
