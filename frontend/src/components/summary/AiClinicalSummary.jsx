import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Heart,
  Activity,
  FileText,
  Clock,
  Layers,
  Flame,
  Droplets,
  Moon,
  Utensils,
  Stethoscope,
  Eye,
  FileCheck,
  Check,
  Edit3,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Monitor,
  Printer,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { DoshaMeter } from '../common/Progress';
import { Modal } from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

/**
 * AI-Assisted Clinical Summary Component
 * Displays the 14-Section Structured Case Summary with Doctor Controls:
 * [Review], [Edit], [Correct], [Accept], [Add Note]
 * Visual Labels: AI Generated, Needs Review, Verified by Practitioner
 */
export const AiClinicalSummary = ({
  patientData,
  isDoctorView = true,
  onUpdatePatient,
  className = ''
}) => {
  // Verification State: 'needs_review' | 'verified' | 'edited' | 'corrected'
  const [summaryStatus, setSummaryStatus] = useState(
    patientData?.summaryStatus || 'needs_review'
  );

  // Modals state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Notes & Corrections state
  const [doctorNotes, setDoctorNotes] = useState(
    patientData?.doctorNotes || [
      {
        id: 1,
        author: 'Vaidya Dr. Ramanathan (BAMS, MD Ayur)',
        timestamp: '2026-09-04 09:40 AM',
        text: 'Intake symptoms consistent with Urdhwaga Amlapitta. Nadi and Jihwa confirm Samata. Initiating Pitta Shamana regimen.'
      }
    ]
  );
  const [newNoteText, setNewNoteText] = useState('');

  const [corrections, setCorrections] = useState(
    patientData?.corrections || []
  );
  const [correctionField, setCorrectionField] = useState('Chief Complaints');
  const [correctionOriginal, setCorrectionOriginal] = useState('6 months chronic');
  const [correctionValue, setCorrectionValue] = useState('3 weeks acute-on-chronic aggravation');
  const [correctionRationale, setCorrectionRationale] = useState('Patient clarified primary acute burning flared up 3 weeks ago after dietary changes.');

  // Editable fields copy
  const [editableData, setEditableData] = useState({
    chiefComplaint: patientData?.chiefComplaint || 'Severe retrosternal burning (Amlapitta) and sour eructation persisting for 3 weeks post-meals, aggravated by spicy foods.',
    history: patientData?.caseIntake?.historyOfPresentIllness || 'Symptom progression started with post-prandial heaviness, progressing to acid regurgitation and burning epigastric pain.',
    pastMedicalHistory: patientData?.medicalHistory?.pastIllnesses || 'Recurrent gastritis episodes in 2024; no surgeries or major hospitalizations.',
    currentMedications: patientData?.medicalHistory?.currentMedicines || 'Omeprazole 20mg OD (self-prescribed, last 2 weeks), occasional antacid gel.',
    allergies: patientData?.medicalHistory?.allergies || 'Mild skin allergy to sulfa-based formulations; intolerance to sour curds.',
    lifestyle: patientData?.medicalHistory?.habits || 'Ahara: Prefers spicy & salty foods (Katu-Lavana), irregular meal timings. Vihara: Sleeps 5-6 hours, high screen time, sedentary desk work.',
    prakritiPrimary: patientData?.prakriti?.primary || 'Pitta-Vata Dvandvaja',
    vataScore: patientData?.prakriti?.vata || 35,
    pittaScore: patientData?.prakriti?.pitta || 50,
    kaphaScore: patientData?.prakriti?.kapha || 15,
    vikriti: patientData?.prakriti?.vikriti || 'Pitta Vriddhi with Vata Anubandha',
    agni: patientData?.agniStatus || 'Tikshna Agni (Hyperactive / Intense burning hunger with rapid digestion)',
    koshtha: patientData?.koshthaStatus || 'Mridu Koshtha (Soft, laxative-sensitive bowel movements 2-3x daily)',
  });

  const handleAcceptSummary = () => {
    setSummaryStatus('verified');
    if (onUpdatePatient) {
      onUpdatePatient({ summaryStatus: 'verified' });
    }
  };

  const handleSaveEdit = () => {
    setSummaryStatus('edited');
    setShowEditModal(false);
    if (onUpdatePatient) {
      onUpdatePatient({
        chiefComplaint: editableData.chiefComplaint,
        prakriti: {
          primary: editableData.prakritiPrimary,
          vata: editableData.vataScore,
          pitta: editableData.pittaScore,
          kapha: editableData.kaphaScore,
          vikriti: editableData.vikriti
        },
        summaryStatus: 'edited'
      });
    }
  };

  const handleAddCorrection = () => {
    if (!correctionValue.trim()) return;
    const newCorr = {
      id: Date.now(),
      field: correctionField,
      original: correctionOriginal,
      corrected: correctionValue,
      rationale: correctionRationale,
      vaidya: 'Vaidya Dr. Ramanathan',
      timestamp: '2026-09-04 09:42 AM'
    };
    setCorrections(prev => [...prev, newCorr]);
    setSummaryStatus('corrected');
    setShowCorrectModal(false);
    setCorrectionValue('');
    setCorrectionRationale('');
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: Date.now(),
      author: 'Vaidya Dr. Ramanathan (BAMS, MD Ayur)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newNoteText.trim()
    };
    setDoctorNotes(prev => [...prev, newNote]);
    setNewNoteText('');
    setShowNoteModal(false);
  };

  const accessMode = patientData?.accessMode || 'phone';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER: TITLE & DRAFT / VERIFICATION LABELS */}
      {/* ------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-ayur-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              AI-Assisted Clinical Summary
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
              DRAFT Intake Synthesis
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Synthesized from patient intake anamnesis, digital triage, classical Ashtavidha/Dashavidha findings, and clinical vitals
          </p>
        </div>

        {/* Visual Labels & Verification Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700 flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Generated</span>
          </span>

          {summaryStatus === 'needs_review' && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/50 flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>Needs Review</span>
            </span>
          )}

          {summaryStatus === 'verified' && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/60 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Verified by Practitioner</span>
            </span>
          )}

          {summaryStatus === 'edited' && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/60 flex items-center gap-1.5 shadow-xs">
              <Edit3 className="w-3.5 h-3.5 text-teal-300" />
              <span>Edited by Practitioner</span>
            </span>
          )}

          {summaryStatus === 'corrected' && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/60 flex items-center gap-1.5 shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 text-sky-300" />
              <span>Clinically Corrected</span>
            </span>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MANDATORY IMMEDIATE CLINICAL DISCLAIMER BANNER */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-xs uppercase tracking-wider text-amber-950">
            AI-assisted preliminary summary — practitioner review required.
          </p>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            This document is a computer-generated preliminary clinical draft compiled to streamline intake anamnesis. It does not constitute a final diagnosis or treatment decision. All entries must be reviewed, calibrated, and signed off by a licensed Ayurvedic medical officer (Vaidya).
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DOCTOR CONTROLS TOOLBAR: [Review] [Edit] [Correct] [Accept] [Add Note] */}
      {/* ------------------------------------------------------------- */}
      {isDoctorView && (
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-ayur-100 text-ayur-800 shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Vaidya Clinical Governance Toolbar</h4>
              <p className="text-[11px] text-slate-500">
                Calibrate AI synthesis, register corrections, add clinical notes, or sign off.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Review Control */}
            <Button
              size="sm"
              variant="outline"
              icon={Eye}
              onClick={() => setShowReviewModal(true)}
            >
              Review
            </Button>

            {/* 2. Edit Control */}
            <Button
              size="sm"
              variant="outline"
              icon={Edit3}
              onClick={() => setShowEditModal(true)}
            >
              Edit
            </Button>

            {/* 3. Correct Control */}
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              onClick={() => setShowCorrectModal(true)}
            >
              Correct
            </Button>

            {/* 4. Add Note Control */}
            <Button
              size="sm"
              variant="outline"
              icon={MessageSquare}
              onClick={() => setShowNoteModal(true)}
            >
              Add Note
            </Button>

            {/* 5. Accept Control */}
            <Button
              size="sm"
              variant={summaryStatus === 'verified' ? 'success' : 'primary'}
              icon={Check}
              onClick={handleAcceptSummary}
            >
              {summaryStatus === 'verified' ? 'Verified & Accepted' : 'Accept'}
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 14 STRUCTURED SECTIONS DOSSIER */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        {/* ========================================================= */}
        {/* 1. PATIENT INFORMATION */}
        {/* ========================================================= */}
        <Card className="border border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-700" />
                <span>1. Patient Information & Demographics</span>
              </CardTitle>
              <Badge variant="vata" size="sm">UHID: {patientData?.uhid || 'AYUR-2026-8942'}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Full Name</span>
                <strong className="text-slate-900 text-sm">{patientData?.name || 'Vaidya Ananya Sharma'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Age & Gender</span>
                <strong className="text-slate-900 text-sm">{patientData?.age || 38} Yrs • {patientData?.gender || 'Female'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Mother Tongue</span>
                <strong className="text-teal-700 text-sm font-semibold">Tamil (தமிழ்)</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Intake Mode</span>
                <span className="text-slate-900 font-semibold text-xs flex items-center gap-1.5 mt-0.5">
                  {accessMode === 'kiosk' ? (
                    <>
                      <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Hospital Kiosk</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                      <span>Patient Phone</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Token Number</span>
                <strong className="text-slate-900 font-mono">{patientData?.tokenNumber || 'A-024'}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Pulse / Nadi</span>
                <strong className="text-slate-900 font-mono">{patientData?.vitals?.pulse || 78} bpm</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                <strong className="text-slate-900 font-mono">{patientData?.vitals?.bp || '138/88 mmHg'}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Weight / BMI</span>
                <strong className="text-slate-900 font-mono">{patientData?.vitals?.weight || 62} kg (23.1)</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 2. CHIEF COMPLAINTS */}
        {/* ========================================================= */}
        <Card className="border border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>2. Chief Complaints (Pradhana Vedana)</span>
              </CardTitle>
              <Badge variant="danger" size="sm">Severity: 7 / 10</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Patient Colloquial Input (Tamil):</span>
                <p className="text-slate-900 font-medium text-xs leading-relaxed italic">
                  &quot;கடந்த 3 வாரங்களாக உணவுக்குப் பின் நெஞ்செரிச்சல் மற்றும் புளித்த ஏப்பம் அதிகமாக உள்ளது. காரமான உணவு சாப்பிட்டால் வயிற்று வலி கூடுகிறது.&quot;
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase block">Standardized Clinical Synthesis:</span>
                <p className="text-teal-950 font-semibold text-xs leading-relaxed">
                  {editableData.chiefComplaint}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 pt-1">
              <span>Duration: <strong className="text-slate-900">3 Weeks (Acute exacerbation of 6 months history)</strong></span>
              <span>Diurnal Peak: <strong className="text-slate-900">Post-lunch & Late night (Pitta Kala)</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 3. HISTORY OF PRESENT ILLNESS */}
        {/* ========================================================= */}
        <Card className="border border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>3. History of Present Illness (Samprapti Progression)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-3 text-xs">
            <p className="text-slate-800 leading-relaxed">
              {editableData.history}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                <span className="text-[10px] font-bold uppercase text-rose-800 block">Aggravating Factors (Hetu / Prakopa)</span>
                <p className="text-slate-800 text-[11px] mt-0.5">Spicy tea, fried savory snacks, skipped breakfasts, mental urgency at work.</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Relieving Factors (Upashaya)</span>
                <p className="text-slate-800 text-[11px] mt-0.5">Cold milk, tender coconut water, fasting, resting in a cool environment.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 4. MEDICAL HISTORY & 5. CURRENT MEDICATIONS & 6. ALLERGIES */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-slate-200 shadow-xs">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 text-xs space-y-2">
              <p className="text-slate-800 leading-snug">{editableData.pastMedicalHistory}</p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Family History: <strong className="text-slate-800">Non-contributory</strong>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-xs">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
                5. Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 text-xs space-y-2">
              <p className="text-slate-800 leading-snug">{editableData.currentMedications}</p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Compliance: <strong className="text-amber-700">Irregular self-dosing</strong>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-xs">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-700">
                6. Allergies & Intolerances
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 text-xs space-y-2">
              <p className="text-rose-950 font-semibold leading-snug">{editableData.allergies}</p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                Food Triggers: <strong className="text-rose-900">Fermented batter, tamarind</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* 7. LIFESTYLE (AHARA-VIHARA / DINACHARYA) */}
        {/* ========================================================= */}
        <Card className="border border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-700" />
                <span>7. Lifestyle & Behavioral Regimen (Ahara-Vihara / Dinacharya)</span>
              </CardTitle>
              <Badge variant="amber" size="sm">Nutritional & Lifestyle</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Ahara (Dietary Intake)</span>
                <p className="text-slate-800 text-[11px] leading-relaxed">
                  Pungent (Katu) & Sour (Amla) dominance. Irregular meal timings (*Vishamashana*), frequent cold water during meals.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Nidra (Sleep Quality)</span>
                <p className="text-slate-800 text-[11px] leading-relaxed">
                  5.5 hours average; light sleep with frequent waking due to retrosternal reflux (*Vataja Nidra*).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Vyayama & Mental State</span>
                <p className="text-slate-800 text-[11px] leading-relaxed">
                  Sedentary desk lifestyle (*Alpa Vyayama*). High deadline stress (*Rajas* dominant temperament).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 8. PRAKRITI & 9. VIKRITI */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span>8. Baseline Constitution (Prakriti)</span>
                </CardTitle>
                <Badge variant="vata" size="sm">{editableData.prakritiPrimary}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3 text-xs">
              <DoshaMeter
                vata={editableData.vataScore}
                pitta={editableData.pittaScore}
                kapha={editableData.kaphaScore}
              />
              <p className="text-[11px] text-slate-500">
                Calculated from 7 lifelong constitutional markers. Subject to attending Vaidya confirmation via Nadi Pariksha.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>9. Active Pathological Imbalance (Vikriti)</span>
                </CardTitle>
                <Badge variant="pitta" size="sm">Active Aggravation</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                <strong className="text-rose-950 block text-sm">{editableData.vikriti}</strong>
                <p className="text-slate-600 text-[11px] mt-1">
                  Pitta aggravation in Amashaya manifesting as burning, with Vata leading to sour regurgitation and irregular motility.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* 10. AGNI & KOSHTHA */}
        {/* ========================================================= */}
        <Card className="border border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>10. Digestive Fire (Agni) & Bowel Dynamics (Koshtha)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Jatharagni State</span>
                <strong className="text-amber-950 text-sm block">{editableData.agni}</strong>
                <p className="text-slate-600 text-[11px]">Intense burning hunger; sharp epigastric distress if food is delayed.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                <span className="text-[10px] font-bold text-indigo-800 uppercase block">Koshtha Profile</span>
                <strong className="text-indigo-950 text-sm block">{editableData.koshtha}</strong>
                <p className="text-slate-600 text-[11px]">Bowel movements loose, sensitive to milk, 2-3 evacuations daily.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 11. ASHTAVIDHA PARIKSHA (8-FOLD) */}
        {/* ========================================================= */}
        <Card className="border border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>11. Ashtavidha Pariksha (Classical 8-Fold Examination)</span>
              </CardTitle>
              <Badge variant="indigo" size="sm">8 Clinical Findings</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">1. Nadi (Pulse)</span>
                <strong className="text-slate-900 text-xs block">Manduka Gati</strong>
                <span className="text-[10px] text-slate-500">78 bpm, warm pulse</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">2. Jihwa (Tongue)</span>
                <strong className="text-slate-900 text-xs block">Raktavarna</strong>
                <span className="text-[10px] text-slate-500">Central Samata coating</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">3. Mutra (Urine)</span>
                <strong className="text-slate-900 text-xs block">Peeta Varna</strong>
                <span className="text-[10px] text-slate-500">Mild burning sensation</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">4. Mala (Stool)</span>
                <strong className="text-slate-900 text-xs block">Mridu Koshtha</strong>
                <span className="text-[10px] text-slate-500">Loose, yellowish stools</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">5. Shabda (Voice)</span>
                <strong className="text-slate-900 text-xs block">Spashta</strong>
                <span className="text-[10px] text-slate-500">Clear & resonant</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">6. Sparsha (Touch)</span>
                <strong className="text-slate-900 text-xs block">Ushna</strong>
                <span className="text-[10px] text-slate-500">Warm skin, oily forehead</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">7. Drik (Eyes)</span>
                <strong className="text-slate-900 text-xs block">Rakta-Pitaabh</strong>
                <span className="text-[10px] text-slate-500">Mild conjunctival hyperemia</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">8. Akriti (Build)</span>
                <strong className="text-slate-900 text-xs block">Madhyama</strong>
                <span className="text-[10px] text-slate-500">Medium physique</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 12. DASHAVIDHA PARIKSHA (10-FOLD) */}
        {/* ========================================================= */}
        <Card className="border border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>12. Dashavidha Pariksha (10-Fold Holistic Clinical Assessment)</span>
              </CardTitle>
              <Badge variant="success" size="sm">10 Holistic Dimensions</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">1. Prakriti</span>
                <strong className="text-slate-800 text-[11px] block">Pitta-Vata</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">2. Vikriti</span>
                <strong className="text-slate-800 text-[11px] block">Pitta Vriddhi</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">3. Sara (Tissues)</span>
                <strong className="text-slate-800 text-[11px] block">Rasa-Rakta Madhyama</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">4. Samhanana</span>
                <strong className="text-slate-800 text-[11px] block">Madhyama Symmetry</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">5. Pramana (BMI)</span>
                <strong className="text-slate-800 text-[11px] block">Normal (23.1)</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">6. Satmya (Habit)</span>
                <strong className="text-slate-800 text-[11px] block">Ghritha Satmya</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">7. Satva (Mind)</span>
                <strong className="text-slate-800 text-[11px] block">Madhyama Satva</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">8. Ahara Shakti</span>
                <strong className="text-slate-800 text-[11px] block">Tikshna Intake</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">9. Vyayama Shakti</span>
                <strong className="text-slate-800 text-[11px] block">Madhyama Stamina</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block">10. Vaya (Age)</span>
                <strong className="text-slate-800 text-[11px] block">Madhyama (38y)</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================= */}
        {/* 13. PREVIOUS REPORTS & 14. POTENTIAL RED FLAGS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>13. Previous Reports & Documents</span>
                </CardTitle>
                <Badge variant="primary" size="sm">2 Records</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Upper GI Endoscopy Report (2025)</strong>
                  <span className="text-[10px] text-slate-500">Mild antral gastritis • OCR Extracted & Verified</span>
                </div>
                <Badge variant="success" size="sm">Verified</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Complete Blood Count & LFT (2026)</strong>
                  <span className="text-[10px] text-slate-500">Normal range • Hb 13.2 g/dL</span>
                </div>
                <Badge variant="success" size="sm">Normal</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>14. Potential Red Flags & Clinical Triage Audit</span>
                </CardTitle>
                <Badge variant="warning" size="sm" className="font-bold">
                  Potential Red Flag ≠ Diagnosis
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-2.5 text-xs">
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <div className="p-2.5 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">1. Alert Generated</span>
                    <strong className="text-slate-900 text-xs">09:16 AM • Digital Intake Screening</strong>
                  </div>
                  <Badge variant="secondary" size="sm">Rule Triggered</Badge>
                </div>
                <div className="p-2.5 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-800 font-bold block">2. Reason for Alert</span>
                    <p className="text-slate-800 text-[11px]">Chronic retrosternal burning (6m) with continuous antacid dependency</p>
                  </div>
                  <Badge variant="warning" size="sm">Mucosal Check</Badge>
                </div>
                <div className="p-2.5 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-teal-800 font-bold block">3. Staff Desk Review</span>
                    <p className="text-slate-800 text-[11px]">Nurse S. Meenakshi verified at counter; no acute distress</p>
                  </div>
                  <span className="text-[10px] text-teal-700 font-mono">09:22 AM</span>
                </div>
                <div className="p-2.5 bg-emerald-50/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold block">4. Final Priority Decision</span>
                    <strong className="text-emerald-950 text-xs">Priority Validated</strong>
                  </div>
                  <Badge variant="urgent" size="sm">Priority Validated</Badge>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[10px] text-amber-950">
                <strong>Hospital Triage Protocol:</strong> &ldquo;AI flags — clinical staff decides.&rdquo; Priority status is verified by clinical staff before doctor consultation.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* DOCTOR NOTES & CORRECTION AUDIT TRAIL */}
        {/* ========================================================= */}
        {(doctorNotes.length > 0 || corrections.length > 0) && (
          <Card className="border-2 border-teal-200/80 bg-teal-50/30 shadow-xs">
            <CardHeader className="pb-2 border-b border-teal-200/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-teal-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span>Attending Vaidya Notes & Clinical Corrections Trail</span>
                </CardTitle>
                <Badge variant="success" size="sm">EHR Audit Log</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3 text-xs">
              {corrections.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-white border border-sky-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-sky-900">Clinical Correction: {c.field}</span>
                    <span className="text-slate-400 font-mono">{c.timestamp}</span>
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <p className="text-slate-500 line-through">Draft: {c.original}</p>
                    <p className="text-slate-900 font-semibold">Corrected: {c.corrected}</p>
                    <p className="text-teal-800 italic">Rationale: {c.rationale}</p>
                  </div>
                </div>
              ))}

              {doctorNotes.map((note) => (
                <div key={note.id} className="p-3 rounded-xl bg-white border border-teal-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-teal-950">{note.author}</span>
                    <span className="text-slate-400 font-mono">{note.timestamp}</span>
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed">{note.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: [Review] Provenance & AI Audit Dialog */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="AI Synthesis Audit & Clinical Provenance"
        subtitle="Review provenance trail and information completeness"
        size="lg"
        footer={
          <Button variant="primary" size="sm" onClick={() => setShowReviewModal(false)}>
            Close Audit
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-1">
            <h5 className="font-bold text-xs">Synthesis Metadata</h5>
            <p className="text-[11px]">Engine: AYURAI Assistive Clinical Synthesis Pipeline (Module 18)</p>
            <p className="text-[11px]">Information Quality: <strong className="text-emerald-700">SUFFICIENT</strong> (Reflects input data completeness, not diagnostic confidence)</p>
            <p className="text-[11px]">Source: Intake responses, past medical history, and verified EHR documents</p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-slate-800">Source Extraction Breakdown:</h5>
            <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
              <div className="p-2.5 bg-slate-50 flex items-center justify-between font-semibold text-slate-700">
                <span>Intake Domain</span>
                <span>Provenance Source</span>
              </div>
              <div className="p-2.5 flex items-center justify-between text-slate-600">
                <span>Chief Complaint</span>
                <Badge variant="vata" size="sm">Colloquial Voice Intake (Tamil)</Badge>
              </div>
              <div className="p-2.5 flex items-center justify-between text-slate-600">
                <span>Prakriti Balance</span>
                <Badge variant="pitta" size="sm">7-Point Trait Questionnaire</Badge>
              </div>
              <div className="p-2.5 flex items-center justify-between text-slate-600">
                <span>Ashtavidha Pariksha</span>
                <Badge variant="indigo" size="sm">Clinical Observation Selector</Badge>
              </div>
              <div className="p-2.5 flex items-center justify-between text-slate-600">
                <span>Red Flags</span>
                <Badge variant="danger" size="sm">Automated Triage Safety Rule</Badge>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: [Edit] Inline Summary Values Editor */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Summary Values (Vaidya Calibration)"
        subtitle="Directly modify synthesis before final record submission"
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <Textarea
            label="Chief Complaints (Standardized Synthesis)"
            rows={2}
            value={editableData.chiefComplaint}
            onChange={(e) => setEditableData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
          />
          <Textarea
            label="History of Present Illness"
            rows={2}
            value={editableData.history}
            onChange={(e) => setEditableData(prev => ({ ...prev, history: e.target.value }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Primary Prakriti"
              value={editableData.prakritiPrimary}
              onChange={(e) => setEditableData(prev => ({ ...prev, prakritiPrimary: e.target.value }))}
            />
            <Input
              label="Active Vikriti"
              value={editableData.vikriti}
              onChange={(e) => setEditableData(prev => ({ ...prev, vikriti: e.target.value }))}
            />
          </div>
          <Input
            label="Agni Status"
            value={editableData.agni}
            onChange={(e) => setEditableData(prev => ({ ...prev, agni: e.target.value }))}
          />
        </div>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: [Correct] Register Clinical Correction Dialog */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={showCorrectModal}
        onClose={() => setShowCorrectModal(false)}
        title="Register Clinical Correction"
        subtitle="Document a discrepancy and provide clinical correction with rationale"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowCorrectModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddCorrection}>
              Save Correction
            </Button>
          </>
        }
      >
        <div className="space-y-3.5 text-xs">
          <Input
            label="Target Summary Section"
            value={correctionField}
            onChange={(e) => setCorrectionField(e.target.value)}
          />
          <Input
            label="Original AI Draft Entry"
            value={correctionOriginal}
            onChange={(e) => setCorrectionOriginal(e.target.value)}
          />
          <Input
            label="Corrected Clinical Value"
            value={correctionValue}
            onChange={(e) => setCorrectionValue(e.target.value)}
            placeholder="Enter the accurate clinical parameter..."
          />
          <Textarea
            label="Practitioner Clinical Rationale"
            rows={2}
            value={correctionRationale}
            onChange={(e) => setCorrectionRationale(e.target.value)}
            placeholder="Explain why this correction was necessary based on clinical examination..."
          />
        </div>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: [Add Note] Practitioner Note Dialog */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Practitioner Clinical Note"
        subtitle="Append clinical impressions or instructions to the permanent summary"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowNoteModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddNote}>
              Append Note
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <Textarea
            label="Attending Vaidya Diagnostic & Management Note"
            rows={4}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="e.g. Advised Snehana pre-treatment, avoid spicy Ushna foods, follow up in 14 days..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default AiClinicalSummary;
