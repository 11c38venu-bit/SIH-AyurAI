import React from 'react';
import {
  Stethoscope,
  Pill,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import Badge from '../common/Badge';

export const FollowUpTimeline = ({
  activeStep = 3, // 1: Consultation, 2: Treatment, 3: Follow-up, 4: Progress Update, 5: Next Review
  consultationDate = '03 Sep 2026',
  treatmentDate = '03 Sep 2026',
  followUpDate = '17 Sep 2026',
  progressDate = 'Today',
  nextReviewDate = '17 Sep 2026 (10:30 AM)',
  doctorName = 'Vaidya Dr. K. Rajesh Sharma',
  diagnosis = 'Urdhwaga Amlapitta (Hyperacidity with Pitta-Vata Dushti)',
  treatmentSummary = 'Avipattikar Churna (5g BD) + Praval Pishti (250mg BD) + Maharasnadi Kashayam (15ml OD)',
  adherenceScore = '92% (12/13 Doses Taken)',
  symptomStatus = 'Significant Relief (Severity 3/10)'
}) => {
  const steps = [
    {
      id: 1,
      name: 'Consultation',
      label: '1. Initial Consultation',
      date: consultationDate,
      icon: Stethoscope,
      title: 'Clinical Evaluation & Diagnosis',
      desc: `${diagnosis} confirmed by ${doctorName}`,
      status: activeStep > 1 ? 'completed' : activeStep === 1 ? 'current' : 'upcoming'
    },
    {
      id: 2,
      name: 'Treatment',
      label: '2. Treatment & Rx',
      date: treatmentDate,
      icon: Pill,
      title: 'Classical Formulations Prescribed',
      desc: treatmentSummary,
      status: activeStep > 2 ? 'completed' : activeStep === 2 ? 'current' : 'upcoming'
    },
    {
      id: 3,
      name: 'Follow-up',
      label: '3. Follow-Up Scheduled',
      date: followUpDate,
      icon: Calendar,
      title: 'Target Clinical Review Date',
      desc: `Scheduled for ${followUpDate} with ${doctorName}`,
      status: activeStep > 3 ? 'completed' : activeStep === 3 ? 'current' : 'upcoming'
    },
    {
      id: 4,
      name: 'Progress Update',
      label: '4. Progress & Adherence',
      date: progressDate,
      icon: TrendingUp,
      title: 'Daily Symptom & Adherence Log',
      desc: `${adherenceScore} • ${symptomStatus}`,
      status: activeStep > 4 ? 'completed' : activeStep === 4 ? 'current' : 'upcoming'
    },
    {
      id: 5,
      name: 'Next Review',
      label: '5. Next Review',
      date: nextReviewDate,
      icon: Clock,
      title: 'Pulse & Samata Evaluation',
      desc: 'Repeat Nadi Pariksha and assess formulation continuation/tapering',
      status: activeStep === 5 ? 'current' : activeStep > 5 ? 'completed' : 'upcoming'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Visual Step Progression Ribbon */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Care Pathway Timeline</span>
            </span>
            <Badge variant="primary" size="sm">5-Stage Continuity</Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span>Stage {activeStep} of 5</span>
          </div>
        </div>

        {/* Desktop Horizontal Stepper */}
        <div className="hidden md:grid md:grid-cols-5 gap-2 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';

            return (
              <div
                key={step.id}
                className={`p-3 rounded-2xl border transition-all text-xs space-y-2 ${
                  isCurrent
                    ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-200 shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50/80 border-emerald-300'
                    : 'bg-white border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isCurrent
                        ? 'bg-teal-700 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{step.date}</span>
                </div>

                <div>
                  <strong className={`block text-xs font-bold ${isCurrent ? 'text-teal-950' : 'text-slate-900'}`}>
                    {step.name}
                  </strong>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-1">
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                      ● Active Now
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Stepper */}
        <div className="md:hidden space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                  isCurrent
                    ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-200'
                    : isCompleted
                    ? 'bg-slate-50 border-emerald-300'
                    : 'bg-white border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isCurrent
                      ? 'bg-teal-700 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900">{step.name}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{step.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FollowUpTimeline;
