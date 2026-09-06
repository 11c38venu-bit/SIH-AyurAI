import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  UserCheck,
  Ticket,
  ClipboardList,
  Activity,
  FileText,
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  Clock,
  Stethoscope,
  Pill,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Badge from '../common/Badge';

export const PATIENT_JOURNEY_STAGES = [
  {
    id: 1,
    key: 'registration',
    title: 'Registration',
    shortTitle: 'Registration',
    route: '/patient/register',
    icon: UserCheck,
    description: 'Patient demographics, preliminary vitals & contact details',
    defaultStatus: 'completed',
    timeEst: '09:15 AM',
  },
  {
    id: 2,
    key: 'token',
    title: 'Token Generation',
    shortTitle: 'Token',
    route: '/patient/token',
    icon: Ticket,
    description: 'Instant OPD token (A-024) & consultation room allocation',
    defaultStatus: 'completed',
    timeEst: '09:16 AM',
  },
  {
    id: 3,
    key: 'case-taking',
    title: 'AI-Assisted Case Taking',
    shortTitle: 'Case Taking',
    route: '/patient/case-taking',
    icon: ClipboardList,
    description: 'Conversational anamnesis: Ahara, Agni, Koshtha, Nidra, Manasa',
    defaultStatus: 'completed',
    timeEst: '09:22 AM',
  },
  {
    id: 4,
    key: 'assessment',
    title: 'Ayurvedic Assessment',
    shortTitle: 'Assessment',
    route: '/patient/assessment',
    icon: Activity,
    description: 'Prakriti balance, Ashtavidha & Dashavidha Pariksha',
    defaultStatus: 'completed',
    timeEst: '09:28 AM',
  },
  {
    id: 5,
    key: 'medical-history',
    title: 'Medical History',
    shortTitle: 'Med History',
    route: '/patient/medical-history',
    icon: FileText,
    description: 'Past chronic conditions, allergies, surgeries & medications',
    defaultStatus: 'completed',
    timeEst: '09:32 AM',
  },
  {
    id: 6,
    key: 'documents',
    title: 'Previous Documents',
    shortTitle: 'Documents',
    route: '/patient/documents',
    icon: UploadCloud,
    description: 'Upload & index previous lab reports, imaging, prior prescriptions',
    defaultStatus: 'completed',
    timeEst: '09:35 AM',
  },
  {
    id: 7,
    key: 'summary',
    title: 'AI-Assisted Clinical Summary',
    shortTitle: 'Summary',
    route: '/patient/summary',
    icon: FileCheck2,
    description: 'AI-assisted preliminary summary — practitioner review required',
    defaultStatus: 'completed',
    timeEst: '09:38 AM',
  },
  {
    id: 8,
    key: 'red-flags',
    title: 'Potential Red-Flag Screening',
    shortTitle: 'Red Flags',
    route: '/patient/red-flags',
    icon: AlertTriangle,
    description: 'Potential urgent symptom screening & staff triage review',
    defaultStatus: 'completed',
    timeEst: '09:40 AM',
  },
  {
    id: 9,
    key: 'waiting',
    title: 'Waiting / Queue',
    shortTitle: 'Queue',
    route: '/patient/status',
    icon: Clock,
    description: 'Live OPD lounge wait tracker, queue position #2 (~14m)',
    defaultStatus: 'current',
    timeEst: 'Now',
  },
  {
    id: 10,
    key: 'doctor',
    title: 'Doctor Consultation',
    shortTitle: 'Doctor',
    route: '/patient/status',
    icon: Stethoscope,
    description: 'Clinical consultation with Vaidya Dr. Rajesh Sharma in OPD-102',
    defaultStatus: 'pending',
    timeEst: 'Est. 09:55 AM',
  },
  {
    id: 11,
    key: 'prescription',
    title: 'Prescription / Treatment',
    shortTitle: 'Prescription',
    route: '/patient/follow-up',
    icon: Pill,
    description: 'Classical formulation schedule, Anupana, and dosage directions',
    defaultStatus: 'pending',
    timeEst: 'Upcoming',
  },
  {
    id: 12,
    key: 'follow-up',
    title: 'Follow-up',
    shortTitle: 'Follow-up',
    route: '/patient/follow-up',
    icon: Calendar,
    description: 'Scheduled review appointment & clinic reminder',
    defaultStatus: 'pending',
    timeEst: '17 Sep 2026',
  },
  {
    id: 13,
    key: 'progress',
    title: 'Progress Tracking',
    shortTitle: 'Progress',
    route: '/patient/follow-up',
    icon: TrendingUp,
    description: 'Daily symptom severity score, medication & Pathya diet adherence',
    defaultStatus: 'pending',
    timeEst: 'Daily Log',
  },
];

