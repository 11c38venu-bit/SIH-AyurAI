import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Globe2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  UserPlus,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import AccessModeSelector from '../../components/patient/AccessModeSelector';

export const PatientWelcome = () => {
  const { language, changeLanguage, t, currentLanguageMeta } = useTranslation();
  const navigate = useNavigate();
  const [selectedAccessMode, setSelectedAccessMode] = useState('kiosk');

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
  };

  const handleProceed = () => {
    navigate('/patient/register');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ayur-100 text-ayur-900 text-xs font-semibold border border-ayur-300 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-ayur-700" />
          <span>Patient Intake Portal • Smartphone & Hospital Kiosk</span>
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          {t('welcome.title')}
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed">
          {t('welcome.subtitle')}
        </p>
      </div>

      {/* Step 1: Language Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-ayur-700" />
            <span>Step 1: {t('welcome.chooseLanguage')}</span>
          </h3>
          <span className="text-xs text-slate-400">
            Current: <strong className="text-ayur-800">{currentLanguageMeta.nativeName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`
                  p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative text-center bg-white
                  ${isSelected
                    ? 'border-ayur-600 shadow-md ring-4 ring-ayur-100 bg-gradient-to-b from-ayur-50/70 to-white scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/50'}
                `}
              >
                <span className="text-lg font-bold font-display text-slate-900 leading-tight block">
                  {lang.nativeName}
                </span>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">{lang.name}</p>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-ayur-700 text-white flex items-center justify-center mx-auto mt-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: "How would you like to continue?" Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-ayur-700" />
            <span>Step 2: Access Mode Selection</span>
          </h3>
          <Badge variant="primary" size="sm">2 Access Modes</Badge>
        </div>

        <AccessModeSelector
          selectedMode={selectedAccessMode}
          onSelectMode={(mode) => setSelectedAccessMode(mode)}
          redirectRoute="/patient/register"
        />
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
        <span>
          AYURAI is an intelligent intake assistant designed for clinical decision support. Both smartphone and kiosk access modes share the exact same clinical records and OPD queue.
        </span>
      </div>
    </div>
  );
};

export default PatientWelcome;
