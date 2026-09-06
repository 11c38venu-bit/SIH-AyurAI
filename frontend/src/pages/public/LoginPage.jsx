import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Stethoscope,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth, ROLES } from '../../services/authContext';
import LanguageSelector from '../../components/common/LanguageSelector';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { switchRole, loginWithCredentials, role: currentRole } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(currentRole || ROLES.PATIENT);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [email, setEmail] = useState('doctor@ayurai.com');
  const [password, setPassword] = useState('doctor123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (roleKey) => {
    setSelectedRole(roleKey);
    setIsLoading(true);
    setErrorMessage('');
    try {
      await switchRole(roleKey);
      if (roleKey === ROLES.PATIENT) navigate('/patient');
      else if (roleKey === ROLES.DOCTOR) navigate('/doctor');
      else if (roleKey === ROLES.STAFF) navigate('/staff');
      else if (roleKey === ROLES.ADMIN) navigate('/admin');
    } catch (e) {
      setErrorMessage('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    const result = await loginWithCredentials(email, password);
    setIsLoading(false);

    if (result.success) {
      const userRole = result.role;
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'doctor') navigate('/doctor');
      else if (userRole === 'staff') navigate('/staff');
      else navigate('/patient');
    } else {
      setErrorMessage(result.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const rolesList = [
    {
      role: ROLES.PATIENT,
      title: t('auth.rolePatient'),
      description: t('auth.rolePatientDesc'),
      icon: User,
      badge: 'primary',
      accent: 'ayur',
      route: '/patient'
    },
    {
      role: ROLES.DOCTOR,
      title: t('auth.roleDoctor'),
      description: t('auth.roleDoctorDesc'),
      icon: Stethoscope,
      badge: 'vata',
      accent: 'vata',
      route: '/doctor'
    },
    {
      role: ROLES.STAFF,
      title: t('auth.roleStaff'),
      description: t('auth.roleStaffDesc'),
      icon: Users,
      badge: 'warning',
      accent: 'amber',
      route: '/staff'
    },
    {
      role: ROLES.ADMIN,
      title: t('auth.roleAdmin'),
      description: t('auth.roleAdminDesc'),
      icon: Shield,
      badge: 'kapha',
      accent: 'kapha',
      route: '/admin'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-slate-50 to-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ayur-600 to-teal-800 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-display font-black text-lg tracking-tight text-slate-900">
            AYUR<span className="text-ayur-700">AI</span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          <LanguageSelector variant="dropdown" />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <Badge variant="primary" size="sm">SIH 2026 Interactive Session</Badge>
          <h2 className="text-3xl font-bold text-slate-900">{t('auth.signInTitle')}</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('auth.signInSubtitle')}
          </p>
        </div>

        {errorMessage && (
          <div className="max-w-md mx-auto mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {rolesList.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.role;
            return (
              <div
                key={r.role}
                onClick={() => !isLoading && handleRoleSelect(r.role)}
                className={`
                  p-5 rounded-2xl bg-white border-2 cursor-pointer transition-all duration-200 text-left relative overflow-hidden group
                  ${isSelected
                    ? 'border-ayur-600 shadow-md ring-4 ring-ayur-100'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}
                  ${isLoading ? 'opacity-60 pointer-events-none' : ''}
                `}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-ayur-700 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-ayur-100 group-hover:text-ayur-800 transition-colors'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant={r.badge} size="sm">
                    {r.role.toUpperCase()}
                  </Badge>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center justify-between">
                  <span>{r.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-ayur-700 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Custom Credential Toggle Form */}
        <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="font-semibold text-slate-700">Custom Credentials Login</span>
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-ayur-700 font-medium hover:underline"
            >
              {isCustomMode ? 'Hide Form' : 'Show Form'}
            </button>
          </div>

          {isCustomMode && (
            <form onSubmit={handleCustomSubmit} className="space-y-3.5 pt-1">
              <Input
                label="Email / Username"
                type="text"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign In to System
              </Button>
            </form>
          )}

          {!isCustomMode && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-ayur-600" />
              <span>Instant prototype access active. Click any role card above to test.</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center text-xs text-slate-400 py-2">
        <p>AYURAI • Classical Ayurvedic Patient Care Platform • SIH 2026</p>
      </div>
    </div>
  );
};

export default LoginPage;
