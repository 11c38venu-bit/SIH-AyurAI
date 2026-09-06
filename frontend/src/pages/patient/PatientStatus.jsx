import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Stethoscope,
  FileCheck,
  PackageCheck,
  UserCheck,
  Activity,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Ticket,
  ClipboardList,
  FileText,
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  Pill,
  TrendingUp,
  Volume2,
  RefreshCw,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LanguageSelector from '../../components/common/LanguageSelector';
import PatientJourneyTracker, { PATIENT_JOURNEY_STAGES } from '../../components/patient/PatientJourneyTracker';

export const PatientStatus = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [soundAlert, setSoundAlert] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await apiService.getPatientById(user.id || 'pat-101');
      setPatient(data);
    };
    load();
  }, [user]);

  const activeStep = 9; // Step 9: Waiting / Queue

  const detailed13Stages = [
    {
      id: 1,
      title: '1. Registration',
      status: 'completed',
      time: '09:15 AM',
      description: 'Demographics verified, vitals recorded (Pulse 78, BP 124/82, BMI 23.1).',
      icon: UserCheck,
      link: '/patient/register',
    },
    {
      id: 2,
      title: '2. Token Generation',
      status: 'completed',
      time: '09:16 AM',
      description: 'Token A-024 generated for OPD-102 (Kayachikitsa / Internal Medicine).',
      icon: Ticket,
      link: '/patient/token',
    },
    {
      id: 3,
      title: '3. AI-Assisted Case Taking',
      status: 'completed',
      time: '09:22 AM',
      description: 'Recorded Ahara, Agni (Tikshna), Koshtha (Mridu), and retrosternal burning symptoms.',
      icon: ClipboardList,
      link: '/patient/case-taking',
    },
    {
      id: 4,
      title: '4. Ayurvedic Assessment',
      status: 'completed',
      time: '09:28 AM',
      description: 'Prakriti calculated as Pitta-Vata with 50% Pitta elevation; Ashtavidha Pariksha initialized.',
      icon: Activity,
      link: '/patient/assessment',
    },
    {
      id: 5,
      title: '5. Medical History',
      status: 'completed',
      time: '09:32 AM',
      description: 'Documented mild GERD, penicillin drug allergy, and non-smoker lifestyle.',
      icon: FileText,
      link: '/patient/medical-history',
    },
    {
      id: 6,
      title: '6. Previous Documents',
      status: 'completed',
      time: '09:35 AM',
      description: 'Upper GI endoscopy & Lipid/LFT profile indexed for attending Vaidya.',
      icon: UploadCloud,
      link: '/patient/documents',
    },
    {
      id: 7,
      title: '7. AI-Assisted Structured Summary',
      status: 'completed',
      time: '09:38 AM',
      description: 'Dual-language (Tamil + Clinical English) pre-consultation dossier synthesized.',
      icon: FileCheck2,
      link: '/patient/summary',
    },
    {
      id: 8,
      title: '8. Potential Red-Flag Screening',
      status: 'completed',
      time: '09:40 AM',
      description: '1 practitioner review flag highlighted: Chronic burning with antacid dependency.',
      icon: AlertTriangle,
      link: '/patient/red-flags',
    },
    {
      id: 9,
      title: '9. Waiting / Queue',
      status: 'current',
      time: 'Active Now',
      description: 'Waiting in Lounge near Room OPD-102. Queue position #2 (~14 mins wait).',
      icon: Clock,
      link: '/patient/token',
    },
    {
      id: 10,
      title: '10. Doctor Consultation',
      status: 'pending',
      time: 'Est. 09:55 AM',
      description: 'In-person pulse verification & clinical review with Vaidya Dr. Rajesh Sharma.',
      icon: Stethoscope,
      link: '/patient/status',
    },
    {
      id: 11,
      title: '11. Prescription / Treatment',
      status: 'pending',
      time: 'Upcoming',
      description: 'Digital formulation prescription (Avipattikar Churna, Praval Pishti) & Pathya diet plan.',
      icon: Pill,
      link: '/patient/follow-up',
    },
    {
      id: 12,
      title: '12. Follow-up',
      status: 'pending',
      time: '17 Sep 2026',
      description: 'Scheduled 14-day review appointment at OPD Room 102.',
      icon: Calendar,
      link: '/patient/follow-up',
    },
    {
      id: 13,
      title: '13. Progress Tracking',
      status: 'pending',
      time: 'Daily Log',
      description: 'Daily symptom scale, formulation intake checklist, and dietary compliance log.',
      icon: TrendingUp,
      link: '/patient/follow-up',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Complete OPD Clinical Journey (13 Stages)</span>
            <Badge variant="inProgress" size="sm" dot>Live OPD Tracking</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time visual progress from registration to long-term follow-up care
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="dropdown" />
          <button
            type="button"
            onClick={() => setSoundAlert(!soundAlert)}
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              soundAlert ? 'bg-ayur-50 border-ayur-200 text-ayur-800 font-semibold' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{soundAlert ? 'Chime ON' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Stepper Summary Bar */}
      <PatientJourneyTracker currentStepId={activeStep} variant="stepper" />

      {/* Hero Live OPD Status Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-white to-teal-50 border-2 border-amber-300 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="urgent" size="md" dot>ACTIVE WAITING STAGE (STEP 9)</Badge>
            <span className="text-xs font-mono font-bold text-slate-500">Token: A-024</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Please Wait Near Room OPD-102
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Vaidya Dr. Rajesh Sharma is currently consulting patient <strong>A-021</strong>. Your turn is <strong>#08 in queue</strong> with an estimated wait of <strong>~25 minutes</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <NavLink to="/patient/token" className="w-full sm:w-auto">
            <Button variant="amber" size="md" icon={Ticket} className="w-full">
              Live Token Screen
            </Button>
          </NavLink>
          <NavLink to="/patient/follow-up" className="w-full sm:w-auto">
            <Button variant="primary" size="md" icon={Calendar} className="w-full">
              Follow-Up & Care
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Comprehensive 13-Stage Timeline Journey */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle className="text-sm">Comprehensive 13-Stage Clinical Workflow</CardTitle>
              <CardDescription>Click on any stage to view its full details or modify responses</CardDescription>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              8 of 13 Completed ✓
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative pl-7 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {detailed13Stages.map((st) => {
              const Icon = st.icon;
              const isDone = st.status === 'completed';
              const isCurrent = st.status === 'current';
              const isPending = st.status === 'pending';

              return (
                <div key={st.id} className="relative flex items-start gap-4">
                  {/* Circle Indicator */}
                  <div
                    className={`
                      absolute -left-[35px] w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white
                      ${isDone ? 'bg-emerald-600 text-white shadow-xs' : ''}
                      ${isCurrent ? 'bg-amber-500 text-white shadow-md ring-amber-100 scale-110 animate-pulse' : ''}
                      ${isPending ? 'bg-slate-100 border border-slate-300 text-slate-400' : ''}
                    `}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                    {isCurrent && <span className="text-xs font-black">●</span>}
                    {isPending && <span className="text-[10px]">{st.id}</span>}
                  </div>

                  {/* Stage Details Card */}
                  <NavLink
                    to={st.link}
                    className={`flex-1 p-4 rounded-2xl border text-xs transition-all block group ${
                      isCurrent
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-100 shadow-xs'
                        : isDone
                        ? 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-75 hover:opacity-100 hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-amber-600' : isDone ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <h4 className={`font-bold text-sm ${isCurrent ? 'text-amber-950 font-extrabold' : 'text-slate-900 group-hover:text-ayur-800'}`}>
                          {st.title}
                        </h4>
                        <Badge
                          size="sm"
                          variant={isDone ? 'success' : isCurrent ? 'warning' : 'secondary'}
                        >
                          {isDone ? 'Done ✓' : isCurrent ? 'Current ●' : 'Upcoming ○'}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{st.time}</span>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed pl-6 sm:pl-0">
                      {st.description}
                    </p>
                  </NavLink>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Next Action: Prepare for Vaidya consultation inside Room OPD-102.
          </span>
          <NavLink to="/patient/follow-up">
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              View Follow-Up & Prescriptions
            </Button>
          </NavLink>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PatientStatus;
