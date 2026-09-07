import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  UserPlus,
  Clock,
  ClipboardList,
  Activity,
  FileText,
  CheckCircle,
  Calendar,
  Users,
  Stethoscope,
  FileCheck,
  BarChart3,
  Settings,
  Sparkles,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Layers,
  X
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import Badge from '../common/Badge';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { t } = useTranslation();
  const { role, user, switchRole } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'patient':
        return [
          { to: '/patient', icon: Home, label: 'Dashboard & Tracker', end: true },
          { to: '/patient/welcome', icon: Sparkles, label: 'Language Selection' },
          { to: '/patient/register', icon: UserPlus, label: '1. Registration' },
          { to: '/patient/token', icon: Clock, label: '2. Token Tracker', badge: user?.tokenNumber },
          { to: '/patient/case-taking', icon: ClipboardList, label: '3. AI Case Taking', highlight: true },
          { to: '/patient/assessment', icon: Activity, label: '4. Ayurvedic Assessment' },
          { to: '/patient/medical-history', icon: FileText, label: '5. Medical History' },
          { to: '/patient/documents', icon: FileCheck, label: '6. Health Records' },
          { to: '/patient/summary', icon: CheckCircle, label: '7. Case Summary' },
          { to: '/patient/red-flags', icon: ShieldCheck, label: '8. Red Flags Screening' },
          { to: '/patient/status', icon: Layers, label: '9-10. OPD Queue & Doctor' },
          { to: '/patient/follow-up', icon: Calendar, label: '11-13. Rx & Care Tracking' },
        ];
      case 'doctor':
        return [
          { to: '/doctor', icon: Home, label: t('navigation.home'), end: true },
          { to: '/doctor/queue', icon: Clock, label: t('navigation.opdQueue'), badge: '4 Waiting' },
          { to: '/doctor/patients', icon: Users, label: t('navigation.patientRecords') },
          { to: '/doctor/patient/pat-101', icon: ClipboardList, label: 'Patient 360° EHR' },
          { to: '/doctor/consultation/pat-101', icon: Stethoscope, label: t('navigation.consultation'), highlight: true },
          { to: '/doctor/prescription/pat-101', icon: FileCheck, label: t('navigation.prescription') },
        ];
      case 'staff':
        return [
          { to: '/staff', icon: Home, label: 'Frontdesk Overview', end: true },
          { to: '/staff/registration', icon: UserPlus, label: 'Desk OPD Intake' },
          { to: '/staff/queue', icon: Clock, label: 'Token Queue Dispenser', badge: 'Active' },
        ];
      case 'admin':
        return [
          { to: '/admin', icon: Home, label: 'Hospital Dashboard', end: true },
          { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors Roster' },
          { to: '/admin/staff', icon: Users, label: 'Staff Directory' },
          { to: '/admin/patients', icon: ClipboardList, label: 'All Patients' },
          { to: '/admin/analytics', icon: BarChart3, label: t('navigation.analytics') },
          { to: '/admin/settings', icon: Settings, label: t('navigation.settings') },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const roleColors = {
    patient: { badge: 'primary', label: 'Patient Portal' },
    doctor: { badge: 'vata', label: 'Vaidya Clinic Desk' },
    staff: { badge: 'warning', label: 'Staff Counter' },
    admin: { badge: 'kapha', label: 'Admin Console' },
  };

  const currentRoleMeta = roleColors[role] || roleColors.patient;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800
          lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ayur-500 to-teal-700 flex items-center justify-center text-white shadow-sm ring-2 ring-ayur-400/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                AYUR<span className="text-ayur-400">AI</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-ayur-950 text-ayur-300 font-semibold border border-ayur-800/60">
                  SIH &apos;26
                </span>
              </span>
              <p className="text-[10px] text-slate-400 leading-none">Ayurvedic Digital Care</p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Portal Badge */}
        <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/50 flex items-center justify-between">
          <Badge variant={currentRoleMeta.badge} size="sm">
            {currentRoleMeta.label}
          </Badge>
          <NavLink to="/login" className="text-[11px] text-slate-400 hover:text-ayur-300 transition-colors">
            {t('navigation.switchRole')}
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation Menu
            </p>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group
                  ${isActive
                    ? 'bg-ayur-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}
                  ${link.highlight && !isActive ? 'border border-teal-500/30 bg-teal-950/20 text-teal-200' : ''}
                `}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="truncate">{link.label}</span>
                </div>

                {link.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {link.badge}
                  </span>
                )}
                {link.highlight && !link.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* AI & Clinical Integrity Note */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 text-ayur-400 font-semibold text-xs">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Ayurvedic Decision AI</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Charaka-Sushruta compliant standardized digital clinical intake engine.
          </p>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'AyurAI User'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role || role}</p>
            </div>
          </div>
          <NavLink
            to="/login"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
            title="Switch User / Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
