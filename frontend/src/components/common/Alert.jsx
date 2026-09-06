import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Sparkles, X, ShieldAlert } from 'lucide-react';

export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
  icon: CustomIcon,
}) => {
  const styles = {
    info: {
      container: 'bg-sky-50/80 border-sky-200 text-sky-900',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
      title: 'text-sky-900',
    },
    success: {
      container: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
      title: 'text-emerald-900',
    },
    warning: {
      container: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
      title: 'text-amber-900',
    },
    error: {
      container: 'bg-rose-50/80 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
      title: 'text-rose-900',
    },
    ayur: {
      container: 'bg-ayur-50/90 border-ayur-200 text-ayur-950',
      icon: <Sparkles className="w-5 h-5 text-ayur-700 shrink-0 mt-0.5" />,
      title: 'text-ayur-900',
    }
  };

  const currentStyle = styles[variant] || styles.info;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3.5 p-4 rounded-xl border text-sm shadow-xs ${currentStyle.container} ${className}`}
    >
      {CustomIcon ? <CustomIcon className="w-5 h-5 shrink-0 mt-0.5" /> : currentStyle.icon}
      <div className="flex-1 space-y-1">
        {title && <h5 className={`font-semibold text-sm ${currentStyle.title}`}>{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const AiDisclaimerBanner = ({ className = '', compact = false }) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2.5 px-3 rounded-lg bg-teal-50/90 border border-teal-200 text-[11px] text-teal-900 ${className}`}>
        <Sparkles className="w-3.5 h-3.5 text-teal-700 shrink-0" />
        <span className="leading-snug">
          <strong>Responsible AI:</strong> Clinical decision assistance only. All recommendations require verification by a registered Ayurvedic doctor.
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50/50 border border-teal-200/80 text-xs text-teal-950 shadow-xs ${className}`}>
      <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800 shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="space-y-0.5">
        <p className="font-semibold text-teal-900 flex items-center gap-1.5">
          <span>AI Clinical Decision Support Active</span>
          <span className="text-[10px] bg-teal-200/70 text-teal-800 font-medium px-1.5 py-0.2 rounded">Assistive Only</span>
        </p>
        <p className="text-slate-600 text-[11px] leading-relaxed">
          AYURAI synthesizes Ayurvedic classical texts (Charaka & Sushruta Samhitas) to assist case-taking and triage. It does not replace professional medical diagnosis or the clinical judgment of a licensed Ayurvedic practitioner (Vaidya).
        </p>
      </div>
    </div>
  );
};

export default Alert;
