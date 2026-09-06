import React from 'react';
import { Check } from 'lucide-react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'ayur', // 'ayur' | 'emerald' | 'amber' | 'indigo' | 'rose'
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantColors = {
    ayur: 'bg-ayur-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-600',
    rose: 'bg-rose-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeStyles[size] || sizeStyles.md}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${variantColors[variant] || variantColors.ayur}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const StepProgress = ({
  steps = [],
  currentStep = 0,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
        {/* Active Connecting Line */}
        <div
          className="absolute top-4 left-6 h-0.5 bg-ayur-600 -z-0 transition-all duration-300"
          style={{
            width: steps.length > 1 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%',
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div
              key={idx}
              onClick={() => onStepClick && (isCompleted || isCurrent) && onStepClick(idx)}
              className={`flex flex-col items-center relative z-10 ${
                onStepClick && (isCompleted || isCurrent) ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200
                  ${isCompleted ? 'bg-ayur-700 text-white shadow-xs' : ''}
                  ${isCurrent ? 'bg-white border-2 border-ayur-700 text-ayur-800 ring-4 ring-ayur-100 shadow-sm' : ''}
                  ${isPending ? 'bg-white border-2 border-slate-300 text-slate-400' : ''}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4 text-white" /> : idx + 1}
              </div>
              <span
                className={`
                  mt-2 text-[11px] font-medium max-w-[90px] text-center leading-tight
                  ${isCurrent ? 'text-ayur-900 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'}
                `}
              >
                {step.title || step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DoshaMeter = ({
  vata = 33,
  pitta = 33,
  kapha = 34,
  showLegend = true,
  className = '',
}) => {
  const total = (vata + pitta + kapha) || 100;
  const vPct = Math.round((vata / total) * 100);
  const pPct = Math.round((pitta / total) * 100);
  const kPct = 100 - vPct - pPct;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Combined Bar */}
      <div className="h-3.5 w-full flex rounded-full overflow-hidden shadow-xs bg-slate-100 p-0.5 gap-0.5">
        <div
          className="bg-indigo-500 h-full rounded-l-full transition-all duration-300"
          style={{ width: `${vPct}%` }}
          title={`Vata: ${vPct}%`}
        />
        <div
          className="bg-rose-500 h-full transition-all duration-300"
          style={{ width: `${pPct}%` }}
          title={`Pitta: ${pPct}%`}
        />
        <div
          className="bg-emerald-600 h-full rounded-r-full transition-all duration-300"
          style={{ width: `${kPct}%` }}
          title={`Kapha: ${kPct}%`}
        />
      </div>

      {showLegend && (
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-slate-600 font-medium">Vata: <strong className="text-indigo-900">{vPct}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 font-medium">Pitta: <strong className="text-rose-900">{pPct}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="text-slate-600 font-medium">Kapha: <strong className="text-emerald-900">{kPct}%</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
