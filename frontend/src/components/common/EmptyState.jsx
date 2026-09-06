import React from 'react';
import { FileQuestion, Plus } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'No records available',
  description = 'There are currently no items to display in this section.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-400 mb-3.5">
        <Icon className="w-6 h-6 text-ayur-600" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} icon={ActionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
