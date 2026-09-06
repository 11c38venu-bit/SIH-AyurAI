import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Clock,
  ClipboardList,
  Activity,
  FileText,
  CheckCircle,
  Calendar,
  AlertCircle,
  ArrowRight,
  Heart,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  User,
  Layers,
  Ticket,
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  Stethoscope,
  Pill,
  TrendingUp,
  Volume2,
  RefreshCw,
  BellRing,
  UserCheck
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { DoshaMeter, ProgressBar } from '../../components/common/Progress';
import { AiDisclaimerBanner } from '../../components/common/Alert';
import LanguageSelector from '../../components/common/LanguageSelector';
import PatientJourneyTracker, { PATIENT_JOURNEY_STAGES } from '../../components/patient/PatientJourneyTracker';
import AccessModeSelector from '../../components/patient/AccessModeSelector';

export const PatientDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(9); // Default: Step 9 (Waiting / Queue)
  const [viewMode, setViewMode] = useState('stepper'); // 'stepper' | 'cards'

  useEffect(() => {
    const fetchPatientData = async () => {
      const data = await apiService.getPatientById(user.id || 'pat-101');
      setPatient(data);
      // Determine active step based on patient status
      if (data) {
        if (data.tokenStatus === 'in_consultation') {
          setActiveStep(10);
        } else if (data.tokenStatus === 'completed') {
          setActiveStep(12);
        } else {
          setActiveStep(9);
        }
      }
      setLoading(false);
    };
    fetchPatientData();
  }, [user]);

  if (loading || !patient) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="h-48 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Calculate case intake completeness
  const intakeCompletedSections = 6;
  const totalIntakeSections = 6;
  const intakeProgressPct = 100;

  // Next action based on current step
  const getNextActionDetails = () => {
    switch (activeStep) {
      case 9:
        return {
          title: 'Wait for Doctor Call at Room OPD-102',
          description: 'You are #8 in line. Vaidya Dr. Rajesh Sharma is currently serving token A-021.',
          ctaText: 'View Live Queue Status',
          ctaLink: '/patient/token',
          urgent: false,
        };
      case 10:
        return {
          title: 'Doctor Consultation In Progress',
          description: 'Please proceed inside OPD Room 102. Dr. Rajesh Sharma is ready for pulse & clinical review.',
          ctaText: 'Open Consultation View',
          ctaLink: '/patient/status',
          urgent: true,
        };
      default:
        return {
          title: 'Complete Daily Symptom & Medicine Log',
          description: 'Record your morning medicine adherence and digestion comfort score.',
          ctaText: 'Open Care & Follow-Up Tracker',
          ctaLink: '/patient/follow-up',
          urgent: false,
        };
    }
  };

  const nextAction = getNextActionDetails();

  return (
    <div className="space-y-6">
      {/* 1. WELCOME HERO & PATIENT STATUS HEADER */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-ayur-900 via-teal-950 to-slate-900 text-white shadow-lg border border-teal-800/40 relative overflow-hidden">
        {/* Background decorative Ayurvedic leaf glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live OPD Session Active</span>
              </span>
              <span className="text-xs text-ayur-200 font-mono px-2.5 py-0.5 rounded-md bg-white/10">
                UHID: {patient.uhid}
              </span>
              <span className="text-xs text-teal-200 font-mono px-2.5 py-0.5 rounded-md bg-white/10">
                {patient.gender}, {patient.age}y
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-white">
              Namaste, {patient.name}
            </h1>
            <p className="text-xs sm:text-sm text-ayur-100 max-w-2xl leading-relaxed">
              Your comprehensive Ayurvedic case profile is ready for Vaidya Dr. Rajesh Sharma. Track every step of your hospital journey in real-time below.
            </p>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSelector variant="dropdown" />
            <NavLink to="/patient/welcome">
              <Button variant="secondary" size="md" icon={Sparkles} className="shadow-xs">
                Restart Intake Flow
              </Button>
            </NavLink>
            <NavLink to="/patient/token">
              <Button variant="amber" size="md" icon={Ticket} className="shadow-xs">
                Live Token Queue
              </Button>
            </NavLink>
          </div>
        </div>
      </div>

      <AiDisclaimerBanner />

      {/* 2. NEXT ACTION & CURRENT STEP HERO BANNER (High Visibility & Elderly Accessible) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-50 to-teal-50 border-2 border-amber-300/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0 ring-4 ring-amber-100">
            <BellRing className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm" dot>
                CURRENT STEP {activeStep} OF 13
              </Badge>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Next Action Required
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {nextAction.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {nextAction.description}
            </p>
          </div>
        </div>

        <NavLink to={nextAction.ctaLink} className="shrink-0">
          <Button
            size="lg"
            variant="primary"
            icon={ArrowRight}
            iconPosition="right"
            className="w-full sm:w-auto shadow-md text-sm font-bold py-3.5 px-6"
          >
            {nextAction.ctaText}
          </Button>
        </NavLink>
      </div>

      {/* 3. VISUAL WORKFLOW / PROGRESS TRACKER (The 13-Stage Complete Journey) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Patient Clinical Journey Workflow
            </h2>
            <Badge variant="vata" size="sm">Complete 13 Stages</Badge>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('stepper')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'stepper' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline Stepper
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cards Grid
            </button>
          </div>
        </div>

        <PatientJourneyTracker
          currentStepId={activeStep}
          variant={viewMode}
          className="shadow-sm"
        />
      </div>

      {/* 4. MAIN METRIC CARDS (Token, Current Status, Queue, Case-Taking, Consultation, Follow-Up) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARD 1: TOKEN NUMBER & QUEUE POSITION */}
        <Card className="border-t-4 border-t-ayur-600 shadow-md flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm">
                <Ticket className="w-4 h-4 text-ayur-700" />
                <span>Token & Queue</span>
              </CardTitle>
              <Badge variant="waiting" dot>Waiting</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 text-center">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Your Token Number</p>
              <h3 className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight my-1">
                {patient.tokenNumber || 'A-024'}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Queue Position</span>
                <strong className="text-slate-900 text-base font-bold font-mono">
                  {patient.queuePosition ? patient.queuePosition.toString().padStart(2, '0') : '08'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Est. Waiting</span>
                <strong className="text-ayur-800 text-base font-bold font-mono">
                  ~{patient.estimatedWaitMins || 25} min
                </strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-left flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Room: <strong className="text-slate-800 font-bold">{patient.assignedRoom}</strong></span>
              <span>Reg: <strong className="text-slate-800">{patient.registrationTime}</strong></span>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <NavLink to="/patient/token" className="w-full">
              <Button variant="outline" size="sm" className="w-full" icon={ArrowRight} iconPosition="right">
                Open Queue Tracker
              </Button>
            </NavLink>
          </CardFooter>
        </Card>

        {/* CARD 2: CASE-TAKING & ASSESSMENT PROGRESS */}
        <Card className="border-t-4 border-t-indigo-500 shadow-md flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                <span>Case-Taking Progress</span>
              </CardTitle>
              <Badge variant="success" size="sm">100% Complete</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Intake Anamnesis</span>
                <span className="text-ayur-800 font-bold font-mono">{intakeCompletedSections}/{totalIntakeSections} Sections</span>
              </div>
              <ProgressBar value={intakeProgressPct} />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Primary Prakriti:</span>
                <Badge variant="vata" size="sm">{patient.prakriti.primary}</Badge>
              </div>
              <DoshaMeter
                vata={patient.prakriti.vata}
                pitta={patient.prakriti.pitta}
                kapha={patient.prakriti.kapha}
              />
            </div>

            <p className="text-[11px] text-slate-500 line-clamp-1">
              <strong>Agni:</strong> Tikshna • <strong>Koshtha:</strong> Mridu • <strong>Nidra:</strong> Vataja
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <NavLink to="/patient/assessment" className="w-full">
              <Button variant="outline" size="sm" className="w-full" icon={ChevronRight} iconPosition="right">
                View Prakriti & Ashtavidha
              </Button>
            </NavLink>
          </CardFooter>
        </Card>

        {/* CARD 3: CONSULTATION & CLINICAL SAFETY STATUS */}
        <Card className="border-t-4 border-t-emerald-600 shadow-md flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Consultation Status</span>
              </CardTitle>
              <Badge variant="primary">OPD-102</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
                alt="Doctor"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-xs truncate">{patient.assignedDoctorName}</h4>
                <p className="text-[10px] text-slate-500">Kayachikitsa (Internal Medicine)</p>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor Status:</span>
                <strong className="text-emerald-700 font-semibold">Consulting A-021</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Safety Screening:</span>
                <strong className="text-amber-700 font-semibold">1 Flag Reviewed</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dossier Status:</span>
                <strong className="text-slate-800">Synthesized for Doctor</strong>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <NavLink to="/patient/status" className="w-full">
              <Button variant="outline" size="sm" className="w-full" icon={Layers} iconPosition="right">
                View OPD Live Status
              </Button>
            </NavLink>
          </CardFooter>
        </Card>

        {/* CARD 4: FOLLOW-UP & PROGRESS TRACKING STATUS */}
        <Card className="border-t-4 border-t-amber-500 shadow-md flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Follow-Up & Care</span>
              </CardTitle>
              <Badge variant="warning">Scheduled</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Next Review Visit</span>
              <strong className="text-slate-900 text-xs font-bold block">Thursday, 17 Sep 2026</strong>
              <span className="text-[10px] text-slate-500 block">OPD-102 • 10:30 AM</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Prescription:</span>
                <strong className="text-slate-800">3 Herbal Formulations</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Today&apos;s Adherence:</span>
                <strong className="text-emerald-700 font-semibold">2 of 3 Logged</strong>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <NavLink to="/patient/follow-up" className="w-full">
              <Button variant="outline" size="sm" className="w-full" icon={TrendingUp} iconPosition="right">
                Log Adherence & Progress
              </Button>
            </NavLink>
          </CardFooter>
        </Card>
      </div>

      {/* 5. PATIENT ACCESS MODES (Phone vs Hospital Kiosk) */}
      <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 space-y-4">
        <AccessModeSelector redirectRoute="/patient/case-taking" />
      </div>

      {/* 6. QUICK ACTION PATHWAYS FOR ALL 13 STEPS (Touch-Friendly & Accessible) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Direct Access Clinical Modules
          </h3>
          <span className="text-xs text-slate-400">Touch-Friendly Navigation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          <NavLink to="/patient/register" className="group">
            <Card hoverEffect className="p-3.5 h-full flex flex-col justify-between border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-ayur-700 group-hover:text-white transition-colors">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">Step 01</span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-ayur-800 transition-colors">Registration</h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">UHID & vitals profile</p>
            </Card>
          </NavLink>

          <NavLink to="/patient/token" className="group">
            <Card hoverEffect className="p-3.5 h-full flex flex-col justify-between border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">Step 02</span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">Token Generator</h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Live queue position</p>
            </Card>
          </NavLink>

          <NavLink to="/patient/case-taking" className="group">
            <Card hoverEffect className="p-3.5 h-full flex flex-col justify-between border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">Step 03</span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-800 transition-colors">AI Case Taking</h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Ahara, Agni & symptoms</p>
            </Card>
          </NavLink>

          <NavLink to="/patient/assessment" className="group">
            <Card hoverEffect className="p-3.5 h-full flex flex-col justify-between border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">Step 04</span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-800 transition-colors">Ayurvedic Assessment</h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Prakriti & Ashtavidha</p>
            </Card>
          </NavLink>

          <NavLink to="/patient/medical-history" className="group">
            <Card hoverEffect className="p-3.5 h-full flex flex-col justify-between border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">Step 05</span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-800 transition-colors">Medical History</h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Allergies & past drugs</p>
            </Card>
          </NavLink>

          <NavLink to="/patient/documents" className="group">
            <Card hoverEffect className="p-3.5 h-full flex flex-col justify-between border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">Step 06</span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">Health Records</h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Lab & prior Rx files</p>
            </Card>
          </NavLink>

          <NavLink to="/patient/summary" className="group">
            <Card hoverEffect className="p-3.5 h-full flex flex-col justify-between border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">Step 07</span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors">Structured Summary</h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Dual-language pre-intake</p>
            </Card>
          </NavLink>

          <NavLink to="/patient/red-flags" className="group">
            <Card hoverEffect className="p-3.5 h-full flex flex-col justify-between border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">Step 08</span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">Red Flags Review</h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Clinical safety screening</p>
            </Card>
          </NavLink>

          <NavLink to="/patient/status" className="group">
            <Card hoverEffect className="p-3.5 h-full flex flex-col justify-between border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">Step 09-10</span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-800 transition-colors">OPD Queue & Doctor</h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">13-step live OPD status</p>
            </Card>
          </NavLink>

          <NavLink to="/patient/follow-up" className="group">
            <Card hoverEffect className="p-3.5 h-full flex flex-col justify-between border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">Step 11-13</span>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">Rx & Follow-Up</h4>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Pathya, drugs & daily log</p>
            </Card>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
