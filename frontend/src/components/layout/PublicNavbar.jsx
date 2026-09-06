import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, ArrowRight, UserCheck, Stethoscope } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import LanguageSelector from '../common/LanguageSelector';
import Button from '../common/Button';

export const PublicNavbar = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-ayur-600 via-ayur-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-ayur-900/10 ring-2 ring-ayur-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-ayur-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-tight text-slate-900">
                AYUR<span className="text-ayur-700">AI</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ayur-100 text-ayur-900 border border-ayur-300 tracking-wide uppercase">
                SIH 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block leading-tight">
              AI-Assisted Ayurvedic Digital Care Platform
            </p>
          </div>
        </NavLink>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="#problem-solution" className="hover:text-ayur-700 transition-colors">
            {t('landing.solutionTitle')}
          </a>
          <a href="#workflows" className="hover:text-ayur-700 transition-colors">
            {t('landing.patientWorkflow')}
          </a>
          <a href="#features" className="hover:text-ayur-700 transition-colors">
            Features
          </a>
          <a href="#responsible-ai" className="hover:text-ayur-700 transition-colors">
            Responsible AI
          </a>
        </nav>

        {/* Right Actions: Language Selector & Launch Portals */}
        <div className="flex items-center gap-3">
          <LanguageSelector variant="dropdown" />

          <NavLink to="/login">
            <Button variant="outline" size="sm" icon={UserCheck}>
              {t('navigation.login')}
            </Button>
          </NavLink>

          <NavLink to="/patient/register" className="hidden sm:inline-flex">
            <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
              {t('landing.startCaseTaking')}
            </Button>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;
