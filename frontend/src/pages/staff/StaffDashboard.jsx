import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Building,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Printer,
  Calendar,
  Layers,
  PhoneCall,
  Activity,
  Stethoscope,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Check,
  X,
  FileText,
  UserCheck,
  Volume2,
  Ticket,
  ChevronRight,
  Filter,
  CheckSquare,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const StaffDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Active calling simulation
  const [callingToken, setCallingToken] = useState(null);

  // Modals state
  const [selectedCase, setSelectedCase] = useState(null);
  const [movingPatient, setMovingPatient] = useState(null);
  const [verifyingPatient, setVerifyingPatient] = useState(null);

  // Priority Review / Red-Flag Alerts List
  const [redFlagAlerts, setRedFlagAlerts] = useState([
    {
      id: 'alert-1',
      patientId: 'pat-101',
      token: 'A-024',
      patientName: 'Ananya S. Rao',
      age: 38,
      gender: 'Female',
      uhid: 'AYUR-2026-0891',
      room: 'OPD-102',
      language: 'Tamil',
      currentStep: 'Step 9: OPD Queue',
      triggeringResponse: 'Chronic retrosternal burning and severe hyperacidity for 6 months with daily OTC antacid dependency',
      reason: 'Potential urgent symptom detected: Prolonged gastric mucosal irritation / ulceration risk',
      time: '09:15 AM (15 mins ago)',
      status: 'Review Required' // 'Review Required' | 'Priority Validated' | 'Normal Queue'
    },
    {
      id: 'alert-2',
      patientId: 'pat-104',
      token: 'A-026',
      patientName: 'Vikas Sharma',
      age: 48,
      gender: 'Male',
      uhid: 'AYUR-2026-0894',
      room: 'OPD-102',
      language: 'Hindi',
      currentStep: 'Step 4: Medical History',
      triggeringResponse: '3-month persistent dry cough with early morning throat constriction and exertional breathlessness',
      reason: 'Potential urgent symptom detected: Unresolved Pranavaha Srotas obstruction',
      time: '09:30 AM (5 mins ago)',
      status: 'Review Required'
    }
  ]);

  // Fetch mock queue dataset
  const fetchQueueData = async () => {
    setLoading(true);
    const data = await apiService.getPatients();
    setPatients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQueueData();
  }, []);

  // Priority Actions
  const handleValidatePriority = (alertId) => {
    setRedFlagAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status: 'Priority Validated' };
      }
      return a;
    }));

    // Also update patient queue priority
    const alert = redFlagAlerts.find(a => a.id === alertId);
    if (alert) {
      setPatients(prev => prev.map(p => {
        if (p.id === alert.patientId || p.tokenNumber === alert.token) {
          return { ...p, priority: 'Priority Validated' };
        }
        return p;
      }));
    }
  };

  const handleKeepNormalQueue = (alertId) => {
    setRedFlagAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status: 'Normal Queue' };
      }
      return a;
    }));

    const alert = redFlagAlerts.find(a => a.id === alertId);
    if (alert) {
      setPatients(prev => prev.map(p => {
        if (p.id === alert.patientId || p.tokenNumber === alert.token) {
          return { ...p, priority: 'Normal' };
        }
        return p;
      }));
    }
  };

  // Workflow Movement Action
  const handleMoveWorkflowStep = (patientId, newStatus, newStepLabel) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          tokenStatus: newStatus,
          currentStepLabel: newStepLabel || p.currentStepLabel
        };
      }
      return p;
    }));
    setMovingPatient(null);
  };

  // Verify Patient Action
  const handleConfirmVerification = (patientId) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, isVerified: true };
      }
      return p;
    }));
    setVerifyingPatient(null);
  };

  // Call Token Simulation
  const handleCallToken = (token) => {
    setCallingToken(token);
    setTimeout(() => setCallingToken(null), 3500);
  };

  // Helper for language label
  const getLanguageLabel = (code) => {
    const found = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return found ? found.name : code?.toUpperCase() || 'Tamil';
  };

  // Helper for status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_consultation':
      case 'With Doctor':
        return <Badge variant="inProgress" size="sm" dot>With Doctor</Badge>;
      case 'completed':
      case 'Completed':
        return <Badge variant="completed" size="sm">Completed</Badge>;
      case 'case_taking':
      case 'Case Taking':
        return <Badge variant="warning" size="sm" dot>Case Taking</Badge>;
      case 'assessment':
      case 'Assessment':
        return <Badge variant="primary" size="sm">Assessment</Badge>;
      case 'registered':
      case 'Registered':
        return <Badge variant="secondary" size="sm">Registered</Badge>;
      case 'waiting':
      case 'Waiting':
      default:
        return <Badge variant="waiting" size="sm" dot>Waiting</Badge>;
    }
  };

  // Helper for priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Priority Validated':
        return <Badge variant="urgent" size="sm" dot className="font-bold">Priority Validated</Badge>;
      case 'Potential Red Flag — Review Required':
      case 'Potential Red Flag':
        return <Badge variant="warning" size="sm" dot className="font-bold bg-amber-100 text-amber-900 border-amber-300">⚠ Review Required</Badge>;
      case 'Normal':
      default:
        return <Badge variant="secondary" size="sm">Normal</Badge>;
    }
  };

  // Helper to get step label
  const getStepLabel = (patient) => {
    if (patient.currentStepLabel) return patient.currentStepLabel;
    if (patient.tokenStatus === 'in_consultation') return 'Step 10: In Consultation (OPD-102)';
    if (patient.tokenStatus === 'completed') return 'Step 11: Prescription Dispatched';
    if (patient.tokenStatus === 'case_taking') return 'Step 4: Medical History (Intake)';
    if (patient.tokenStatus === 'assessment') return 'Step 7: Ayurvedic Assessment';
    if (patient.tokenStatus === 'registered') return 'Step 1: Registration Complete';
    return 'Step 9: OPD Queue (Lounge)';
  };

  // Compute 6 Operational Card Metrics
  const todayPatientsCount = 24;
  const waitingCount = patients.filter(p => p.tokenStatus === 'waiting' || !p.tokenStatus).length || 8;
  const caseTakingCount = patients.filter(p => p.tokenStatus === 'case_taking').length || 4;
  const withDoctorCount = patients.filter(p => p.tokenStatus === 'in_consultation').length || 3;
  const redFlagsCount = redFlagAlerts.filter(a => a.status === 'Review Required').length;
  const completedCount = patients.filter(p => p.tokenStatus === 'completed').length || 7;

  // Filtered Queue List
  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tokenNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uhid?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'waiting' && (p.tokenStatus === 'waiting' || !p.tokenStatus)) ||
      (statusFilter === 'case_taking' && p.tokenStatus === 'case_taking') ||
      (statusFilter === 'in_consultation' && p.tokenStatus === 'in_consultation') ||
      (statusFilter === 'completed' && p.tokenStatus === 'completed');

    const matchesPriority =
      priorityFilter === 'all' ||
      (priorityFilter === 'red_flags' && (p.priority === 'Potential Red Flag — Review Required' || (p.redFlags && p.redFlags.length > 0))) ||
      (priorityFilter === 'validated' && p.priority === 'Priority Validated') ||
      (priorityFilter === 'normal' && p.priority === 'Normal');

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* 1. FRONTDESK OPERATIONAL HEADER & RESPONSIBILITIES BAR */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm" dot>Frontdesk Counter 1 • Main Triage Reception</Badge>
              <span className="text-xs text-amber-200 font-mono">OPD Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-white">
              Staff Operations & Clinical Triage Desk
            </h1>
            <p className="text-xs text-slate-300">
              Patient intake registration, token generation, identity verification, queue flow, and priority triage validation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <NavLink to="/staff/registration">
              <Button variant="amber" size="md" icon={UserPlus} className="shadow-sm font-bold">
                + New Registration
              </Button>
            </NavLink>
            <NavLink to="/staff/queue">
              <Button variant="secondary" size="md" icon={Clock}>
                Queue Controller
              </Button>
            </NavLink>
          </div>
        </div>

        {/* Staff Responsibilities Ribbon */}
        <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
            Staff Responsibilities:
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-amber-400" /> Patient Registration
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 text-teal-400" /> Token Generation
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Patient Verification
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" /> Queue Management
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" /> Workflow Progression
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Priority/Triage Validation
          </span>
        </div>
      </div>

      {/* 2. CLINICAL GOVERNANCE & PRINCIPLE NOTICE */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400/80 text-amber-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-sm text-amber-950 tracking-tight">
              &ldquo;AI flags — clinical staff decides.&rdquo;
            </p>
            <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
              Important: Staff validation is required before priority handling. Patients cannot manually declare emergency priority or skip the queue.
            </p>
          </div>
        </div>
        <Badge variant="warning" size="sm" className="shrink-0 font-bold bg-amber-200 text-amber-950 border-amber-400">
          Strict Staff Authority
        </Badge>
      </div>

      <AiDisclaimerBanner compact />

      {/* 3. SIX EXACT OPERATIONAL METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Today's Patients */}
        <Card className="p-4 bg-white border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Today&apos;s Patients</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 font-mono mt-1">{todayPatientsCount}</h3>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">18 Walk-in • 6 Appt</span>
        </Card>

        {/* 2. Waiting */}
        <Card className="p-4 bg-white border-amber-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800">Waiting</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-amber-700 font-mono mt-1">{waitingCount}</h3>
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Avg Wait ~18 min</span>
        </Card>

        {/* 3. Case Taking */}
        <Card className="p-4 bg-white border-indigo-200 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-indigo-800">Case Taking</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-indigo-700 font-mono mt-1">{caseTakingCount}</h3>
          <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">2 Kiosk • 2 Mobile</span>
        </Card>

        {/* 4. With Doctor */}
        <Card className="p-4 bg-white border-teal-200 shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-teal-800">With Doctor</span>
            <Stethoscope className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="text-2xl font-bold text-teal-700 font-mono mt-1">{withDoctorCount}</h3>
          <span className="text-[10px] text-teal-700 font-semibold block mt-0.5">Rooms 102, 104, 106</span>
        </Card>

        {/* 5. Potential Red Flags */}
        <Card className="p-4 bg-amber-50/80 border-2 border-amber-400 shadow-xs hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-950">Potential Red Flags</span>
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <h3 className="text-2xl font-bold text-amber-900 font-mono mt-1">{redFlagsCount}</h3>
          <span className="text-[10px] text-amber-800 font-bold block mt-0.5">Review Required</span>
        </Card>

        {/* 6. Completed */}
        <Card className="p-4 bg-white border-emerald-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-700 font-mono mt-1">{completedCount}</h3>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Rx to Pharmacy</span>
        </Card>
      </div>

      {/* 4. PRIORITY REVIEW SECTION (POTENTIAL RED FLAGS) */}
      <Card className="border-2 border-amber-400 bg-amber-50/20 shadow-md">
        <CardHeader className="pb-3 bg-amber-100/60 rounded-t-2xl border-b border-amber-200">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <span>Priority Review & Clinical Triage Validation</span>
                  <Badge variant="warning" size="sm" className="bg-amber-200 text-amber-900 border-amber-400 font-bold">
                    {redFlagAlerts.filter(a => a.status === 'Review Required').length} Pending Validation
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-amber-900">
                  Potential red flags screened during patient case-taking — staff confirmation required before priority promotion
                </CardDescription>
              </div>
            </div>
            <span className="text-[11px] text-amber-950 font-bold hidden sm:inline-block">
              Staff Decision Required
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="divide-y divide-amber-200/80">
            {redFlagAlerts.map((alert) => {
              const isPending = alert.status === 'Review Required';
              const isValidated = alert.status === 'Priority Validated';
              const isNormal = alert.status === 'Normal Queue';

              return (
                <div key={alert.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  {/* Alert Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-sm bg-slate-900 text-white px-3 py-1 rounded-xl shadow-xs">
                        {alert.token}
                      </span>
                      <div>
                        <strong className="text-slate-900 text-sm font-bold">{alert.patientName}</strong>
                        <span className="text-xs text-slate-500 font-mono ml-2">
                          {alert.gender}, {alert.age}y • UHID: {alert.uhid} • Assigned: {alert.room}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-mono">{alert.time}</span>
                      {isValidated && (
                        <Badge variant="urgent" size="sm" dot className="font-bold">
                          Priority Validated
                        </Badge>
                      )}
                      {isNormal && (
                        <Badge variant="secondary" size="sm">
                          Normal Queue
                        </Badge>
                      )}
                      {isPending && (
                        <Badge variant="warning" size="sm" dot className="bg-amber-200 text-amber-950 border-amber-400 font-bold">
                          ⚠ Potential Red Flag
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Red Flag Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Triggering Intake Response:
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        &quot;{alert.triggeringResponse}&quot;
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-100/70 border border-amber-300/80 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block mb-1">
                        Reason for Screening Flag:
                      </span>
                      <p className="text-amber-950 font-bold leading-relaxed">
                        {alert.reason}
                      </p>
                    </div>
                  </div>

                  {/* 3 Explicit Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedCase(alert)}
                    >
                      Review Case
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleKeepNormalQueue(alert.id)}
                      disabled={isNormal}
                      className={isNormal ? 'opacity-50' : ''}
                    >
                      Keep Normal Queue
                    </Button>

                    <Button
                      variant="amber"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => handleValidatePriority(alert.id)}
                      disabled={isValidated}
                      className={`font-bold shadow-xs ${isValidated ? 'opacity-50' : ''}`}
                    >
                      Validate Priority
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 5. OPERATIONAL QUEUE TABLE WITH ALL REQUIRED COLUMNS */}
      <Card className="shadow-md">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-700" />
                <span>Live OPD Queue & Patient Workflow Registry</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Monitor token progression, verify patient identity, and advance workflow stages
              </CardDescription>
            </div>

            {/* Calling Alert Banner if active */}
            {callingToken && (
              <div className="p-2.5 px-4 rounded-xl bg-amber-500 text-white text-xs font-bold animate-pulse flex items-center gap-2 shadow-sm">
                <Volume2 className="w-4 h-4" />
                <span>Calling Token {callingToken} to Counter 1 / OPD Room!</span>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Search & Filter Controls Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search token, patient name, UHID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="waiting">Waiting</option>
              <option value="case_taking">Case Taking</option>
              <option value="in_consultation">With Doctor</option>
              <option value="completed">Completed</option>
            </select>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 ml-2">
              <span>Priority:</span>
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-2 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="red_flags">Review Required</option>
              <option value="validated">Priority Validated</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Current Step</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPatients.map((patient) => {
                  const isFlagged = patient.priority === 'Potential Red Flag — Review Required' || (patient.redFlags && patient.redFlags.length > 0);
                  const isVerified = patient.isVerified || false;

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Token */}
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs inline-block">
                          {patient.tokenNumber || 'A-024'}
                        </span>
                      </td>

                      {/* 2. Patient */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                            alt={patient.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-900 text-xs">{patient.name}</strong>
                              {isVerified && (
                                <span title="Patient Verified">
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {patient.gender}, {patient.age}y • UHID: {patient.uhid}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(patient.tokenStatus)}
                      </td>

                      {/* 4. Priority */}
                      <td className="py-3 px-4">
                        {getPriorityBadge(patient.priority)}
                      </td>

                      {/* 5. Language */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 text-xs block">
                          {getLanguageLabel(patient.preferredLanguage)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {patient.preferredLanguage?.toUpperCase() || 'TA'}
                        </span>
                      </td>

                      {/* 6. Current Step */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold inline-block">
                          {getStepLabel(patient)}
                        </span>
                      </td>

                      {/* 7. Action */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Call announcement button */}
                          <button
                            type="button"
                            onClick={() => handleCallToken(patient.tokenNumber)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-600 text-xs font-semibold transition-colors"
                            title="Call token announcement"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Verify button */}
                          <button
                            type="button"
                            onClick={() => setVerifyingPatient(patient)}
                            className={`p-1.5 px-2 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 ${
                              isVerified
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                            title="Verify patient identity"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isVerified ? 'Verified' : 'Verify'}</span>
                          </button>

                          {/* Move workflow step button */}
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Layers}
                            onClick={() => setMovingPatient(patient)}
                          >
                            Move Step
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* MODALS: CASE AUDIT, STEP MOVER, PATIENT VERIFICATION                      */}
      {/* ========================================================================= */}

      {/* Case Review Modal */}
      {selectedCase && (
        <Modal
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          title={`Priority Review: Token ${selectedCase.token}`}
          subtitle={`${selectedCase.patientName} (${selectedCase.gender}, ${selectedCase.age}y • UHID: ${selectedCase.uhid})`}
          size="md"
        >
          <div className="space-y-4 text-xs py-2">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>AI Screening Trigger Summary</span>
              </div>
              <p className="text-xs text-slate-800">
                <strong>Patient Response:</strong> {selectedCase.triggeringResponse}
              </p>
              <p className="text-xs text-amber-950">
                <strong>Clinical Concern:</strong> {selectedCase.reason}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">Clinical Desk Directive:</span>
              <p>
                Confirm symptoms directly with the patient at the desk counter. Staff validation is required before priority promotion.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleKeepNormalQueue(selectedCase.id);
                  setSelectedCase(null);
                }}
              >
                Keep Normal Queue
              </Button>
              <Button
                variant="amber"
                size="sm"
                icon={CheckCircle2}
                onClick={() => {
                  handleValidatePriority(selectedCase.id);
                  setSelectedCase(null);
                }}
              >
                Validate & Promote Priority
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Patient Workflow Step Mover Modal */}
      {movingPatient && (
        <Modal
          isOpen={Boolean(movingPatient)}
          onClose={() => setMovingPatient(null)}
          title={`Advance Workflow: Token ${movingPatient.tokenNumber}`}
          subtitle={`Patient: ${movingPatient.name} (Current: ${movingPatient.tokenStatus || 'waiting'})`}
          size="md"
        >
          <div className="space-y-4 text-xs py-2">
            <p className="text-slate-600">
              Select the destination workflow stage for <strong>{movingPatient.name}</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleMoveWorkflowStep(movingPatient.id, 'waiting', 'Step 9: OPD Queue (Lounge)')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-left transition-colors"
              >
                <strong className="block text-slate-900">1. Move to Waiting Lounge</strong>
                <span className="text-[11px] text-slate-500">Assign to OPD Queue position</span>
              </button>

              <button
                type="button"
                onClick={() => handleMoveWorkflowStep(movingPatient.id, 'case_taking', 'Step 4: Medical History (Intake)')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition-colors"
              >
                <strong className="block text-slate-900">2. Route to Kiosk Intake</strong>
                <span className="text-[11px] text-slate-500">Complete guided wizard</span>
              </button>

              <button
                type="button"
                onClick={() => handleMoveWorkflowStep(movingPatient.id, 'in_consultation', 'Step 10: In Consultation (OPD-102)')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-left transition-colors"
              >
                <strong className="block text-slate-900">3. Call Inside Doctor Room</strong>
                <span className="text-[11px] text-slate-500">With Vaidya Dr. Rajesh Sharma</span>
              </button>

              <button
                type="button"
                onClick={() => handleMoveWorkflowStep(movingPatient.id, 'completed', 'Step 11: Prescription Dispatched')}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-colors"
              >
                <strong className="block text-slate-900">4. Mark Completed & Dispatch</strong>
                <span className="text-[11px] text-slate-500">Send Rx to Pharmacy</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setMovingPatient(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Patient Verification Modal */}
      {verifyingPatient && (
        <Modal
          isOpen={Boolean(verifyingPatient)}
          onClose={() => setVerifyingPatient(null)}
          title={`Verify Patient Identity: ${verifyingPatient.name}`}
          subtitle={`Token: ${verifyingPatient.tokenNumber} • UHID: ${verifyingPatient.uhid}`}
          size="md"
        >
          <div className="space-y-4 text-xs py-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone Number</span>
                  <strong className="text-slate-900">{verifyingPatient.phone || '+91 98450 12345'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Date of Birth / Age</span>
                  <strong className="text-slate-900">{verifyingPatient.age} years ({verifyingPatient.gender})</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Preferred Language</span>
                  <strong className="text-teal-800">{getLanguageLabel(verifyingPatient.preferredLanguage)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Emergency Contact</span>
                  <span className="text-slate-700">{verifyingPatient.emergencyContact || 'Spouse / Family'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px] flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Identity verified via physical Aadhaar / Government ID match at frontdesk.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setVerifyingPatient(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Check}
                onClick={() => handleConfirmVerification(verifyingPatient.id)}
              >
                Confirm Verification
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StaffDashboard;