/**
 * Reusable Visual Workflow & Progress Tracker for Patient Journey
 *
 * Props:
 * - currentStepId: number (1 to 13)
 * - variant: 'stepper' | 'cards' | 'compact' | 'horizontal-bar'
 * - onStepClick?: (stage: object) => void
 * - showActionButtons?: boolean
 */
export const PatientJourneyTracker = ({
  currentStepId = 9,
  variant = 'stepper',
  showActionButtons = true,
  className = '',
}) => {
  const getStageStatus = (stageId) => {
    if (stageId < currentStepId) return 'completed';
    if (stageId === currentStepId) return 'current';
    return 'pending';
  };

  const currentStage = PATIENT_JOURNEY_STAGES.find((s) => s.id === currentStepId) || PATIENT_JOURNEY_STAGES[8];
  const completedCount = PATIENT_JOURNEY_STAGES.filter((s) => getStageStatus(s.id) === 'completed').length;
  const progressPct = Math.round((completedCount / PATIENT_JOURNEY_STAGES.length) * 100);

  // 1. COMPACT SUMMARY VIEW (e.g. for header banners)
  if (variant === 'compact') {
    return (
      <div className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h4 className="text-xs font-bold text-slate-900">
              Active Patient Journey: Step {currentStepId} of 13 ({currentStage.title})
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Overall Progress: <strong className="text-ayur-800">{progressPct}% Completed</strong>
          </span>
        </div>

        {/* Visual Progress Badges Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          {PATIENT_JOURNEY_STAGES.map((stage) => {
            const status = getStageStatus(stage.id);
            return (
              <NavLink
                key={stage.id}
                to={stage.route}
                className={`
                  shrink-0 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all
                  ${status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' : ''}
                  ${status === 'current' ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300 ring-2 ring-amber-100 shadow-xs' : ''}
                  ${status === 'pending' ? 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100' : ''}
                `}
                title={`${stage.id}. ${stage.title} (${status})`}
              >
                <span>{stage.id}.</span>
                <span>{stage.shortTitle}</span>
                {status === 'completed' && <span className="text-emerald-600 font-bold">✓</span>}
                {status === 'current' && <span className="text-amber-600 font-bold">●</span>}
                {status === 'pending' && <span className="text-slate-300 font-bold">○</span>}
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. HORIZONTAL STEPPER WITH CLEAN STATUS SYMBOLS (✓, ●, ○)
  if (variant === 'stepper' || variant === 'horizontal-bar') {
    return (
      <div className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 ${className}`}>
        {/* Header with Title and Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ayur-700" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Complete OPD Clinical Journey (13 Steps)
              </h3>
              <Badge variant="primary" size="sm">
                Step {currentStepId}/13
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              From Registration to Daily Care Tracking — Click any stage to navigate
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
              <span>Completed</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold">●</span>
              <span>Current</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-slate-50 flex items-center justify-center text-[9px] text-slate-400">○</span>
              <span>Upcoming</span>
            </span>
          </div>
        </div>

        {/* Horizontal Scrollable Stepper Track */}
        <div className="overflow-x-auto pb-3 pt-1">
          <div className="flex items-start min-w-[980px] justify-between relative px-2">
            {/* Connecting Line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

            {PATIENT_JOURNEY_STAGES.map((stage) => {
              const status = getStageStatus(stage.id);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              const isPending = status === 'pending';

              return (
                <NavLink
                  key={stage.id}
                  to={stage.route}
                  className="flex flex-col items-center text-center group relative z-10 w-20 focus:outline-none"
                >
                  {/* Step Node Circle */}
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ring-4 ring-white
                      ${isCompleted ? 'bg-emerald-600 text-white shadow-xs group-hover:bg-emerald-700' : ''}
                      ${isCurrent ? 'bg-amber-500 text-white shadow-md ring-amber-100 scale-110 animate-pulse' : ''}
                      ${isPending ? 'bg-slate-100 border border-slate-300 text-slate-400 group-hover:border-slate-400' : ''}
                    `}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    {isCurrent && <span className="text-[11px] font-black">●</span>}
                    {isPending && <span className="text-[10px] font-semibold">{stage.id}</span>}
                  </div>

                  {/* Title & Status */}
                  <div className="mt-2 space-y-0.5">
                    <span
                      className={`block text-[11px] font-bold leading-tight truncate transition-colors ${
                        isCurrent
                          ? 'text-amber-900 font-extrabold'
                          : isCompleted
                          ? 'text-slate-800 group-hover:text-ayur-800'
                          : 'text-slate-400'
                      }`}
                      title={stage.title}
                    >
                      {stage.shortTitle}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-mono">
                      {isCompleted ? 'Done ✓' : isCurrent ? 'Active ●' : 'Step ' + stage.id}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Current Active Step Banner Callout */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-teal-50/50 to-emerald-50/30 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              {React.createElement(currentStage.icon, { className: 'w-5 h-5' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Current Step {currentStage.id}
                </span>
                <span className="text-xs text-slate-500">{currentStage.timeEst}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                {currentStage.title}: <span className="text-slate-600 font-normal">{currentStage.description}</span>
              </h4>
            </div>
          </div>

          <NavLink to={currentStage.route} className="shrink-0">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-ayur-800 hover:bg-ayur-900 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to {currentStage.shortTitle}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </NavLink>
        </div>
      </div>
    );
  }

  // 3. CARDS / DETAILED GRID VIEW
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Patient Journey Flow</span>
            <Badge variant="primary" size="sm">13 Clinical Stages</Badge>
          </h3>
          <p className="text-xs text-slate-500">Step-by-step transparency from check-in to care tracking</p>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-600">
          {completedCount} of 13 Completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PATIENT_JOURNEY_STAGES.map((stage) => {
          const status = getStageStatus(stage.id);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const Icon = stage.icon;

          return (
            <NavLink
              key={stage.id}
              to={stage.route}
              className={`
                p-4 rounded-2xl border-2 transition-all flex flex-col justify-between text-left group
                ${isCompleted ? 'bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-xs' : ''}
                ${isCurrent ? 'bg-amber-50/70 border-amber-400 ring-4 ring-amber-100/60 shadow-sm' : ''}
                ${status === 'pending' ? 'bg-slate-50/60 border-slate-200 text-slate-400 hover:bg-white hover:border-slate-300' : ''}
              `}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCurrent
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">Step {stage.id.toString().padStart(2, '0')}</span>
                  </div>

                  <Badge
                    size="sm"
                    variant={isCompleted ? 'success' : isCurrent ? 'warning' : 'secondary'}
                  >
                    {isCompleted ? 'Completed ✓' : isCurrent ? 'Current ●' : 'Pending ○'}
                  </Badge>
                </div>

                <div>
                  <h4 className={`text-xs font-bold ${isCurrent ? 'text-amber-950' : 'text-slate-900 group-hover:text-ayur-800'}`}>
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {stage.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">{stage.timeEst}</span>
                <span className={`font-semibold flex items-center gap-1 ${isCurrent ? 'text-amber-900' : 'text-ayur-700'}`}>
                  <span>{isCompleted ? 'View details' : isCurrent ? 'Open now' : 'Upcoming'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default PatientJourneyTracker;
