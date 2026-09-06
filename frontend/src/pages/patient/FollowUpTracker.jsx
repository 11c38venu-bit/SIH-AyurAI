import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Heart,
  Sparkles,
  Flame,
  Plus,
  Utensils,
  Ban,
  BellRing,
  History,
  Activity,
  Pill,
  TrendingUp,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Check,
  Stethoscope,
  Smile,
  FileText,
  UserCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/Progress';
import LanguageSelector from '../../components/common/LanguageSelector';
import PatientJourneyTracker from '../../components/patient/PatientJourneyTracker';
import FollowUpTimeline from '../../components/followup/FollowUpTimeline';

export const FollowUpTracker = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [pathyaData, setPathyaData] = useState(null);
  const [symptomIntensity, setSymptomIntensity] = useState(3);
  const [adherenceLogged, setAdherenceLogged] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  // Active Symptoms Checklist & Severity
  const [symptomsList, setSymptomsList] = useState([
    { id: 's1', name: 'Retrosternal Burning (Chest Burning / Heartburn)', initial: 'Severe (8/10)', current: 'Mild (2/10)', status: 'Significant Improvement' },
    { id: 's2', name: 'Sour Eructations (Amlodgara / Acid Belching)', initial: 'Frequent post-meals', current: 'Occasional only', status: 'Improving' },
    { id: 's3', name: 'Bilateral Morning Knee Stiffness', initial: '45 mins stiffness', current: '10 mins mild stiffness', status: 'Moderate Relief' },
    { id: 's4', name: 'Sleep Quality & Night Digestion', initial: 'Broken sleep / Mid-night acid flare', current: '6.5 hrs peaceful sleep', status: 'Resolved' }
  ]);

  // Active Formulations & Adherence
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: 'Avipattikar Churna',
      type: 'Churna (Herbal Powder)',
      dose: '3 to 5g with lukewarm water or honey before meals',
      timing: 'Abhakta (30 mins before food)',
      morning: true,
      evening: true,
      takenMorning: true,
      takenEvening: false,
      instructions: 'Take 30 mins before breakfast and dinner'
    },
    {
      id: 2,
      name: 'Praval Pishti',
      type: 'Pishti / Bhasma',
      dose: '250mg with Gulkand or tender coconut water',
      timing: 'Pragbhakta (With first morsel of meal)',
      morning: true,
      evening: true,
      takenMorning: true,
      takenEvening: true,
      instructions: 'Pacifies active burning sensation'
    },
    {
      id: 3,
      name: 'Maharasnadi Kashayam',
      type: 'Kashayam (Decoction)',
      dose: '15ml in 45ml warm water on empty stomach',
      timing: 'Early morning empty stomach (7:00 AM)',
      morning: true,
      evening: false,
      takenMorning: true,
      takenEvening: false,
      instructions: 'For early morning joint mobility'
    },
  ]);

  // Previous Consultations History
  const pastConsultations = [
    {
      id: 'c1',
      date: '03 September 2026',
      doctor: 'Vaidya Dr. K. Rajesh Sharma (MD Kayachikitsa)',
      department: 'Kayachikitsa (Internal Medicine)',
      room: 'OPD-102',
      chiefComplaint: 'Severe retrosternal burning and morning knee stiffness',
      diagnosis: 'Urdhwaga Amlapitta with Pitta-Vata Dushti',
      pulseObservations: 'Manduka Gati (78 bpm, Pitta-dominant, warm radial pulse)',
      status: 'Initial Assessment Completed'
    },
    {
      id: 'c2',
      date: '15 July 2026',
      doctor: 'Vaidya Dr. Priya S. Nair (MD Panchakarma)',
      department: 'Integrative Gastroenterology',
      room: 'OPD-104',
      chiefComplaint: 'Post-prandial heaviness and acid reflux',
      diagnosis: 'Vidagdha Ajeerna (Incomplete acidic digestion)',
      pulseObservations: 'Sama Pitta Gati',
      status: 'Advised Deepana-Pachana Regimen'
    }
  ];

  // Follow-Up History
  const followUpHistory = [
    {
      id: 'fh-1',
      date: '03 September 2026',
      type: 'OPD Follow-Up Milestone 1',
      doctor: 'Vaidya Dr. K. Rajesh Sharma',
      findings: 'Pulse shows Pitta elevation with Samata coating on tongue. Prescribed 15-day course of Avipattikar Churna and Praval Pishti.',
      treatmentContinuation: 'Initiated Pitta-Shamana Protocol (15 Days)',
      outcome: 'Targeting retrosternal acid neutralisation'
    },
    {
      id: 'fh-2',
      date: '15 July 2026',
      type: 'Prior Clinical Review',
      doctor: 'Vaidya Dr. Priya S. Nair',
      findings: 'Advised lifestyle correction (Dinacharya) and light Mudga diet.',
      treatmentContinuation: 'Dietary Pathya modifications',
      outcome: 'Partial temporary relief noted'
    }
  ];

  useEffect(() => {
    const loadPathya = async () => {
      const data = await apiService.getPathyaGuidelines('pitta');
      setPathyaData(data);
    };
    loadPathya();
  }, []);

  const toggleMed = (id, time) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        if (time === 'morning') return { ...m, takenMorning: !m.takenMorning };
        if (time === 'evening') return { ...m, takenEvening: !m.takenEvening };
      }
      return m;
    }));
  };

  const handleLogToday = () => {
    setAdherenceLogged(true);
    setTimeout(() => setAdherenceLogged(false), 3500);
  };

  const handleSetReminder = () => {
    setReminderSet(true);
    setTimeout(() => setReminderSet(false), 3000);
  };

  const totalDoses = medicines.reduce((acc, m) => acc + (m.morning ? 1 : 0) + (m.evening ? 1 : 0), 0);
  const takenDoses = medicines.reduce((acc, m) => acc + (m.takenMorning ? 1 : 0) + (m.takenEvening ? 1 : 0), 0);
  const adherencePct = Math.round((takenDoses / totalDoses) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Patient Follow-Up & Healing Progress Studio</span>
            <Badge variant="success" size="sm">Care Continuity</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            Track upcoming consultations, treatment adherence, daily symptom improvements, and follow-up timeline
          </p>
        </div>

        <LanguageSelector variant="dropdown" />
      </div>

      {/* Patient Journey Stepper */}
      <PatientJourneyTracker currentStepId={12} variant="compact" />

      {/* ========================================================================= */}
      {/* 5-STAGE CLEAN TIMELINE: Consultation → Treatment → Follow-up → Progress → Next Review */}
      {/* ========================================================================= */}
      <FollowUpTimeline
        activeStep={4}
        consultationDate="03 Sep 2026"
        treatmentDate="03 Sep 2026"
        followUpDate="17 Sep 2026"
        progressDate="Today"
        nextReviewDate="17 Sep 2026 (10:30 AM)"
        doctorName="Vaidya Dr. K. Rajesh Sharma"
        diagnosis="Urdhwaga Amlapitta (Hyperacidity with Pitta-Vata Dushti)"
        treatmentSummary="Avipattikar Churna (5g BD) + Praval Pishti (250mg BD) + Maharasnadi Kashayam (15ml OD)"
        adherenceScore={`${adherencePct}% (${takenDoses}/${totalDoses} Doses)`}
        symptomStatus={`Severity Level ${symptomIntensity}/10 (Mild)`}
      />

      {/* 1. NEXT FOLLOW-UP HERO CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-teal-300 uppercase font-bold tracking-wider">
                  Upcoming Clinical Review
                </span>
                <Badge variant="warning" size="sm" className="font-mono font-bold bg-amber-400/20 text-amber-200 border-amber-400/40">
                  In 13 Days
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Thursday, 17 September 2026 at 10:30 AM
              </h2>
              <p className="text-xs text-slate-300">
                OPD Suite 102 • <strong>Vaidya Dr. K. Rajesh Sharma</strong> (Kayachikitsa) • UHID: AYUR-2026-0891
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="amber"
              size="md"
              icon={BellRing}
              onClick={handleSetReminder}
              className="w-full sm:w-auto font-bold"
            >
              {reminderSet ? '✓ SMS & WhatsApp Scheduled' : 'Set Phone SMS Reminder'}
            </Button>
          </div>
        </div>

        {/* Follow-up Objective & Clinical Reason Banner */}
        <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 text-xs text-teal-100 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-semibold">Doctor&apos;s Follow-Up Objective:</strong>
            <span>&ldquo;Evaluate Pitta pacification response, check resolution of retrosternal burning, and repeat Nadi Pariksha for Samata check.&rdquo;</span>
          </div>
        </div>
      </div>

      {/* 2. PREVIOUS CONSULTATION & PREVIOUS TREATMENT DUAL SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Consultation Summary */}
        <Card className="border-t-4 border-t-indigo-600 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>Previous Consultation</span>
              </CardTitle>
              <Badge variant="secondary" size="sm">03 Sep 2026</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900 text-xs">Vaidya Dr. K. Rajesh Sharma</strong>
                <span className="text-[10px] text-slate-400 font-mono">OPD-102</span>
              </div>
              <p className="text-slate-700">
                <strong>Confirmed Nidan:</strong> Urdhwaga Amlapitta with Pitta-Vata Dushti (Hyperacidity & Joint Stiffness)
              </p>
              <p className="text-[11px] text-teal-900 font-medium">
                <strong>Pulse (Nadi):</strong> Manduka Gati (78 bpm, Pitta dominant, warm radial pulse)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 text-indigo-950 text-[11px] space-y-1">
              <strong>Clinical Assessment Notes:</strong>
              <p className="text-slate-700">
                Gastric mucosal burning aggravated by irregular spicy food and late dinners. Advised Snehana & Pitta-shamaka diet.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Previous / Active Treatment Regimen */}
        <Card className="border-t-4 border-t-teal-600 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-700" />
                <span>Previous / Active Treatment</span>
              </CardTitle>
              <Badge variant="success" size="sm">15-Day Course</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
              {medicines.map((m) => (
                <div key={m.id} className="p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <strong className="text-slate-900 block text-xs">{m.name}</strong>
                    <span className="text-[10px] text-slate-500">{m.dose}</span>
                    <span className="text-[10px] text-teal-800 font-medium block">{m.timing}</span>
                  </div>
                  <Badge variant="primary" size="sm">Active</Badge>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950 text-[11px] flex items-center justify-between">
              <span>Treatment Continuation: <strong>Full 15-day regimen in progress</strong></span>
              <NavLink to="/doctor/prescription/pat-101" className="text-teal-700 underline font-bold hover:text-teal-900">
                View Rx Dossier →
              </NavLink>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. SYMPTOMS TRACKER & 4. ADHERENCE / REMINDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 3. SYMPTOMS & PROGRESS (7/12) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-t-4 border-t-amber-500 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>Symptoms & Healing Progress Tracker</span>
                  </CardTitle>
                  <CardDescription>Self-report daily comfort to inform the next review</CardDescription>
                </div>
                <Badge variant={symptomIntensity <= 3 ? 'success' : 'warning'}>
                  Current Score: {symptomIntensity} / 10
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Interactive Severity Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 text-xs">
                  <span>How intense are your symptoms today?</span>
                  <span className="text-teal-800 font-mono">
                    {symptomIntensity <= 3 ? 'Mild / Significant Relief' : symptomIntensity <= 6 ? 'Moderate Discomfort' : 'Severe Flare'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={symptomIntensity}
                  onChange={(e) => setSymptomIntensity(Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 (Near Zero Discomfort)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe Acid Pain)</span>
                </div>
              </div>

              {/* Active Symptoms Progress Table */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 text-xs block">Symptom Resolution Audit:</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {symptomsList.map((sym) => (
                    <div key={sym.id} className="p-3 flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <strong className="text-slate-900 block text-xs">{sym.name}</strong>
                        <span className="text-[10px] text-slate-400">Baseline: {sym.initial} → Current: {sym.current}</span>
                      </div>
                      <Badge
                        variant={sym.status === 'Resolved' ? 'success' : sym.status === 'Significant Improvement' ? 'success' : 'primary'}
                        size="sm"
                      >
                        {sym.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. ADHERENCE / REMINDERS (5/12) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-t-4 border-t-emerald-600 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Medicine Adherence & Schedule</span>
                </CardTitle>
                <span className="text-xs font-mono font-bold text-emerald-700">{adherencePct}%</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <ProgressBar progress={adherencePct} color="emerald" size="md" />

              <div className="space-y-2">
                <span className="font-bold text-slate-900 block text-[11px]">Today&apos;s Dosage Check:</span>
                <div className="space-y-2">
                  {medicines.map((med) => (
                    <div key={med.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 text-xs">{med.name}</strong>
                        <span className="text-[10px] text-slate-500">{med.type.split(' ')[0]}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {med.morning && (
                          <button
                            type="button"
                            onClick={() => toggleMed(med.id, 'morning')}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                              med.takenMorning
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {med.takenMorning ? '✓ Morning Done' : 'Morning Dose'}
                          </button>
                        )}
                        {med.evening && (
                          <button
                            type="button"
                            onClick={() => toggleMed(med.id, 'evening')}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                              med.takenEvening
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {med.takenEvening ? '✓ Evening Done' : 'Evening Dose'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="primary"
                size="sm"
                onClick={handleLogToday}
                icon={Check}
                className="w-full"
              >
                {adherenceLogged ? '✓ Adherence Logged to Dossier' : 'Save Today&apos;s Intake'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* 5. FOLLOW-UP HISTORY */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-slate-700" />
              <span>Follow-Up & Clinical Review History</span>
            </CardTitle>
            <Badge variant="secondary">{followUpHistory.length} Past Reviews</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40">
            {followUpHistory.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 text-xs">{item.type}</strong>
                    <span className="text-slate-400">•</span>
                    <span className="text-[11px] text-teal-800 font-semibold">{item.doctor}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">{item.findings}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-1">
                  <span>Action: <strong className="text-teal-900">{item.treatmentContinuation}</strong></span>
                  <span>•</span>
                  <span>Outcome: <strong className="text-emerald-900">{item.outcome}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowUpTracker;
