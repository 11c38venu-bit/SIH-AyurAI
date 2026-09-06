import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Clock,
  Activity,
  HeartHandshake,
  CheckCircle2,
  FileCheck,
  Stethoscope,
  Users,
  UserCheck,
  Zap,
  ChevronRight,
  AlertTriangle,
  Smartphone,
  Monitor,
  Languages,
  FileText,
  Bot,
  ShieldAlert,
  Layers,
  CalendarCheck,
  Building2,
  Check,
  X,
  ClipboardList,
  Eye,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';
import LanguageSelector from '../../components/common/LanguageSelector';

export const LandingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-ayur-100 selection:text-ayur-900">
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-slate-200/80">
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Top Pill Badges */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ayur-100/90 border border-ayur-300 text-ayur-950 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-ayur-700" />
              <span>Smart India Hackathon 2026</span>
              <span className="text-ayur-400">•</span>
              <span className="text-ayur-800 font-medium">Healthcare Technology Prototype</span>
            </div>

            {/* Main Title */}
            <div className="space-y-3">
              <div className="inline-block">
                <span className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900">
                  AYUR<span className="text-ayur-700">AI</span>
                </span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-slate-900 leading-tight">
                AI-Assisted Digital Ayurvedic Case-Taking & Clinical Workflow Platform
              </h1>
            </div>

            {/* Supporting Hero Tagline */}
            <p className="text-lg sm:text-xl text-slate-700 font-medium leading-relaxed max-w-3xl mx-auto">
              <span className="text-ayur-800 font-bold underline decoration-ayur-400 underline-offset-4">
                Capture the history before the consultation.
              </span>{' '}
              Let the doctor focus on the patient.
            </p>

            {/* Role Flow / Ecosystem Strip */}
            <div className="pt-2">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-xs text-slate-700 font-semibold">
                <span className="text-slate-400 uppercase text-[10px] tracking-wider font-bold">Clinical Ecosystem:</span>
                <span className="inline-flex items-center gap-1 text-ayur-800 bg-ayur-50 px-2.5 py-1 rounded-md border border-ayur-200">
                  <Smartphone className="w-3.5 h-3.5" /> Patient Intake
                </span>
                <span className="text-slate-300 font-bold">➔</span>
                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  <UserCheck className="w-3.5 h-3.5" /> Staff Triage
                </span>
                <span className="text-slate-300 font-bold">➔</span>
                <span className="inline-flex items-center gap-1 text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                  <Stethoscope className="w-3.5 h-3.5" /> Doctor Review
                </span>
                <span className="text-slate-300 font-bold">➔</span>
                <span className="inline-flex items-center gap-1 text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  <Building2 className="w-3.5 h-3.5" /> Hospital Admin
                </span>
              </div>
            </div>

            {/* Primary CTA Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <NavLink to="/patient/register">
                <Button size="lg" icon={ArrowRight} iconPosition="right" className="shadow-lg shadow-ayur-900/15 font-bold">
                  Start Patient Intake
                </Button>
              </NavLink>

              <NavLink to="/doctor">
                <Button variant="outline" size="lg" icon={Stethoscope} className="font-semibold">
                  Vaidya Doctor Portal
                </Button>
              </NavLink>

              <NavLink to="/staff">
                <Button variant="secondary" size="lg" icon={UserCheck} className="font-semibold">
                  Staff Desk & Triage
                </Button>
              </NavLink>

              <NavLink to="/admin">
                <Button variant="secondary" size="lg" icon={Building2} className="font-semibold">
                  Admin Analytics
                </Button>
              </NavLink>
            </div>

            {/* Multilingual Quick Switch Bar */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-ayur-700" />
                <span>Multilingual OPD Interface (6 Indian Languages):</span>
              </span>
              <LanguageSelector variant="pills" />
            </div>
          </div>

          {/* Quick Architecture Preview Mockup */}
          <div className="mt-12 max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-4 px-6 flex flex-wrap items-center justify-between text-white border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-300 font-semibold">
                  AYURAI Clinical Care Engine — Live Prototype
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ayur-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Practitioner-in-the-Loop Governance</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-b from-white to-slate-50/50">
              <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="vata">Pre-Intake Anamnesis</Badge>
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Pre-Consultation Intake</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Patient completes symptoms, Ahara, Vihara, Agni, and Nidra questions on mobile or kiosk while waiting.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="warning">Early Warning</Badge>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Red-Flag Safety Screening</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automated rule & AI screening detects urgent potential red flags for mandatory staff triage validation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="success">Doctor Desk</Badge>
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Structured Clinical Summary</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Doctor receives a 14-point structured preliminary draft summary with full review, edit, and verification controls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM SECTION */}
      <section id="problem-solution" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Current Healthcare Challenges</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              The Operational & Clinical Bottlenecks in OPDs
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Traditional Ayurvedic diagnosis is holistic, constitutional, and deeply individualized. In high-volume outpatient settings, systemic challenges compromise patient care and doctor efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Problem 1 */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Time-Constrained OPD Consultations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doctors typically have only 3–5 minutes per patient, forcing rushed anamnesis and leaving minimal time for personalized physical examination and counseling.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Incomplete History-Taking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients often forget prior medications, chronicity of symptoms, dietary triggers, or surgical history during rushed verbal questioning.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Complex Ayurvedic Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluating Prakriti, Vikriti, Agni state, Ahara-Vihara habits, and Ashtavidha/Dashavidha Pariksha requires exhaustive inquiries that overburden consultation time.
              </p>
            </div>

            {/* Problem 4 */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Fragmented Medical Documents</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients arrive with loose paper lab sheets, unstructured discharge summaries, and old prescriptions that are difficult to synthesize rapidly.
              </p>
            </div>

            {/* Problem 5 */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Language & Accessibility Barriers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients frequently struggle to articulate nuanced digestive, sleep, or emotional symptoms in non-native hospital languages, leading to misunderstandings.
              </p>
            </div>

            {/* Problem 6 */}
            <div className="p-6 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Manual Queue & Triage Challenges</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Waiting lounges lack preliminary symptom screening. Potential urgent red flags sit unstratified in standard queues without clinical triage alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE AYURAI SOLUTION & WORKFLOW SECTION */}
      <section id="workflows" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 border border-teal-300 text-teal-900 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-ayur-700" />
              <span>End-to-End Clinical Continuum</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              The AYURAI Solution Workflow
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              From waiting-room intake to verified prescription, AYURAI structures the entire pre-consultation and clinical workflow in 10 seamless steps.
            </p>
          </div>

          {/* 10-Step Workflow Stepper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-ayur-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-ayur-700 text-white font-black text-xs flex items-center justify-center">1</span>
                <Badge variant="primary" size="sm">Intake</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Registration</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fast demographic & vital signs capture via phone or hospital kiosk.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-ayur-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-ayur-700 text-white font-black text-xs flex items-center justify-center">2</span>
                <Badge variant="secondary" size="sm">Queue</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Token Generation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instant OPD token with live waiting position and room assignment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-ayur-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-ayur-700 text-white font-black text-xs flex items-center justify-center">3</span>
                <Badge variant="info" size="sm">Interactive</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">AI Case Taking</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Conversational anamnesis covering chief complaints, Ahara & Nidra.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-ayur-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-ayur-700 text-white font-black text-xs flex items-center justify-center">4</span>
                <Badge variant="vata" size="sm">Doshas</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Ayurvedic Assessment</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pre-scoring of Prakriti, Vikriti, Agni type, and Koshtha traits.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-ayur-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-ayur-700 text-white font-black text-xs flex items-center justify-center">5</span>
                <Badge variant="secondary" size="sm">EHR OCR</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Document Upload</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Smart OCR extracts and tags lab reports and prior prescriptions.
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-ayur-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-indigo-700 text-white font-black text-xs flex items-center justify-center">6</span>
                <Badge variant="info" size="sm">Draft</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Structured Summary</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                AI synthesizes a 14-domain preliminary clinical brief for doctor.
              </p>
            </div>

            {/* Step 7 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-ayur-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center">7</span>
                <Badge variant="danger" size="sm">Safety</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Red-Flag Screening</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Early-warning heuristic alerts flag potential urgent symptoms.
              </p>
            </div>

            {/* Step 8 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-ayur-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center">8</span>
                <Badge variant="warning" size="sm">Triage</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Staff Review</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Staff validates potential red flags before priority queue adjustment.
              </p>
            </div>

            {/* Step 9 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-ayur-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center">9</span>
                <Badge variant="success" size="sm">Doctor</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Doctor Consultation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vaidya reviews summary, performs Pariksha, and prescribes Rx.
              </p>
            </div>

            {/* Step 10 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-ayur-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-ayur-800 text-white font-black text-xs flex items-center justify-center">10</span>
                <Badge variant="primary" size="sm">Care</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Follow-up Tracking</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scheduled reviews, treatment adherence, and symptom progression.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HIGHLIGHTED CAPABILITIES / KEY PILLARS */}
      <section id="features" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ayur-100 border border-ayur-300 text-ayur-900 text-xs font-bold">
              <Layers className="w-3.5 h-3.5 text-ayur-700" />
              <span>Platform Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Modern Clinical Practice
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Eight unified technological pillars bridging traditional Ayurvedic philosophy with modern healthcare operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Patient Phone */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 hover:border-ayur-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-ayur-100 text-ayur-800 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">📱 Patient Phone</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Self-service mobile anamnesis allowing patients to submit history, symptoms, and lifestyle habits from the waiting lounge or home.
              </p>
            </div>

            {/* Pillar 2: Hospital Kiosk */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 hover:border-ayur-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">🖥️ Hospital Kiosk</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accessibility-first touchscreen intake terminal for walk-in OPD patients who may lack smartphones or personal digital access.
              </p>
            </div>

            {/* Pillar 3: Multilingual */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 hover:border-ayur-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <Languages className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">🗣️ Multilingual Support</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full voice & text support across Hindi, English, Kannada, Tamil, Telugu, and Malayalam with automatic clinical terminology translation.
              </p>
            </div>

            {/* Pillar 4: Ayurvedic Assessment */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 hover:border-ayur-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">🌿 Ayurvedic Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Structured frameworks for Prakriti, Vikriti, Agni, Koshtha, Ashtavidha Pariksha, and Dashavidha Pariksha documentation.
              </p>
            </div>

            {/* Pillar 5: Document Intelligence */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 hover:border-ayur-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">📄 Document Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Intelligent OCR and entity extraction from prior prescriptions, lab reports, and imaging documents into a structured chronological timeline.
              </p>
            </div>

            {/* Pillar 6: AI-Assisted Summary */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 hover:border-ayur-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">🤖 AI-Assisted Summary</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates a 14-section preliminary clinical draft organized for doctor review, cutting consultation note-taking time by over 70%.
              </p>
            </div>

            {/* Pillar 7: Early Warning / Red-Flag Screening */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 hover:border-ayur-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">⚠️ Red-Flag Screening</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated heuristic safety screening identifies potential urgent symptoms (e.g. acute chest pain, hemoptysis) for prompt staff triage review.
              </p>
            </div>

            {/* Pillar 8: Practitioner-in-the-Loop */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 hover:border-ayur-400 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">👨‍⚕️ Practitioner-in-the-Loop</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doctor retains absolute clinical authority. All AI findings remain draft recommendations requiring explicit practitioner verification and acceptance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RESPONSIBLE AI SECTION */}
      <section id="responsible-ai" className="py-16 lg:py-24 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-900/80 border border-teal-500/40 text-teal-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Ethical AI & Clinical Governance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              &ldquo;AYURAI assists. Practitioners decide.&rdquo;
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              AYURAI is intentionally engineered as an administrative and pre-intake decision support assistant. We strictly maintain that clinical diagnosis and patient treatment remain the exclusive purview of qualified Ayurvedic doctors.
            </p>
          </div>

          {/* Side-by-Side Responsible AI Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* What AI ASSISTS With */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-900/60 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI ASSISTS WITH:</h3>
                  <p className="text-xs text-teal-300 font-medium">Intelligent Clinical Support & Structuring</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-900/80 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Case-Taking:</strong> Conversational multilingual symptom & lifestyle anamnesis</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-900/80 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Information Structuring:</strong> Organizing raw patient complaints into 14 Ayurvedic domains</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-900/80 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Translation & Standardization:</strong> Real-time mapping between vernacular terms and clinical Sanskrit</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-900/80 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Document Extraction:</strong> OCR synthesis of historical lab reports and medical records</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-900/80 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Preliminary Summary:</strong> Draft briefing ready for doctor review before consultation</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-900/80 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Early-Warning Screening:</strong> Heuristic safety flags for symptoms requiring priority review</span>
                </li>
              </ul>
            </div>

            {/* What AI DOES NOT Do */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI DOES NOT:</h3>
                  <p className="text-xs text-rose-300 font-medium">Strict Non-Autonomous Boundaries</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-900/80 text-rose-300 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/40">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Replace Doctors:</strong> AYURAI never replaces qualified Ayurvedic practitioners (Vaidyas)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-900/80 text-rose-300 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/40">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Make Final Diagnosis:</strong> All Rogi/Roga conclusions are determined solely by the attending doctor</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-900/80 text-rose-300 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/40">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Independently Prescribe:</strong> Medications, dosages, and Anupana require manual practitioner verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-900/80 text-rose-300 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/40">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Auto-Change Queue Priority:</strong> Red flags require mandatory human staff triage validation</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-rose-900/80 text-rose-300 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/40">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Claim Clinical Finality:</strong> All AI outputs carry visible &ldquo;AI-assisted draft&rdquo; watermarks</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mandatory Governance Notice Card */}
          <div className="max-w-5xl mx-auto p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3.5">
            <HeartHandshake className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-amber-300 text-sm">Medical AI Protocol & Non-Replacement Mandate</h5>
              <p className="text-slate-300 text-xs leading-relaxed">
                Ayurvedic Medical Disclaimer: AI suggestions are assistive tools for clinical workflow support and do not replace professional medical diagnosis by a registered BAMS/MD Ayurvedic physician. Final clinical interpretation, diagnosis, and prescription are exclusively determined by the qualified practitioner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ROLE SELECTOR / DEMO ACCESS GRID */}
      <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="primary" size="sm">Interactive Judge Showcase</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900">Explore AYURAI by Role</h2>
            <p className="text-sm text-slate-600">
              Click any portal below to experience the live frontend prototype across all 4 stakeholder perspectives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Patient Portal Card */}
            <Card className="p-6 space-y-4 hover:border-ayur-400 hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-ayur-100 text-ayur-800 flex items-center justify-center font-bold">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">1. Patient Experience</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Self-registration, conversational case-taking, live token tracker, and care timeline.
                </p>
              </div>
              <NavLink to="/patient" className="block pt-2">
                <Button variant="outline" className="w-full text-xs font-semibold" icon={ChevronRight} iconPosition="right">
                  Launch Patient Portal
                </Button>
              </NavLink>
            </Card>

            {/* Staff Portal Card */}
            <Card className="p-6 space-y-4 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">2. Staff Desk</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Frontdesk queue management, patient verification, and red-flag triage validation.
                </p>
              </div>
              <NavLink to="/staff" className="block pt-2">
                <Button variant="outline" className="w-full text-xs font-semibold" icon={ChevronRight} iconPosition="right">
                  Launch Staff Desk
                </Button>
              </NavLink>
            </Card>

            {/* Doctor Portal Card */}
            <Card className="p-6 space-y-4 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">3. Vaidya Clinical Desk</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  14-point structured clinical summary, Ashtavidha Pariksha, and classical Rx builder.
                </p>
              </div>
              <NavLink to="/doctor" className="block pt-2">
                <Button variant="outline" className="w-full text-xs font-semibold" icon={ChevronRight} iconPosition="right">
                  Launch Doctor Desk
                </Button>
              </NavLink>
            </Card>

            {/* Admin Portal Card */}
            <Card className="p-6 space-y-4 hover:border-slate-400 hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">4. Admin Operations</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Healthcare operations analytics, doctor/staff rosters, and clinical governance settings.
                </p>
              </div>
              <NavLink to="/admin" className="block pt-2">
                <Button variant="outline" className="w-full text-xs font-semibold" icon={ChevronRight} iconPosition="right">
                  Launch Admin Suite
                </Button>
              </NavLink>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION BANNER */}
      <section className="py-14 bg-gradient-to-r from-ayur-900 via-ayur-800 to-teal-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-ayur-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-ayur-300" />
            <span>Smart India Hackathon 2026 Evaluation Prototype</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to experience next-generation Ayurvedic digital care?
          </h2>
          <p className="text-xs sm:text-sm text-ayur-100 max-w-xl mx-auto leading-relaxed">
            Test the live frontend prototype across Patient Intake, Staff Triage, Vaidya Doctor Desk, and Hospital Administration.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5 pt-2">
            <NavLink to="/login">
              <Button variant="secondary" size="lg" icon={UserCheck} className="font-bold shadow-md">
                Launch Role Selector
              </Button>
            </NavLink>
            <NavLink to="/patient/register">
              <Button size="lg" icon={ArrowRight} iconPosition="right" className="font-bold bg-white text-slate-900 hover:bg-slate-100 border-none shadow-md">
                Try Live Patient Intake
              </Button>
            </NavLink>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default LandingPage;

