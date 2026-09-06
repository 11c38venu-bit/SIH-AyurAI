import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Globe2,
  Sliders,
  CheckCircle2,
  Building,
  BellRing,
  Lock,
  Sparkles,
  Save,
  Languages,
  Clock,
  UserCheck
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Clinic Profile State
  const [profile, setProfile] = useState({
    hospitalName: 'AYURAI National Ayurvedic Research Hospital & OPD Center',
    ayushLicense: 'AYUSH-NABH-2026-9812',
    address: '14th Cross, Malleshwaram, Bengaluru, Karnataka - 560003',
    phone: '+91 80 2345 6789',
    email: 'contact@ayurai.health',
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    smsTokenAlerts: true,
    whatsappReminders: true,
    loungeAudioChime: true,
    emailDailyDigest: false,
  });

  // Queue Settings State
  const [queueSettings, setQueueSettings] = useState({
    maxQueuePerDoctor: '30',
    avgSlotDurationMins: '15',
    autoCallBufferMins: '3',
    emergencyPriorityBumping: true,
  });

  // User & Localization Settings State
  const [localSettings, setLocalSettings] = useState({
    defaultLanguage: 'ta',
    timeFormat: '12-hour (AM/PM)',
    dateFormat: 'DD/MM/YYYY',
  });

  // AI Assistance Settings State
  const [aiSettings, setAiSettings] = useState({
    diagnosticMatchThreshold: '85',
    samhitaRigor: 'Charaka & Sushruta Samhita Classical Rulesets',
    safetyRedFlagSensitivity: 'High (Immediate Practitioner Notification)',
  });

  // Security Placeholder State
  const [securitySettings, setSecuritySettings] = useState({
    dishaCompliance: true,
    sessionTimeoutMins: '30',
    roleBasedAccessControl: 'Enforced (Strict Role Isolation)',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Hospital Administration & Platform Settings</span>
          <Badge variant="primary" size="sm">System Console</Badge>
        </h1>
        <p className="text-xs text-slate-500">
          Configure clinic profile, notification channels, queue parameters, active languages, and clinical AI thresholds
        </p>
      </div>

      <AiDisclaimerBanner compact />

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings configuration saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        variant="pills"
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
        tabs={[
          { id: 'profile', label: '1. Clinic Profile' },
          { id: 'notifications', label: '2. Notifications' },
          { id: 'queue', label: '3. Queue Rules' },
          { id: 'languages', label: '4. Languages' },
          { id: 'ai', label: '5. AI Parameters' },
          { id: 'security', label: '6. Security & DISHA' },
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. CLINIC PROFILE */}
        {activeTab === 'profile' && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">
                <Building className="w-4 h-4 text-ayur-700" />
                <span>Hospital Profile & Accreditation Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <Input
                label="Hospital / Clinic Name"
                value={profile.hospitalName}
                onChange={(e) => setProfile(prev => ({ ...prev, hospitalName: e.target.value }))}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="AYUSH License / Accreditation ID"
                  value={profile.ayushLicense}
                  onChange={(e) => setProfile(prev => ({ ...prev, ayushLicense: e.target.value }))}
                />
                <Input
                  label="Official Contact Phone"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <Input
                label="Physical Address & City"
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="primary" size="md" className="ml-auto" icon={Save}>
                Save Clinic Profile
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* 2. NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">
                <BellRing className="w-4 h-4 text-amber-600" />
                <span>Patient Notification Channels & Lounge Chimes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {[
                { id: 'smsTokenAlerts', title: 'SMS Live Token Alert', desc: 'Send SMS updates to patients when their token is next in queue.' },
                { id: 'whatsappReminders', title: 'WhatsApp Follow-Up Reminders', desc: 'Automated appointment reminders sent 24h prior to consultation.' },
                { id: 'loungeAudioChime', title: 'Waiting Lounge Audio PA Chime', desc: 'Play audio bell sound when token is announced in doctor room.' },
                { id: 'emailDailyDigest', title: 'Daily Administrative Email Summary', desc: 'End-of-day digest sent to Medical Superintendent.' },
              ].map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-slate-900 block text-xs">{item.title}</strong>
                    <p className="text-slate-500 text-[11px]">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[item.id]}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [item.id]: e.target.checked }))}
                    className="w-4 h-4 accent-ayur-700 cursor-pointer"
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="primary" size="md" className="ml-auto" icon={Save}>
                Save Notification Preferences
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* 3. QUEUE SETTINGS */}
        {activeTab === 'queue' && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>OPD Queue Thresholds & Room Pacing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Max Patients per Vaidya / Day"
                  type="number"
                  value={queueSettings.maxQueuePerDoctor}
                  onChange={(e) => setQueueSettings(prev => ({ ...prev, maxQueuePerDoctor: e.target.value }))}
                />
                <Input
                  label="Avg Slot Duration (Mins)"
                  type="number"
                  value={queueSettings.avgSlotDurationMins}
                  onChange={(e) => setQueueSettings(prev => ({ ...prev, avgSlotDurationMins: e.target.value }))}
                />
                <Input
                  label="Auto-Call Buffer (Mins)"
                  type="number"
                  value={queueSettings.autoCallBufferMins}
                  onChange={(e) => setQueueSettings(prev => ({ ...prev, autoCallBufferMins: e.target.value }))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="primary" size="md" className="ml-auto" icon={Save}>
                Save Queue Parameters
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* 4. SUPPORTED LANGUAGES */}
        {activeTab === 'languages' && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">
                <Languages className="w-4 h-4 text-ayur-700" />
                <span>Active Regional Languages (6 Indian Languages Supported)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <div key={l.code} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block text-xs">{l.nativeName} ({l.name})</strong>
                      <span className="text-[10px] text-slate-400">{l.region}</span>
                    </div>
                    <Badge variant="success" size="sm">Active (Ready)</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="primary" size="md" className="ml-auto" icon={Save}>
                Save Language Configurations
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* 5. AI ASSISTANCE SETTINGS */}
        {activeTab === 'ai' && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">
                <Sparkles className="w-4 h-4 text-ayur-700" />
                <span>Clinical AI Diagnostic Thresholds (Placeholder)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Differential Match Threshold (%)"
                  type="number"
                  value={aiSettings.diagnosticMatchThreshold}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, diagnosticMatchThreshold: e.target.value }))}
                />
                <Input
                  label="Classical Samhita Ruleset"
                  value={aiSettings.samhitaRigor}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, samhitaRigor: e.target.value }))}
                />
              </div>
              <Input
                label="Safety Red Flag Sensitivity"
                value={aiSettings.safetyRedFlagSensitivity}
                onChange={(e) => setAiSettings(prev => ({ ...prev, safetyRedFlagSensitivity: e.target.value }))}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="primary" size="md" className="ml-auto" icon={Save}>
                Save AI Thresholds
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* 6. SECURITY & DISHA PLACEHOLDER */}
        {activeTab === 'security' && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">
                <Lock className="w-4 h-4 text-slate-700" />
                <span>Healthcare Data Privacy & Security (DISHA / NABH)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                <span className="font-bold text-teal-950 block text-xs">DISHA (Digital Information Security in Healthcare Act)</span>
                <p className="text-teal-800 text-[11px]">
                  All patient records, Ashtavidha observations, and prescriptions adhere to Indian National Digital Health Mission (ABDM/DISHA) privacy standards.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Inactivity Session Timeout (Mins)"
                  type="number"
                  value={securitySettings.sessionTimeoutMins}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeoutMins: e.target.value }))}
                />
                <Input
                  label="Role-Based Access Enforcement"
                  value={securitySettings.roleBasedAccessControl}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, roleBasedAccessControl: e.target.value }))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="primary" size="md" className="ml-auto" icon={Save}>
                Save Security Settings
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
};

export default SettingsPage;
