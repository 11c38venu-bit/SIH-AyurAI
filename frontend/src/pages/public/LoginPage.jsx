import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  AlertCircle,
  KeyRound,
  ShieldCheck
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
  const [searchParams] = useSearchParams();

  const queryRole = searchParams.get('role');
  const queryRedirect = searchParams.get('redirect');

  const getRoleEmail = (roleKey) => {
    if (roleKey === ROLES.DOCTOR) return 'doctor@demo.ayurai';
    if (roleKey === ROLES.STAFF) return 'staff@demo.ayurai';
    if (roleKey === ROLES.ADMIN) return 'admin@demo.ayurai';
    if (roleKey === ROLES.PATIENT) return 'patient@demo.ayurai';
    return '';
  };

  const initialRole = queryRole && [ROLES.PATIENT, ROLES.DOCTOR, ROLES.STAFF, ROLES.ADMIN].includes(queryRole.toLowerCase())
    ? queryRole.toLowerCase()
    : (currentRole || ROLES.DOCTOR);

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [email, setEmail] = useState(() => getRoleEmail(initialRole));
  const [password, setPassword] = useState('demo123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (queryRole && [ROLES.PATIENT, ROLES.DOCTOR, ROLES.STAFF, ROLES.ADMIN].includes(queryRole.toLowerCase())) {
      const roleKey = queryRole.toLowerCase();
      setSelectedRole(roleKey);
      setEmail(getRoleEmail(roleKey));
    }
  }, [queryRole]);

  // 1-Click Instant Login for Demo Role Selection
  const handleRoleSelect = async (roleKey) => {
    setSelectedRole(roleKey);
    setErrorMessage('');
    setIsLoading(true);

    try {
      switchRole(roleKey);
      let destination = `/${roleKey}`;
      if (queryRedirect && queryRedirect.startsWith(`/${roleKey}`)) {
        destination = queryRedirect;
      }
      navigate(destination);
    } catch (e) {
      setErrorMessage('Failed to sign in. Please try entering credentials below.');
      setEmail(getRoleEmail(roleKey));
      setIsCustomMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter an email or username.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    const result = await loginWithCredentials(email, password || 'demo123');
    setIsLoading(false);

    if (result.success) {
      const userRole = result.role || 'doctor';
      let destination = `/${userRole}`;
      if (queryRedirect && queryRedirect.startsWith(`/${userRole}`)) {
        destination = queryRedirect;
      }
      navigate(destination);
    } else {
      setErrorMessage(result.message || 'Authentication failed.');
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
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            SIH DEMO MODE
          </span>
          <LanguageSelector variant="dropdown" />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="primary" size="sm">SIH 2026 Interactive Session</Badge>
          <h2 className="text-3xl font-bold text-slate-900">{t('auth.signInTitle')}</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Click any role card below for <strong>instant 1-click access</strong> into the AYURAI workspace.
          </p>
        </div>

        {errorMessage && (
          <div className="max-w-md mx-auto p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                  {r.description}
                </p>
                <span className="text-[11px] text-teal-800 font-bold flex items-center gap-1 group-hover:underline">
                  <span>Instant 1-Click Enter →</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Demo Credentials Reference Box */}
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-teal-700" />
              <span>Demo Credentials (Password: demo123)</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-ayur-700 font-semibold hover:underline"
            >
              {isCustomMode ? 'Hide Custom Login' : 'Enter Custom Login'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Doctor (Vaidya)</span>
              <strong className="text-slate-900 block font-mono">doctor@demo.ayurai</strong>
              <span className="text-[10px] text-teal-700">demo123</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Frontdesk Staff</span>
              <strong className="text-slate-900 block font-mono">staff@demo.ayurai</strong>
              <span className="text-[10px] text-teal-700">demo123</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Hospital Admin</span>
              <strong className="text-slate-900 block font-mono">admin@demo.ayurai</strong>
              <span className="text-[10px] text-teal-700">demo123</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Patient Portal</span>
              <strong className="text-slate-900 block font-mono">patient@demo.ayurai</strong>
              <span className="text-[10px] text-teal-700">demo123</span>
            </div>
          </div>

          {isCustomMode && (
            <form onSubmit={handleCustomSubmit} className="space-y-3 pt-3 border-t border-slate-100">
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
                Sign In with Credentials
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="text-center text-xs text-slate-400 py-2">
        <p>AYURAI • Classical Ayurvedic Patient Care Platform • SIH 2026 Interactive Session</p>
      </div>
    </div>
  );
};

export default LoginPage;
