import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';

export const PublicFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ayur-500 to-teal-700 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-display font-black text-xl tracking-tight text-white">
                AYUR<span className="text-ayur-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              An intelligent clinical intake and digital care management platform designed for modern Ayurvedic hospitals and clinics. Built for Smart India Hackathon (SIH 2026).
            </p>
            <div className="flex items-center gap-2 text-xs text-ayur-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Standardized Charaka & Sushruta Samhita Pre-Intake Engine</span>
            </div>
          </div>

          {/* Clinical Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Application Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/patient" className="hover:text-white transition-colors">Patient Digital Intake</a></li>
              <li><a href="/patient/token" className="hover:text-white transition-colors">Live Token Queue Tracker</a></li>
              <li><a href="/doctor" className="hover:text-white transition-colors">Vaidya Clinical Desk</a></li>
              <li><a href="/staff" className="hover:text-white transition-colors">OPD Frontdesk Counter</a></li>
              <li><a href="/admin" className="hover:text-white transition-colors">Hospital Operations Analytics</a></li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Supported Languages
            </h4>
            <ul className="grid grid-cols-2 gap-1.5 text-xs text-slate-400">
              <li className="text-white font-medium">English</li>
              <li className="text-white font-medium">தமிழ் (Tamil)</li>
              <li className="text-white font-medium">हिन्दी (Hindi)</li>
              <li className="text-white font-medium">മലയാളം (Malayalam)</li>
              <li className="text-white font-medium">తెలుగు (Telugu)</li>
              <li className="text-white font-medium">ಕನ್ನಡ (Kannada)</li>
            </ul>
          </div>
        </div>

        {/* Responsible AI Disclaimer Bottom Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 text-amber-300">
            <HeartHandshake className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Clinical Practitioner Responsibility Notice:</span>
          </div>
          <p className="flex-1 text-slate-400 sm:text-right">
            {t('landing.disclaimer')}
          </p>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 AYURAI Platform. All rights reserved. Smart India Hackathon Submission.</p>
          <div className="flex items-center gap-4">
            <span>Clinical UX v1.0</span>
            <span>Privacy & AYUSH Compliance Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
