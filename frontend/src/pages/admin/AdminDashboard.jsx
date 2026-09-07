import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Clock,
  Activity,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Calendar,
  Layers,
  Building,
  UserCheck,
  Settings,
  Globe2,
  AlertTriangle,
  CheckCircle2,
  Check,
  UserPlus,
  FileText,
  Sliders,
  CheckSquare,
  RefreshCw,
  Eye,
  Tag,
  Phone,
  Mail,
  Info,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'doctors' | 'staff' | 'patients' | 'settings'
  const [loading, setLoading] = useState(true);

  // Doctors State
  const [doctorsList, setDoctorsList] = useState([
    { id: 'doc-1', name: 'Vaidya Dr. K. Rajesh Sharma', qualification: 'BAMS, MD (Kayachikitsa - BHU)', specialty: 'Kayachikitsa (Internal Medicine)', roomNo: 'OPD-102', experience: '16 Years', status: 'On Duty', consultationsToday: 18, avgTime: '12 min' },
    { id: 'doc-2', name: 'Vaidya Dr. Priya S. Nair', qualification: 'BAMS, MD (Panchakarma - Kerala)', specialty: 'Panchakarma & Rheumatology', roomNo: 'OPD-104', experience: '12 Years', status: 'On Duty', consultationsToday: 14, avgTime: '15 min' },
    { id: 'doc-3', name: 'Vaidya Dr. Anand Deshmukh', qualification: 'BAMS, MS (Ayurveda)', specialty: 'Shalya Tantra & Gut Health', roomNo: 'OPD-106', experience: '9 Years', status: 'In Procedure', consultationsToday: 11, avgTime: '18 min' },
    { id: 'doc-4', name: 'Vaidya Dr. Sunita Kulkarni', qualification: 'BAMS, MD (Prasuti Tantra)', specialty: 'Prasuti & Stri Roga', roomNo: 'OPD-108', experience: '14 Years', status: 'Available', consultationsToday: 9, avgTime: '14 min' }
  ]);

  // Staff State
  const [staffList, setStaffList] = useState([
    { id: 'st-1', name: 'Nurse S. Meenakshi', role: 'Chief Triage Nurse', desk: 'Frontdesk Counter 1', shift: 'Morning (08:00 - 16:00)', status: 'Active', verifiedToday: 24 },
    { id: 'st-2', name: 'R. K. Venkatesh', role: 'Registration Receptionist', desk: 'Frontdesk Counter 2', shift: 'Morning (08:00 - 16:00)', status: 'Active', verifiedToday: 19 },
    { id: 'st-3', name: 'A. Lakshmi', role: 'Herbal Pharmacy Lead', desk: 'Dispensary Counter 4', shift: 'Full Day (09:00 - 18:00)', status: 'Active', verifiedToday: 32 },
    { id: 'st-4', name: 'M. Harish Kumar', role: 'Kiosk & Queue Assistant', desk: 'Waiting Lounge Area', shift: 'Morning (08:00 - 16:00)', status: 'Active', verifiedToday: 15 }
  ]);

  // Operational Settings State
  const [opSettings, setOpSettings] = useState({
    opdStartTime: '08:30 AM',
    opdEndTime: '05:30 PM',
    maxTokensPerDoctor: 35,
    autoTriageRedFlagSensitivity: 'High (Standard AYUSH NAMASTE Safety)',
    kioskAccessModeEnabled: true,
    phoneAccessModeEnabled: true,
    defaultLanguage: 'Tamil (தமிழ்)',
    tokenPrefix: 'A-',
    requireStaffVerificationForPriority: true
  });

  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // ==========================================
  // RECHARTS OPERATIONAL METRICS DATASETS (MOCK / DEMO DATA)
  // ==========================================

  // 1. Patients Per Day (Last 7 Days)
  const patientsPerDayData = [
    { day: 'Mon 28 Aug', walkIn: 22, scheduled: 14, total: 36 },
    { day: 'Tue 29 Aug', walkIn: 28, scheduled: 16, total: 44 },
    { day: 'Wed 30 Aug', walkIn: 25, scheduled: 18, total: 43 },
    { day: 'Thu 31 Aug', walkIn: 31, scheduled: 20, total: 51 },
    { day: 'Fri 01 Sep', walkIn: 29, scheduled: 22, total: 51 },
    { day: 'Sat 02 Sep', walkIn: 34, scheduled: 25, total: 59 },
    { day: 'Today (03 Sep)', walkIn: 18, scheduled: 6, total: 24 }
  ];

  // 2. Hourly Queue Volume & Load (Today 09:00 - 17:00)
  const queueVolumeData = [
    { time: '09:00 AM', waiting: 4, inConsultation: 3, completed: 0 },
    { time: '10:00 AM', waiting: 8, inConsultation: 4, completed: 3 },
    { time: '11:00 AM', waiting: 9, inConsultation: 4, completed: 7 },
    { time: '12:00 PM', waiting: 6, inConsultation: 4, completed: 12 },
    { time: '01:00 PM', waiting: 3, inConsultation: 2, completed: 16 },
    { time: '02:00 PM', waiting: 7, inConsultation: 4, completed: 18 },
    { time: '03:00 PM', waiting: 8, inConsultation: 3, completed: 21 },
    { time: '04:00 PM', waiting: 4, inConsultation: 3, completed: 24 }
  ];

  // 3. Consultation Volume by Department
  const consultationVolumeDeptData = [
    { dept: 'Kayachikitsa (Internal Medicine)', completed: 18, scheduled: 24, fill: '#0F766E' },
    { dept: 'Panchakarma (Detox & Rehab)', completed: 14, scheduled: 18, fill: '#0D9488' },
    { dept: 'Shalya Tantra (Gut & Anorectal)', completed: 11, scheduled: 15, fill: '#D97706' },
    { dept: 'Prasuti & Stri Roga', completed: 9, scheduled: 12, fill: '#6366F1' }
  ];

  // 4. Follow-Up Statistics Breakdown
  const followUpStatsData = [
    { name: 'Completed on Schedule', value: 68, color: '#059669' },
    { name: 'Active In-Progress', value: 24, color: '#D97706' },
    { name: 'Pending Review / Rescheduled', value: 8, color: '#6366F1' }
  ];

  // 5. Language Usage Distribution
  const languageUsageData = [
    { language: 'Tamil (தமிழ்)', code: 'TA', patients: 542, pct: '32.3%', color: '#0F766E' },
    { language: 'English', code: 'EN', patients: 388, pct: '23.1%', color: '#6366F1' },
    { language: 'Hindi (हिन्दी)', code: 'HI', patients: 294, pct: '17.5%', color: '#E11D48' },
    { language: 'Kannada (ಕನ್ನಡ)', code: 'KN', patients: 216, pct: '12.9%', color: '#D97706' },
    { language: 'Malayalam (മലയാളം)', code: 'ML', patients: 142, pct: '8.5%', color: '#059669' },
    { language: 'Telugu (తెలుగు)', code: 'TE', patients: 98, pct: '5.8%', color: '#8B5CF6' }
  ];

  // 6. Patient Status Distribution
  const patientStatusData = [
    { status: 'Waiting in Lounge', count: 8, color: '#F59E0B' },
    { status: 'Case Taking (Kiosk/Mobile)', count: 4, color: '#6366F1' },
    { status: 'Assessment Ready', count: 2, color: '#0284C7' },
    { status: 'With Doctor (In Consultation)', count: 3, color: '#0D9488' },
    { status: 'Completed (Rx to Pharmacy)', count: 7, color: '#059669' }
  ];

  // 7. Waiting vs Processing Time Trends (Minutes)
  const waitProcessingTrendData = [
    { session: 'Mon Morning', avgWaitMin: 21, consultationMin: 14 },
    { session: 'Mon Afternoon', avgWaitMin: 16, consultationMin: 13 },
    { session: 'Tue Morning', avgWaitMin: 19, consultationMin: 15 },
    { session: 'Tue Afternoon', avgWaitMin: 14, consultationMin: 12 },
    { session: 'Wed Morning', avgWaitMin: 18, consultationMin: 14 },
    { session: 'Wed Afternoon', avgWaitMin: 15, consultationMin: 13 },
    { session: 'Today Morning', avgWaitMin: 17, consultationMin: 14 }
  ];

  const handleSaveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const toggleDoctorStatus = (docId) => {
    setDoctorsList(prev => prev.map(d => {
      if (d.id === docId) {
        const nextStatus = d.status === 'On Duty' ? 'Break' : 'On Duty';
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  const toggleStaffStatus = (staffId) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === staffId) {
        const nextStatus = s.status === 'Active' ? 'On Leave' : 'Active';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Executive Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm" dot>Medical Superintendent & Operations Console</Badge>
              <span className="text-xs text-teal-300 font-mono">NABH AYUSH Tertiary Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-white">
              Hospital Clinical & Operations Administration
            </h1>
            <p className="text-xs text-slate-300">
              Visual governance across clinical staff, OPD throughput, queue metrics, and system configuration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="amber" size="sm" className="font-bold bg-amber-400/20 text-amber-200 border-amber-400/40">
              Simulation Mode: Mock / Demo Data
            </Badge>
          </div>
        </div>

        {/* Quick KPI Stat Ribbon */}
        <div className="pt-3 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Today&apos;s OPD Load</span>
            <strong className="text-lg font-bold text-white font-mono">24</strong>
            <span className="text-[10px] text-teal-300 block">18 Walk-in • 6 Appt</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Active In Queue</span>
            <strong className="text-lg font-bold text-amber-300 font-mono">8</strong>
            <span className="text-[10px] text-slate-300 block">Avg Wait ~17m</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Doctors on Duty</span>
            <strong className="text-lg font-bold text-emerald-300 font-mono">4 / 4</strong>
            <span className="text-[10px] text-emerald-200 block">4 OPD Suites Live</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Staff Deployed</span>
            <strong className="text-lg font-bold text-teal-300 font-mono">4</strong>
            <span className="text-[10px] text-slate-300 block">Desks & Pharmacy</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Follow-Up Rate</span>
            <strong className="text-lg font-bold text-indigo-300 font-mono">92%</strong>
            <span className="text-[10px] text-indigo-200 block">Adherence High</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Language Support</span>
            <strong className="text-lg font-bold text-teal-200 font-mono">6</strong>
            <span className="text-[10px] text-teal-300 block">i18n Active</span>
          </div>
        </div>
      </div>

      <AiDisclaimerBanner compact />

      {/* Navigation Tabs Bar for Management Sections */}
      <Tabs
        variant="pills"
        activeTab={activeTab}
        onChange={(tId) => setActiveTab(tId)}
        tabs={[
          { id: 'analytics', label: '1. Workflow & Operations Analytics' },
          { id: 'doctors', label: '2. Manage Doctors & Suites' },
          { id: 'staff', label: '3. Manage Staff Roster' },
          { id: 'patients', label: '4. Patients Directory' },
          { id: 'settings', label: '5. System & Operational Configuration' }
        ]}
      />

      {/* ========================================================================= */}
      {/* TAB 1: WORKFLOW & OPERATIONS ANALYTICS (7 RECHARTS METRICS)               */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Header Banner for Analytics */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-700" />
              <span className="font-bold text-slate-900">
                Hospital Workflow Throughput & Clinical Queue Analytics
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px]">
                NABH Benchmark Standard
              </span>
              <Badge variant="amber" size="sm">Mock / Demo Data</Badge>
            </div>
          </div>

          {/* Row 1: Patients Per Day & Queue Volume */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metric 1: Patients Per Day */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle className="text-xs text-slate-900 flex items-center gap-1.5 font-bold">
                      <TrendingUp className="w-4 h-4 text-teal-700" />
                      <span>1. Daily Patient Registration Volume (Walk-in vs Appt)</span>
                    </CardTitle>
                    <CardDescription className="text-[11px]">Last 7 days registration trends</CardDescription>
                  </div>
                  <Badge variant="primary" size="sm">Patients / Day</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientsPerDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="walkIn" name="Walk-In (Desk)" fill="#0F766E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="scheduled" name="Scheduled Appointment" fill="#D97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Metric 2: Queue Volume & Hourly Load */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle className="text-xs text-slate-900 flex items-center gap-1.5 font-bold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>2. Hourly Queue Volume & Live Throughput</span>
                    </CardTitle>
                    <CardDescription className="text-[11px]">Today&apos;s hourly patient distribution (Waiting vs In-Consultation)</CardDescription>
                  </div>
                  <Badge variant="warning" size="sm">Live Queue</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={queueVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="waiting" name="Waiting in Lounge" stroke="#D97706" fill="#D97706" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="inConsultation" name="In Consultation" stroke="#0F766E" fill="#0F766E" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="completed" name="Completed" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Consultation Volume & Follow-Up Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metric 3: Consultation Volume by Department */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle className="text-xs text-slate-900 flex items-center gap-1.5 font-bold">
                      <Stethoscope className="w-4 h-4 text-indigo-600" />
                      <span>3. Consultation Volume by Specialty Department</span>
                    </CardTitle>
                    <CardDescription className="text-[11px]">Completed consultations vs target slots today</CardDescription>
                  </div>
                  <Badge variant="indigo" size="sm">Specialties</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consultationVolumeDeptData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="dept" tick={{ fontSize: 9 }} width={120} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="completed" name="Completed Today" fill="#0F766E" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="scheduled" name="Total Scheduled" fill="#CBD5E1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Metric 4: Follow-up Statistics */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle className="text-xs text-slate-900 flex items-center gap-1.5 font-bold">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>4. Follow-Up Completion & Adherence Statistics</span>
                    </CardTitle>
                    <CardDescription className="text-[11px]">Patient return rate and treatment adherence milestones</CardDescription>
                  </div>
                  <Badge variant="success" size="sm">Follow-Up Stats</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={followUpStatsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name.split(' ')[0]}: ${value}%`}
                    >
                      {followUpStatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Language Usage, Patient Status & Waiting Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metric 5: Language Usage Distribution */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-xs text-slate-900 flex items-center gap-1.5 font-bold">
                    <Globe2 className="w-4 h-4 text-teal-700" />
                    <span>5. Multilingual Language Distribution</span>
                  </CardTitle>
                  <Badge variant="primary" size="sm">6 Languages</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {languageUsageData.map((lang, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
                      <strong className="text-slate-900 text-xs">{lang.language}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[11px]">{lang.patients} users</span>
                      <Badge variant="secondary" size="sm">{lang.pct}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Metric 6: Patient Status Distribution */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-xs text-slate-900 flex items-center gap-1.5 font-bold">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>6. Real-Time Patient Status Distribution</span>
                  </CardTitle>
                  <Badge variant="indigo" size="sm">24 Total</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {patientStatusData.map((st, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                      <span className="text-slate-800 font-semibold text-xs">{st.status}</span>
                    </div>
                    <strong className="font-mono text-slate-900 text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200">
                      {st.count}
                    </strong>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Metric 7: Waiting vs Processing Trends */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-xs text-slate-900 flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>7. Waiting vs Consultation Time (Mins)</span>
                  </CardTitle>
                  <Badge variant="success" size="sm">Avg ~17m</Badge>
                </div>
              </CardHeader>
              <CardContent className="h-56 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={waitProcessingTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="session" tick={{ fontSize: 8 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="avgWaitMin" name="Avg Wait (min)" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="consultationMin" name="Doctor Time (min)" stroke="#0F766E" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MANAGE DOCTORS & OPD SUITES                        */}
      {/* ========================================================= */}
      {activeTab === 'doctors' && (
        <Card className="shadow-md">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-700" />
                  <span>Ayurvedic Physicians (Vaidyas) & OPD Consultation Suites</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage physician duty rosters, OPD room allocations, and daily consultation loads
                </CardDescription>
              </div>
              <Badge variant="primary">4 Active Vaidyas</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 text-xs">
              {doctorsList.map((doc) => (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-base shrink-0">
                      🩺
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm font-bold">{doc.name}</strong>
                        <Badge variant={doc.status === 'On Duty' ? 'success' : 'secondary'} size="sm" dot>
                          {doc.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-xs">{doc.qualification}</p>
                      <p className="text-[11px] text-teal-800 font-semibold">{doc.specialty} • {doc.experience} Exp</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Assigned Suite</span>
                      <Badge variant="vata" size="sm" className="font-mono font-bold">{doc.roomNo}</Badge>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Consultations Today</span>
                      <strong className="text-slate-900 font-mono text-sm">{doc.consultationsToday} cases</strong>
                      <span className="text-[10px] text-slate-400 block">Avg: {doc.avgTime}</span>
                    </div>

                    <Button
                      variant={doc.status === 'On Duty' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => toggleDoctorStatus(doc.id)}
                    >
                      {doc.status === 'On Duty' ? 'Set On Break' : 'Set On Duty'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MANAGE STAFF ROSTER                                */}
      {/* ========================================================= */}
      {activeTab === 'staff' && (
        <Card className="shadow-md">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Clinical Support Staff & Frontdesk Deployment</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage nursing triage personnel, registration receptionists, and dispensary staff
                </CardDescription>
              </div>
              <Badge variant="secondary">4 Staff Members on Shift</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 text-xs">
              {staffList.map((st) => (
                <div key={st.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center font-bold text-base shrink-0">
                      🪪
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm font-bold">{st.name}</strong>
                        <Badge variant={st.status === 'Active' ? 'success' : 'secondary'} size="sm" dot>
                          {st.status}
                        </Badge>
                      </div>
                      <p className="text-slate-700 text-xs font-semibold">{st.role}</p>
                      <p className="text-[11px] text-slate-400">{st.shift}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Deployment Desk</span>
                      <strong className="text-slate-900 text-xs block">{st.desk}</strong>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Activity Processed</span>
                      <strong className="text-teal-900 font-mono text-sm">{st.verifiedToday} actions</strong>
                    </div>

                    <Button
                      variant={st.status === 'Active' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => toggleStaffStatus(st.id)}
                    >
                      {st.status === 'Active' ? 'Mark Leave' : 'Mark Active'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PATIENTS DIRECTORY                                 */}
      {/* ========================================================= */}
      {activeTab === 'patients' && (
        <Card className="shadow-md">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-700" />
                  <span>Master Patient Registry & Intake Directory</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Historical OPD intake records, UHID links, and clinical follow-up registrations
                </CardDescription>
              </div>
              <Badge variant="primary">24 Registered Today</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <strong className="text-slate-900 block text-xs">Patient Access Modes Supported:</strong>
                <span className="text-slate-600 text-[11px]">
                  📱 Mobile Web (QR token scan) • 🖥️ Hospital Touch Kiosk (Assisted case-taking)
                </span>
              </div>
              <Badge variant="success" size="sm">Dual Access Active</Badge>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block text-xs">Ananya S. Rao (38y, Female)</strong>
                  <span className="text-[11px] text-slate-500">UHID: AYUR-2026-0891 • Token: A-024 • Mother Tongue: Tamil</span>
                </div>
                <Badge variant="urgent" size="sm">Priority Validated</Badge>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block text-xs">Rajeshwari Krishnan (52y, Female)</strong>
                  <span className="text-[11px] text-slate-500">UHID: AYUR-2026-0892 • Token: A-025 • Mother Tongue: Tamil</span>
                </div>
                <Badge variant="secondary" size="sm">Normal Queue</Badge>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block text-xs">Vikas Sharma (48y, Male)</strong>
                  <span className="text-[11px] text-slate-500">UHID: AYUR-2026-0894 • Token: A-026 • Mother Tongue: Hindi</span>
                </div>
                <Badge variant="warning" size="sm">Review Required</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SYSTEM & OPERATIONAL CONFIGURATION                 */}
      {/* ========================================================= */}
      {activeTab === 'settings' && (
        <Card className="shadow-md">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-700" />
                  <span>Hospital System & Operational Configuration</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure OPD operational hours, token numbering, triage threshold, and dual access modes
                </CardDescription>
              </div>
              <Button size="sm" variant="primary" icon={Check} onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-xs">
            {settingsSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Operational configuration updated successfully in system registry.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="OPD Daily Start Time"
                value={opSettings.opdStartTime}
                onChange={(e) => setOpSettings(prev => ({ ...prev, opdStartTime: e.target.value }))}
              />
              <Input
                label="OPD Daily End Time"
                value={opSettings.opdEndTime}
                onChange={(e) => setOpSettings(prev => ({ ...prev, opdEndTime: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Max Daily Token Capacity per Vaidya"
                type="number"
                value={opSettings.maxTokensPerDoctor}
                onChange={(e) => setOpSettings(prev => ({ ...prev, maxTokensPerDoctor: Number(e.target.value) }))}
              />
              <Input
                label="Token ID Prefix"
                value={opSettings.tokenPrefix}
                onChange={(e) => setOpSettings(prev => ({ ...prev, tokenPrefix: e.target.value }))}
              />
            </div>

            <Input
              label="AI Clinical Triage Sensitivity"
              value={opSettings.autoTriageRedFlagSensitivity}
              onChange={(e) => setOpSettings(prev => ({ ...prev, autoTriageRedFlagSensitivity: e.target.value }))}
            />

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-slate-900 block text-xs">Clinical Governance Checkbox:</strong>
              <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opSettings.requireStaffVerificationForPriority}
                  onChange={(e) => setOpSettings(prev => ({ ...prev, requireStaffVerificationForPriority: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="font-semibold text-xs">
                  Require staff desk verification before promoting potential red flags to Priority Validated
                </span>
              </label>
              <p className="text-[11px] text-slate-500 italic pl-6">
                Ensures patients cannot manipulate priority status or bypass standard queueing rules.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="primary" size="md" className="ml-auto" icon={Check} onClick={handleSaveSettings}>
              Save Operational Configuration
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
