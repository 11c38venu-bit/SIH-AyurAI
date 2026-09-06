import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Sparkles,
  ChevronDown,
  User,
  Shield,
  Stethoscope,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth, ROLES } from '../../services/authContext';
import LanguageSelector from '../common/LanguageSelector';
import Badge from '../common/Badge';

export const TopBar = ({ onOpenMobileMenu }) => {
  const { t } = useTranslation();
  const { role, user, switchRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleOptions = [
    { role: ROLES.PATIENT, label: 'Patient Portal', icon: User, desc: 'Case intake & live queue' },
    { role: ROLES.DOCTOR, label: 'Doctor Desk (Vaidya)', icon: Stethoscope, desc: 'OPD queue & Rx' },
    { role: ROLES.STAFF, label: 'Frontdesk Staff', icon: Users, desc: 'Token dispenser & intake' },
    { role: ROLES.ADMIN, label: 'Hospital Admin', icon: Shield, desc: 'Analytics & operations' },
  ];

  const notifications = [
    { id: 1, title: 'Token A-024 Ready', desc: 'OPD Room 102 is calling your token now.', time: '2m ago', type: 'token' },
    { id: 2, title: 'AI Case Synthesis Ready', desc: 'Preliminary Ashtavidha synthesis generated for Vaidya review.', time: '10m ago', type: 'ai' },
    { id: 3, title: 'New Lab Document Added', desc: 'Blood report uploaded successfully to EHR.', time: '1h ago', type: 'doc' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-xs hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Quick search UHID, Token, Patient..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs rounded-lg border border-transparent focus:border-ayur-400 focus:outline-none focus:ring-2 focus:ring-ayur-100 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Language Selector, AI Status, Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Prominent Multilingual Selector */}
        <LanguageSelector variant="dropdown" />

        {/* Responsible AI Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[11px] font-medium text-teal-900 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
          <span className="hidden lg:inline font-semibold">Responsible AI Assistant</span>
          <span className="lg:hidden">AI Active</span>
        </div>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            title="Switch User Role (Demo)"
          >
            <span className="capitalize font-semibold text-slate-900">{role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role (Demo Mode)
                </p>
              </div>
              <div className="space-y-1">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = role === opt.role;
                  return (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => {
                        switchRole(opt.role);
                        setShowRoleMenu(false);
                      }}
                      className={`
                        w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition-colors
                        ${isSelected ? 'bg-ayur-50 text-ayur-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'}
                      `}
                    >
                      <div className={`p-1.5 rounded-md ${isSelected ? 'bg-ayur-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{opt.label}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] text-ayur-700 font-medium">3 unread</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50/80 transition-colors text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Thumbnail */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
