import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Activity,
  FileCheck,
  BellRing,
  Languages,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Eye,
  FileText,
  Flame,
  Compass,
  Filter,
  Volume2,
  Search,
  Pill,
  History,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { DoshaMeter } from '../../components/common/Progress';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const DoctorDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCalling, setIsCalling] = useState(false);
  const [callingToken, setCallingToken] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [queueFilter, setQueueFilter] = useState('all'); // 'all' | 'red_flags' | 'waiting' | 'ready' | 'completed'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    const data = await apiService.getPatients();
    setPatients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleCallNext = async () => {
    setIsCalling(true);
    const nextPatient = await apiService.callNextPatient(user?.id || 'doc-1');
    if (nextPatient) {
      setCallingToken(nextPatient.tokenNumber);
      setTimeout(() => setCallingToken(null), 3500);
    }
    await fetchDashboardData();
    setIsCalling(false);
  };

  const getLanguageLabel = (code) => {
    const found = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return found ? `${found.nativeName} (${code.toUpperCase()})` : code?.toUpperCase() || 'EN';
  };

  // Helper to compute display status
  const getDisplayStatus = (patient) => {
    if (patient.tokenStatus === 'in_consultation') return 'With Doctor';
    if (patient.tokenStatus === 'completed') return 'Completed';
    if (patient.priority === 'Potential Red Flag — Review Required') return 'Review Required';
    if (patient.tokenStatus === 'assessment' || (patient.caseIntake && patient.prakriti)) return 'Case Ready';
    if (patient.tokenStatus === 'waiting') return 'Waiting';
    return 'Waiting';
  };

  // Helper to compute display priority
  const getDisplayPriority = (patient) => {
    if (patient.priority === 'Priority Validated') return 'Priority Validated';
    if (patient.priority === 'Potential Red Flag — Review Required') return 'Potential Red Flag — Review';
    return 'Normal';
  };

  // Helper to compute case intake status
  const getCaseStatus = (patient) => {
    if (patient.tokenStatus === 'completed') return 'Prescription Issued';
    if (patient.tokenStatus === 'in_consultation') return 'Consultation Active';
    if (patient.priority === 'Potential Red Flag — Review Required') return 'Triage Review Required';
    if (patient.prakriti && patient.caseIntake) return 'Summary Ready';
    if (patient.tokenStatus === 'case_taking') return 'Intake In Progress';
    return 'Summary Ready';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'With Doctor':
        return <Badge variant="inProgress" size="sm" dot>With Doctor</Badge>;
      case 'Review Required':
        return <Badge variant="warning" size="sm" dot className="bg-amber-100 text-amber-900 border-amber-300">Review Required</Badge>;
      case 'Case Ready':
        return <Badge variant="success" size="sm" dot>Case Ready</Badge>;
      case 'Waiting':
        return <Badge variant="waiting" size="sm" dot>Waiting</Badge>;
      case 'Completed':
        return <Badge variant="completed" size="sm">Completed</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Priority Validated':
        return <Badge variant="urgent" size="sm" dot className="font-bold">Priority Validated</Badge>;
      case 'Potential Red Flag — Review':
        return <Badge variant="warning" size="sm" className="font-bold bg-amber-100 text-amber-900 border-amber-300">⚠ Review</Badge>;
      case 'Normal':
      default:
        return <Badge variant="secondary" size="sm">Normal</Badge>;
    }
  };

  const getCaseStatusBadge = (caseStatus) => {
    switch (caseStatus) {
      case 'Summary Ready':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Summary Ready</span>
          </span>
        );
      case 'Triage Review Required':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Triage Pending</span>
          </span>
        );
      case 'Consultation Active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            <Stethoscope className="w-3 h-3 text-indigo-600" />
            <span>In Room</span>
          </span>
        );
      case 'Prescription Issued':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Prescribed</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] text-slate-500 font-medium">
            {caseStatus}
          </span>
        );
    }
  };

  // Filter queue
  const filteredPatients = patients.filter((p) => {
    const status = getDisplayStatus(p);
    const priority = getDisplayPriority(p);

    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.chiefComplaint && p.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (queueFilter === 'red_flags') {
      return priority === 'Priority Validated' || priority === 'Potential Red Flag — Review';
    }
    if (queueFilter === 'waiting') {
      return status === 'Waiting' || status === 'Case Ready';
    }
    if (queueFilter === 'ready') {
      return status === 'Case Ready';
    }
    if (queueFilter === 'completed') {
      return status === 'Completed';
    }
    return true;
  });

  // Analytics mock data
  const hourlyPatientData = [
    { hour: '08 AM', count: 2 },
    { hour: '09 AM', count: 5 },
    { hour: '10 AM', count: 7 },
    { hour: '11 AM', count: 6 },
    { hour: '12 PM', count: 4 },
    { hour: '02 PM', count: 3 },
  ];

  const doshaPatientData = [
    { name: 'Pitta Imbalance', value: 45, color: '#E11D48' },
    { name: 'Vata Imbalance', value: 35, color: '#6366F1' },
    { name: 'Kapha Imbalance', value: 20, color: '#16A34A' },
  ];

  const upcomingFollowUps = [
    { id: 1, name: 'Lakshmi Narayanan', uhid: 'AYUR-2026-0898', token: 'A-018', date: 'Today, 11:30 AM', reason: '30-Day Amlapitta & Agni Assessment', status: 'Scheduled' },
    { id: 2, name: 'Suresh Menon', uhid: 'AYUR-2026-0897', token: 'A-019', date: 'Today, 02:15 PM', reason: 'Lumbar Spondylosis post-Katy Basti check', status: 'In Transit' },
    { id: 3, name: 'Pooja Sharma', uhid: 'AYUR-2026-0885', token: 'A-012', date: 'Tomorrow, 10:00 AM', reason: 'Sandhigata Vata & Joint Mobility Review', status: 'Confirmed' },
  ];

  const pendingReviewsList = patients.filter(
    p => p.priority === 'Potential Red Flag — Review Required' || p.priority === 'Priority Validated'
  );

  return (
    <div className="space-y-6">
      {/* Top Vaidya Clinical Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-ayur-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="vata" size="sm" dot>Room OPD-102 (Live Active)</Badge>
            <span className="text-xs text-teal-300">Kayachikitsa & Metabolic Medicine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Namaste, {user?.name || 'Vaidya Dr. K. Rajesh Sharma'}
          </h1>
          <p className="text-xs text-slate-300">
            Charaka-Sushruta standardized clinical decision desk with fast triage preview and multilingual anamnesis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="amber"
            size="md"
            onClick={handleCallNext}
            isLoading={isCalling}
            icon={Users}
            className="shadow-sm"
          >
            Call Next Patient
          </Button>
          <NavLink to="/doctor/queue">
            <Button variant="secondary" size="md" icon={Clock}>
              Triage Queue View
            </Button>
          </NavLink>
        </div>
      </div>

      {/* PA Announcement Notification */}
      {callingToken && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 text-white font-bold text-sm shadow-md animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 animate-bounce" />
            <span>🔔 LOUDSPEAKER CALL: &quot;Token number {callingToken}, please proceed to Consultation Room OPD-102&quot;</span>
          </div>
          <Badge variant="primary" size="sm">Calling Active</Badge>
        </div>
      )}

      {/* Clinical Safety & Decision-Maker Principle Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white border border-teal-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            CLINICAL DECISION GOVERNANCE: <strong className="text-amber-300 font-extrabold">&ldquo;The doctor remains the final clinical decision-maker.&rdquo;</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-teal-200 bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-700/60">
            AI provides draft synthesis • Potential Red Flag ≠ Diagnosis
          </span>
        </div>
      </div>

      <AiDisclaimerBanner compact />

      {/* KPI Metrics Cards (6 Core Clinical KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">Today&apos;s Patients</span>
          <h3 className="text-2xl font-bold text-slate-900 font-mono mt-1">{patients.length}</h3>
          <span className="text-[10px] text-emerald-600 font-semibold">Total Registered</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">In Waiting Lounge</span>
          <h3 className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {patients.filter(p => p.tokenStatus === 'waiting').length}
          </h3>
          <span className="text-[10px] text-slate-400">Queue Active</span>
        </Card>

        <Card className="p-4 bg-white border-rose-200 bg-rose-50/20">
          <span className="text-[11px] text-rose-700 font-semibold block">Red Flag Alerts</span>
          <h3 className="text-2xl font-bold text-rose-700 font-mono mt-1">
            {patients.filter(p => p.priority === 'Potential Red Flag — Review Required' || p.priority === 'Priority Validated').length}
          </h3>
          <span className="text-[10px] text-rose-600 font-semibold">Triage Attention</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">Pending Reviews</span>
          <h3 className="text-2xl font-bold text-ayur-800 font-mono mt-1">
            {patients.filter(p => p.tokenStatus !== 'completed').length}
          </h3>
          <span className="text-[10px] text-indigo-600 font-semibold">AI Drafts Ready</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">Completed Consultations</span>
          <h3 className="text-2xl font-bold text-emerald-700 font-mono mt-1">
            {patients.filter(p => p.tokenStatus === 'completed').length}
          </h3>
          <span className="text-[10px] text-emerald-600 font-semibold">Prescriptions Issued</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">Upcoming Follow-Ups</span>
          <h3 className="text-2xl font-bold text-indigo-700 font-mono mt-1">8</h3>
          <span className="text-[10px] text-indigo-600 font-semibold">This Week</span>
        </Card>
      </div>

      {/* Potential Red Flag & Pending Clinical Reviews Focus Bar */}
      {pendingReviewsList.length > 0 && (
        <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-sm text-slate-900">
                  Priority Attention & Clinical Red-Flag Stream ({pendingReviewsList.length})
                </CardTitle>
              </div>
              <Badge variant="warning" size="sm" className="font-bold">
                Potential Red Flag ≠ Diagnosis
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Patients with preliminary symptom screening alerts validated or awaiting doctor clinical assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingReviewsList.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-2xs flex flex-col justify-between gap-3 hover:border-amber-400 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md">
                          {p.tokenNumber}
                        </span>
                        <strong className="text-slate-900 text-xs">{p.name}</strong>
                        <span className="text-[11px] text-slate-400 font-mono">({p.gender}, {p.age}y)</span>
                      </div>
                      {p.priority === 'Priority Validated' ? (
                        <Badge variant="urgent" size="sm">Priority Validated</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Review Required</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium line-clamp-2 leading-relaxed">
                      &quot;{p.chiefComplaint}&quot;
                    </p>
                    <div className="text-[10px] text-amber-800 font-semibold">
                      Reason: Potential mucosal check & duration &gt; 3 months.
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                      onClick={() => setSelectedCase(p)}
                    >
                      Open Case
                    </Button>
                    <NavLink to={`/doctor/consultation/${p.id}`}>
                      <Button size="sm" variant="amber" icon={Stethoscope}>
                        Start Consultation
                      </Button>
                    </NavLink>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prominent Live OPD Queue Table */}
      <Card className="shadow-md">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-ayur-700" />
                <span>Today&apos;s OPD Consultation Queue</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Review token sequence, patient clinical statuses, priority triage, and open dossier
              </CardDescription>
            </div>

            {/* Quick Filter Pill Buttons & Search */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'all', label: `All (${patients.length})` },
                  { id: 'red_flags', label: `⚠ Red Flags (${patients.filter(p => p.priority.includes('Red Flag') || p.priority.includes('Validated')).length})` },
                  { id: 'waiting', label: `Waiting (${patients.filter(p => p.tokenStatus === 'waiting').length})` },
                  { id: 'ready', label: 'Case Ready' },
                  { id: 'completed', label: `Completed (${patients.filter(p => p.tokenStatus === 'completed').length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setQueueFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      queueFilter === f.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="w-48 sm:w-56">
                <input
                  type="text"
                  placeholder="Search token, name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:ring-2 focus:ring-ayur-100"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Case Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                      No patients found matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => {
                    const status = getDisplayStatus(p);
                    const priority = getDisplayPriority(p);
                    const caseStatus = getCaseStatus(p);
                    const isCurrent = p.tokenStatus === 'in_consultation';

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isCurrent ? 'bg-amber-50/70 font-semibold' : ''
                        }`}
                      >
                        {/* 1. Token */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-300">
                              {p.tokenNumber}
                            </span>
                            {p.queuePosition > 0 && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                Pos {p.queuePosition.toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 2. Patient */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900 text-xs font-bold">{p.name}</strong>
                              <span className="text-[11px] text-slate-500 font-mono">
                                ({p.gender}, {p.age}y)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate" title={p.chiefComplaint}>
                              {p.chiefComplaint}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              UHID: {p.uhid}
                            </span>
                          </div>
                        </td>

                        {/* 3. Status */}
                        <td className="py-3.5 px-4">
                          {getStatusBadge(status)}
                        </td>

                        {/* 4. Priority */}
                        <td className="py-3.5 px-4">
                          {getPriorityBadge(priority)}
                        </td>

                        {/* 5. Language */}
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                            {getLanguageLabel(p.preferredLanguage)}
                          </span>
                        </td>

                        {/* 6. Case Status */}
                        <td className="py-3.5 px-4">
                          {getCaseStatusBadge(caseStatus)}
                        </td>

                        {/* 7. Action */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Eye}
                              onClick={() => setSelectedCase(p)}
                              title="Fast Clinical Case Preview"
                            >
                              Open Case
                            </Button>

                            <NavLink to={`/doctor/consultation/${p.id}`}>
                              <Button
                                size="sm"
                                variant={isCurrent ? 'amber' : 'primary'}
                                icon={Stethoscope}
                                title="Open Live Consultation Room"
                              >
                                Consult
                              </Button>
                            </NavLink>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Follow-Ups, Schedule & Basic Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Upcoming Follow-ups */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-ayur-700" />
                  <span>Scheduled Follow-Ups</span>
                </CardTitle>
                <Badge variant="secondary" size="sm">3 Upcoming</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-xs">
                {upcomingFollowUps.map((f) => (
                  <div key={f.id} className="p-3.5 space-y-1.5 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-bold">{f.name}</strong>
                      <span className="font-mono text-teal-700 font-semibold text-[11px]">{f.token}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-snug">{f.reason}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{f.date}</span>
                      <Badge variant="success" size="sm">{f.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Cols: Basic Analytics */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hourly Consultations Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-ayur-700" />
                  <span>Consultation Throughput (Hourly Flow)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyPatientData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} name="Patients Consulted" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Dosha Epidemiology in Today's OPD */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  <span>OPD Dosha Imbalance Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={doshaPatientData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={62}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                    >
                      {doshaPatientData.map((e, idx) => (
                        <Cell key={idx} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fast Clinical Review & Case Summary Modal */}
      {selectedCase && (
        <Modal
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          title={`Clinical Dossier Review: ${selectedCase.name}`}
          subtitle={`Token: ${selectedCase.tokenNumber} • UHID: ${selectedCase.uhid} • ${selectedCase.gender}, ${selectedCase.age}y`}
          size="lg"
        >
          <div className="space-y-4 text-xs py-1">
            {/* Safety & Non-Diagnosis Alert */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-amber-900 block">
                  AI-Assisted Preliminary Dossier — Practitioner Review Required
                </span>
                <p className="text-[11px] text-amber-900">
                  Potential Red Flag ≠ Diagnosis. The doctor remains the final clinical decision-maker.
                </p>
              </div>
            </div>

            {/* Grid 1: Chief Complaint & Vitals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Presenting Chief Complaint (Pradhana Vedana)
                </span>
                <p className="text-slate-900 font-semibold text-xs leading-relaxed">
                  {selectedCase.chiefComplaint}
                </p>
                <span className="text-[10px] text-slate-500 block pt-1">
                  Duration: {selectedCase.duration || '6 months'} • Mother Tongue: <strong className="text-teal-800">{getLanguageLabel(selectedCase.preferredLanguage)}</strong>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Vital Parameters & Tri-Dosha
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block">Pulse</span>
                    <strong className="text-xs font-mono text-slate-900">{selectedCase.vitals?.pulse || 78} bpm</strong>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block">BP</span>
                    <strong className="text-xs font-mono text-slate-900">{selectedCase.vitals?.bp || '124/82'}</strong>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block">BMI</span>
                    <strong className="text-xs font-mono text-slate-900">{selectedCase.vitals?.bmi || '23.1'}</strong>
                  </div>
                </div>
                {selectedCase.prakriti && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">Prakriti: {selectedCase.prakriti.primary}</span>
                      <span className="text-[10px] text-slate-400">{selectedCase.prakriti.vikriti}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Grid 2: Ashtavidha Pariksha Snapshot */}
            {selectedCase.ashtavidhaAssessment && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Ashtavidha Pariksha (Classical 8-Fold Intake Observations)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-bold">1. Nadi</span>
                    <span className="text-slate-900">{selectedCase.ashtavidhaAssessment.nadi}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-bold">2. Jihwa</span>
                    <span className="text-slate-900">{selectedCase.ashtavidhaAssessment.jihwa}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-bold">3. Mutra</span>
                    <span className="text-slate-900">{selectedCase.ashtavidhaAssessment.mutra}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[9px] text-slate-400 block font-bold">4. Mala</span>
                    <span className="text-slate-900">{selectedCase.ashtavidhaAssessment.mala}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Red Flag & Triage Audit Trail if present */}
            {selectedCase.redFlags && selectedCase.redFlags.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Clinical Safety Screening Audit</span>
                  </span>
                  <Badge variant="warning" size="sm">Staff Triage Log</Badge>
                </div>
                {selectedCase.redFlags.map((rf) => (
                  <div key={rf.id} className="p-2 bg-white rounded-lg border border-amber-200 text-xs">
                    <strong className="text-slate-900 block">{rf.title}</strong>
                    <p className="text-slate-600 text-[11px] mt-0.5">{rf.desc}</p>
                    <span className="text-[10px] text-amber-800 font-semibold block mt-1">Action: {rf.action}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCase(null)}
              >
                Close Preview
              </Button>

              <div className="flex items-center gap-2">
                <NavLink to={`/doctor/patient/${selectedCase.id}`}>
                  <Button variant="secondary" size="sm" icon={FileText}>
                    Full 360° EHR Dossier
                  </Button>
                </NavLink>
                <NavLink to={`/doctor/consultation/${selectedCase.id}`}>
                  <Button variant="primary" size="sm" icon={Stethoscope}>
                    Open Consultation Room
                  </Button>
                </NavLink>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorDashboard;
