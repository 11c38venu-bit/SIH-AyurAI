import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';

export const LanguageSelector = ({
  variant = 'dropdown', // 'dropdown' | 'compact' | 'pills'
  className = '',
}) => {
  const { language, changeLanguage, currentLanguageMeta } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'touch_bar') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`
                p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all duration-150 flex flex-col items-center justify-center text-center gap-0.5 min-h-[56px] sm:min-h-[64px]
                ${isSelected
                  ? 'bg-ayur-700 text-white border-ayur-700 shadow-md ring-4 ring-ayur-100 font-bold scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-ayur-300 hover:bg-slate-50'}
              `}
            >
              <span className="text-sm sm:text-base font-bold leading-tight">{lang.nativeName}</span>
              <span className={`text-[10px] sm:text-[11px] font-medium ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                {lang.name}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`
                px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center gap-2 min-h-[40px]
                ${isSelected
                  ? 'bg-ayur-700 text-white border-ayur-700 shadow-sm font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-ayur-300 hover:bg-slate-50'}
              `}
            >
              <span className="text-sm font-normal opacity-90">{lang.nativeName}</span>
              <span className={`text-[10px] ${isSelected ? 'text-ayur-200' : 'text-slate-400'}`}>
                ({lang.name})
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150
          bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-ayur-500
          ${variant === 'compact' ? 'px-2.5 py-1' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Switch Language / மொழியை மாற்றുക"
      >
        <Globe className="w-3.5 h-3.5 text-ayur-700 shrink-0" />
        <span className="font-semibold text-slate-900">{currentLanguageMeta.nativeName}</span>
        <span className="text-[11px] text-slate-400 hidden sm:inline">({currentLanguageMeta.name})</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-200 ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2">
              Select Language / மொழியை தேர்வு செய்க
            </p>
          </div>
          <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-xs transition-colors
                    ${isSelected ? 'bg-ayur-50 text-ayur-900 font-semibold' : 'text-slate-700 hover:bg-slate-100/80'}
                  `}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">{lang.name} • {lang.region}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-ayur-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
