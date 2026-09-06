import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Clock,
  Printer,
  Stethoscope,
  RefreshCw,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Users,
  MapPin,
  Building,
  User,
  Volume2,
  Ticket,
  ClipboardList,
  ShieldCheck,
  Info,
  Check
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LanguageSelector from '../../components/common/LanguageSelector';

export const TokenTracker = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [queueList, setQueueList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundAlert, setSoundAlert] = useState(true);

  const fetchQueueData = async () => {
    setIsRefreshing(true);
    const pat = await apiService.getPatientById(user.id || 'pat-101');
    const queue = await apiService.getQueue(pat ? pat.assignedDoctorId : 'doc-1');
    setPatient(pat);
    setQueueList(queue);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchQueueData();
  }, [user]);

  if (!patient) {
    return <div className="p-8 text-center text-slate-400">Loading live queue status...</div>;
  }

  // 7 Possible Clinical Queue Statuses
  const QUEUE_STAGES = [
    { id: 1, key: 'registered', label: 'Registered', shortDesc: 'Token created' },
    { id: 2, key: 'case_taking', label: 'Case Taking', shortDesc: 'AI pre-intake' },
    { id: 3, key: 'assessment', label: 'Assessment', shortDesc: 'Prakriti check' },
    { id: 4, key: 'waiting', label: 'Waiting', shortDesc: 'Lounge queue' },
    { id: 5, key: 'in_consultation', label: 'With Doctor', shortDesc: 'OPD Room 102' },
    { id: 6, key: 'completed', label: 'Completed', shortDesc: 'Rx generated' },
    { id: 7, key: 'follow_up', label: 'Follow-up', shortDesc: 'Care plan' }
  ];

  // Helper to determine status index
  const getCurrentStatusIndex = (tokenStatus) => {
    switch (tokenStatus) {
      case 'registered': return 1;
      case 'case_taking': return 2;
      case 'assessment': return 3;
      case 'waiting': return 4;
      case 'in_consultation': return 5;
      case 'completed': return 6;
      case 'follow_up': return 7;
      default: return 4;
    }
  };

  const currentStatusIndex = getCurrentStatusIndex(patient.tokenStatus);
  const isNext = patient.queuePosition <= 1 && patient.tokenStatus === 'waiting';

  // Format token, queue position, and wait time as specified
  const displayToken = patient.tokenNumber || 'A-024';
  const displayQueuePos = patient.queuePosition ? patient.queuePosition.toString().padStart(2, '0') : '08';
  const displayWaitTime = patient.estimatedWaitMins ? `~${patient.estimatedWaitMins} min` : '~25 min';
  const displayStatus = patient.tokenStatus === 'waiting' ? 'Waiting' : patient.tokenStatus === 'in_consultation' ? 'With Doctor' : 'Registered';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar with Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Live Token & OPD Queue Tracker</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          </h1>
          <p className="text-xs text-slate-500">Real-time room allocation, queue position & consultation stage</p>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="dropdown" />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueueData}
            isLoading={isRefreshing}
            icon={RefreshCw}
          >
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* 1. SEVEN-STAGE QUEUE / STATUS VISUALIZATION TRACKER */}
      <Card className="p-5 bg-white shadow-xs border-slate-200">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-ayur-700" />
              <span>Queue Status Flow</span>
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                <span>Done</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold">●</span>
                <span>Current Status</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-slate-50 flex items-center justify-center text-[9px] text-slate-400">○</span>
                <span>Upcoming</span>
              </span>
            </div>
          </div>

          {/* 7 Status Visual Stepper */}
          <div className="overflow-x-auto pb-2 pt-1">
            <div className="flex items-start min-w-[620px] justify-between relative px-2">
              <div className="absolute top-3.5 left-5 right-5 h-0.5 bg-slate-200 -z-0" />

              {QUEUE_STAGES.map((st) => {
                const isCompleted = st.id < currentStatusIndex;
                const isCurrent = st.id === currentStatusIndex;
                const isPending = st.id > currentStatusIndex;

                return (
                  <div key={st.id} className="flex flex-col items-center text-center relative z-10 w-20">
                    <div
                      className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white transition-all
                        ${isCompleted ? 'bg-emerald-600 text-white shadow-xs' : ''}
                        ${isCurrent ? 'bg-amber-500 text-white shadow-md ring-amber-100 scale-110 animate-pulse' : ''}
                        ${isPending ? 'bg-slate-100 border border-slate-300 text-slate-400' : ''}
                      `}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                      {isCurrent && <span className="text-[10px] font-black">●</span>}
                      {isPending && <span className="text-[9px]">{st.id}</span>}
                    </div>
                    <span className={`text-[11px] font-bold mt-1.5 leading-tight ${isCurrent ? 'text-amber-900 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                      {st.label}
                    </span>
                    <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                      {st.shortDesc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. MAIN TOKEN HERO CARD (High Visual Hierarchy & Accessibility) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className={`p-6 sm:p-8 rounded-3xl border text-center relative overflow-hidden shadow-lg transition-all ${
            isNext
              ? 'bg-gradient-to-b from-amber-500/15 via-white to-amber-500/5 border-amber-400 ring-4 ring-amber-100'
              : 'bg-white border-slate-200'
          }`}>
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant={isNext ? 'urgent' : 'waiting'} size="md" dot>
                {displayStatus} in Lounge
              </Badge>
              <button
                type="button"
                onClick={() => setSoundAlert(!soundAlert)}
                className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                  soundAlert ? 'bg-ayur-50 border-ayur-200 text-ayur-800 font-semibold' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[10px]">{soundAlert ? 'Audio Chime ON' : 'Muted'}</span>
              </button>
            </div>

            {/* Token Number */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Your OPD Consultation Token
            </p>
            <h2 className="text-6xl sm:text-7xl font-black text-slate-900 font-mono tracking-tight my-2">
              {displayToken}
            </h2>

            {/* Patient Name & Registration Details */}
            <div className="space-y-0.5 my-3">
              <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
              <p className="text-xs text-slate-500">
                UHID: <span className="font-mono font-semibold">{patient.uhid}</span> • Registered at: <strong>{patient.registrationTime || '09:15 AM'}</strong>
              </p>
            </div>

            {/* Four Core Metric Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-100 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Token</span>
                <span className="text-xl font-black text-slate-900 font-mono">{displayToken}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Status</span>
                <Badge variant="waiting" size="sm" className="mt-1">{displayStatus}</Badge>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Queue Position</span>
                <span className="text-xl font-black text-slate-900 font-mono">{displayQueuePos}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Wait</span>
                <span className="text-xl font-black text-ayur-800 font-mono">{displayWaitTime}</span>
              </div>
            </div>

            {/* Kiosk Thermal Print Button */}
            <div className="pt-5 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Kiosk Token Slip
              </Button>
            </div>
          </div>

          {/* 3. CRITICAL INFORMATIONAL MESSAGE (High Visual Hierarchy - No manual priority button) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs text-slate-700 space-y-1.5 flex items-start gap-3.5 shadow-xs">
            <div className="p-2 rounded-xl bg-slate-200 text-slate-700 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-ayur-800" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span>Clinical Triage & Queue Policy</span>
                <Badge variant="secondary" size="sm">Hospital Protocol</Badge>
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed pt-0.5 font-medium">
                &ldquo;Potential urgent cases are reviewed by hospital staff before priority handling.&rdquo;
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                To preserve patient fairness and medical safety, queue prioritization is validated exclusively through clinical review by attending nursing and frontdesk staff.
              </p>
            </div>
          </div>
        </div>

        {/* Doctor & Room Info Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                <Stethoscope className="w-4 h-4 text-ayur-700" />
                <span>Consultation Room & Doctor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center gap-3.5 pb-3.5 border-b border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
                  alt="Doctor"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{patient.assignedDoctorName}</h4>
                  <p className="text-slate-500 text-[11px]">BAMS, MD (Kayachikitsa)</p>
                  <Badge variant="vata" size="sm" className="mt-1">Room {patient.assignedRoom}</Badge>
                </div>
              </div>

              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <strong className="text-slate-800">{patient.assignedDepartment}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current In Room:</span>
                  <strong className="text-emerald-700 font-mono font-bold">A-021</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Average Duration:</span>
                  <strong className="text-slate-800">12 - 15 mins</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Room Queue Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Live Room 102 Queue ({queueList.length} Registered)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto text-xs">
                {queueList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 flex items-center justify-between ${
                      item.id === patient.id ? 'bg-ayur-50/90 font-bold border-l-4 border-l-ayur-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-800">{item.tokenNumber}</span>
                      {item.id === patient.id && <Badge variant="primary" size="sm">You (08)</Badge>}
                    </div>
                    <span className="text-[11px] text-slate-500 capitalize">
                      {item.tokenStatus === 'in_consultation' ? 'With Doctor' : item.tokenStatus === 'waiting' ? 'Waiting' : item.tokenStatus}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TokenTracker;
