import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  Stethoscope,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Clock,
  Heart,
  Activity,
  Layers,
  FileText,
  UserCheck,
  Languages,
  Globe2,
  ShieldAlert,
  Calendar,
  Pill,
  Utensils,
  Ban,
  Plus,
  Trash2,
  Save,
  Check,
  Flame,
  Printer,
  ChevronRight,
  Info,
  CheckSquare
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { ASHTAVIDHA_PARIKSHA_DATA } from '../../data/ayurvedicAssessmentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const ConsultationRoom = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // ==========================================
  // PRACTITIONER DECISION STATE (DOCTOR CONTROLLED)
  // ==========================================

  // 1. Clinical Observations
  const [clinicalObservations, setClinicalObservations] = useState({
    generalFindings: 'Patient is conscious, oriented, and moderately distressed with epigastric burning discomfort. Mild tenderness on deep epigastric palpation without guarding or rigidity.',
    nadiPulse: 'Manduka Gati (Frog jump, Pitta dominant, 78 bpm, warm pulse, regular rhythm)',
    jihwaTongue: 'Raktavarna with mild yellow coating at center (Samata present, requires Deepana-Pachana)',
    sampraptiProgression: 'Mithya Ahara (irregular spicy food & late dinner) → Pitta Prakopa → Agnimandya / Vidagdha Ajeerna → Urdhwaga Amlapitta manifestation.',
    bowelMala: 'Mridu Koshtha, 2-3 loose motions daily, burning sensation post-spicy meals'
  });

  // 2. Final Assessment / Diagnosis
  const [finalDiagnosis, setFinalDiagnosis] = useState({
    classicalDiagnosis: 'Urdhwaga Amlapitta with Pitta-Vata Dushti',
    ayushNamasteCode: 'NAMASTE: AG-042 (Urdhwaga Amlapitta / Hyperacidity Syndrome)',
    chikitsaType: 'Shamana Chikitsa with Deepana-Pachana & Mridu Snehana',
    diseaseStage: 'Active Acute Exacerbation on Chronic Background (6 months)'
  });

  // 3. Treatment Plan (Pathya & Apathya)
  const [treatmentPlan, setTreatmentPlan] = useState({
    chikitsaPrinciples: 'Deepana (kindle digestive fire) → Pachana (digest metabolic Ama) → Pitta Shamana (pacify acidic burning) → Anulomana (normalize downward Vata motility)',
    pathyaAhara: 'Old Basmati rice, Mudga Yusha (Moong dal soup), Cow Ghee in moderate quantity, Pomegranate, Tender coconut water, Boiled cooled water (Ushnodaka).',
    apathyaAhara: 'Excessive green chilies, sour curds, deep fried snacks, vinegar, late dinners after 10:30 PM, carbonated cold beverages, daytime sleeping.',
    viharaAdvice: 'Regular sleep schedule (retire before 10:30 PM), light morning walks (Ardhashakti), Shitali & Sheetkari Pranayama for Pitta cooling.'
  });

  // 4. Medicines, 5. Dosage, 6. Instructions
  const [medicinesList, setMedicinesList] = useState([
    {
      id: 'med-1',
      drugName: 'Avipattikar Churna',
      form: 'Churna (Herbal Powder)',
      dosage: '3 to 5 grams',
      frequency: 'Twice daily (BD)',
      timing: 'Abhakta (30 mins before breakfast & dinner)',
      anupana: 'Lukewarm water / Honey',
      duration: '15 Days',
      instructions: 'Take with warm water before meals to regulate Jatharagni and neutralize gastric acidity.'
    },
    {
      id: 'med-2',
      drugName: 'Praval Pishti',
      form: 'Bhasma / Pishti',
      dosage: '250 mg',
      frequency: 'Twice daily (BD)',
      timing: 'Pragbhakta (With first morsel of meal)',
      anupana: 'Gulkand / Tender coconut water',
      duration: '15 Days',
      instructions: 'Pacifies active burning sensation (Daha) and sour regurgitation (Amlodgara).'
    },
    {
      id: 'med-3',
      drugName: 'Maharasnadi Kashayam',
      form: 'Kashayam (Decoction)',
      dosage: '15 ml + 45 ml lukewarm water',
      frequency: 'Morning empty stomach (OD)',
      timing: 'Early morning empty stomach (7:00 AM)',
      anupana: 'Lukewarm water',
      duration: '15 Days',
      instructions: 'For early morning bilateral knee joint stiffness and Vata-Pitta shamana.'
    }
  ]);

  // 7. Follow-up Recommendation
  const [followUpRecommendation, setFollowUpRecommendation] = useState({
    followUpDate: '2026-09-17',
    timeSlot: '10:30 AM',
    interval: '14 Days (2 Weeks)',
    clinicalGoal: 'Evaluate Pitta pacification, resolution of retrosternal burning, and repeat Nadi Pariksha for Samata check.'
  });

  // Modal State for adding formulation
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedData, setNewMedData] = useState({
    drugName: 'Kamadudha Rasa (Mukta Yukta)',
    form: 'Vati / Rasa',
    dosage: '1 tablet (250mg)',
    frequency: 'Twice daily (BD)',
    timing: 'Samana (Between meals)',
    anupana: 'Cow Milk / Ghee',
    duration: '15 Days',
    instructions: 'Take between meals for mucosal healing'
  });

  useEffect(() => {
    const fetchPatient = async () => {
      const data = await apiService.getPatientById(id || 'pat-101');
      setPatient(data);
      setLoading(false);
    };
    fetchPatient();
  }, [id]);

  if (loading || !patient) {
    return <div className="p-8 text-center text-slate-400">Loading consultation workspace...</div>;
  }

  const patientLanguageLabel = SUPPORTED_LANGUAGES.find(l => l.code === (patient.preferredLanguage || 'ta'))?.name || 'Tamil';
  const hasRedFlag = patient.priority === 'Potential Red Flag — Review Required' || patient.priority === 'Priority Validated' || (patient.redFlags && patient.redFlags.length > 0);
  const isRedFlagValidated = patient.priority === 'Priority Validated';

  const handleAddMedicine = () => {
    if (!newMedData.drugName.trim()) return;
    setMedicinesList(prev => [
      ...prev,
      {
        id: `med-${Date.now()}`,
        ...newMedData
      }
    ]);
    setShowAddMedModal(false);
  };

  const handleRemoveMedicine = (medId) => {
    setMedicinesList(prev => prev.filter(m => m.id !== medId));
  };

  const handleSaveConsultation = async () => {
    setIsSaved(true);
    await apiService.updatePatientCase(patient.id, {
      consultationNotes: clinicalObservations.generalFindings,
      provisionalDiagnosis: finalDiagnosis.classicalDiagnosis,
      prescribedMedicines: medicinesList,
      treatmentPlan: treatmentPlan,
      followUpRecommendation: followUpRecommendation
    });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Patient Header Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt={patient.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400/40 shrink-0 shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{patient.name}</h1>
                <Badge variant="success" size="sm" dot>Live Consultation</Badge>
                <Badge variant="vata" size="sm" className="font-mono font-bold">Token: {patient.tokenNumber}</Badge>
                <span className="text-xs text-slate-300 font-mono">UHID: {patient.uhid}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
                <span>Age: <strong className="text-white">{patient.age}y</strong></span>
                <span>•</span>
                <span>Gender: <strong className="text-white">{patient.gender}</strong></span>
                <span>•</span>
                <span>Language: <strong className="text-teal-300">{patientLanguageLabel} ({patient.preferredLanguage?.toUpperCase() || 'TA'})</strong></span>
                <span>•</span>
                <span>Room: <strong className="text-white">OPD-102 (Kayachikitsa)</strong></span>
                <span>•</span>
                <span>Vaidya: <strong className="text-white">{user?.name || 'Vaidya Dr. K. Rajesh Sharma'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Consultation Navigation Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <NavLink to={`/doctor/patient/${patient.id}`}>
              <Button variant="secondary" size="md" icon={FileText}>
                360° EHR Dossier
              </Button>
            </NavLink>
            <Button variant="outline" size="md" icon={Save} onClick={handleSaveConsultation}>
              Save Findings
            </Button>
            <NavLink to={`/doctor/prescription/${patient.id}`}>
              <Button variant="primary" size="md" icon={FileCheck} iconPosition="right">
                Prescription Screen
              </Button>
            </NavLink>
          </div>
        </div>

        {/* Potential Red Flag Callout Banner */}
        {hasRedFlag && (
          <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-amber-200 text-xs block font-bold">
                  ⚠ Potential Red Flag Screening Alert
                </strong>
                <span className="text-[11px] text-amber-100">
                  {isRedFlagValidated ? 'Review completed — Validated for Priority OPD Queue' : 'Triage review required — Counter check pending'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm" className="bg-amber-400/30 text-amber-200 border-amber-400 font-bold">
                {isRedFlagValidated ? 'Review Completed' : 'Triage Review Required'}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* MANDATORY CLINICAL GOVERNANCE NOTICE BANNER */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400/60 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-xs uppercase tracking-wide text-amber-950">
              Final prescription and treatment are determined by the qualified Ayurveda practitioner.
            </p>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              AI provides preliminary summary synthesis, document OCR extraction, translation, and triage signals. All clinical assessments, diagnoses, treatments, medicines, dosages, and follow-ups are strictly decided and validated by the attending Vaidya.
            </p>
          </div>
        </div>
        <Badge variant="amber" size="sm" className="shrink-0 font-bold">
          NABH / AYUSH Clinical Standard
        </Badge>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Consultation record saved successfully to clinical EHR registry!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STRONG 2-ZONE VISUAL SEPARATION: AI ASSISTANCE vs PRACTITIONER DECISION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ======================================================================= */}
        {/* ZONE A: AI ASSISTANCE (LEFT COLUMN - 5/12)                             */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Assistance Header Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/30 text-indigo-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                  <span>AI ASSISTANCE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-200 font-mono">
                    Decision Support
                  </span>
                </h2>
                <p className="text-[11px] text-indigo-200">
                  Draft synthesis, OCR extracts, translation & triage
                </p>
              </div>
            </div>
            <Badge variant="indigo" size="sm">Draft Signals</Badge>
          </div>

          {/* 1. AI Summary */}
          <Card className="border-2 border-indigo-100 bg-indigo-50/20 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xs text-indigo-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>1. AI Summary (Clinical Intake Synthesis)</span>
                </CardTitle>
                <Badge variant="indigo" size="sm">AI Generated</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-indigo-200/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <strong className="text-slate-900">Synthesized Chief Complaint:</strong>
                  <span className="text-slate-400 text-[10px]">Intake Wizard</span>
                </div>
                <p className="text-slate-800 text-xs leading-relaxed">
                  38-year-old female presents with 6-month history of post-prandial retrosternal burning, sour eructations (*Amlodgara*), and mild bilateral morning knee stiffness.
                </p>
                <div className="pt-1.5 border-t border-slate-100 flex flex-wrap gap-3 text-[10px] text-slate-500">
                  <span>Duration: <strong className="text-slate-900">6 Months</strong></span>
                  <span>Severity: <strong className="text-slate-900">6/10</strong></span>
                  <span>Prakriti Estimate: <strong className="text-indigo-800 font-bold">Pitta-Vata (Draft)</strong></span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200 text-[11px] text-indigo-900 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-700 shrink-0 mt-0.5" />
                <span>AI draft synthesis requires attending Vaidya pulse & tongue confirmation.</span>
              </div>
            </CardContent>
          </Card>

          {/* 2. Document Extraction (OCR) */}
          <Card className="border-2 border-indigo-100 bg-indigo-50/20 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xs text-indigo-950 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>2. Document Extraction (OCR Scans)</span>
                </CardTitle>
                <Badge variant="secondary" size="sm">2 Scans Processed</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 text-xs">Upper GI Endoscopy Report (15 July 2026)</strong>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">98% OCR Match</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Extracted finding: <span className="font-semibold text-rose-700">&ldquo;Mild diffuse erythema and mucosal friability in antral region; no active ulcer or H. pylori noted.&rdquo;</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 text-xs">LFT & Lipid Panel (15 July 2026)</strong>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">99% OCR Match</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                  <span>SGOT/AST: <strong className="text-slate-900 font-mono">28 U/L (Normal)</strong></span>
                  <span>SGPT/ALT: <strong className="text-slate-900 font-mono">32 U/L (Normal)</strong></span>
                  <span>Total Chol: <strong className="text-slate-900 font-mono">182 mg/dL</strong></span>
                  <span>Hemoglobin: <strong className="text-slate-900 font-mono">13.8 g/dL</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Translation / Standardization */}
          <Card className="border-2 border-indigo-100 bg-indigo-50/20 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xs text-indigo-950 flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-indigo-600" />
                  <span>3. Translation & Standardization</span>
                </CardTitle>
                <Badge variant="primary" size="sm">Mother Tongue: Tamil</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <strong className="text-slate-900">Original Patient Response (Tamil):</strong>
                  <span>Audio/Text Recorded</span>
                </div>
                <p className="text-slate-900 text-xs italic leading-relaxed">
                  &quot;கடந்த 3 வாரங்களாக உணவுக்குப் பின் நெஞ்செரிச்சல் மற்றும் புளித்த ஏப்பம் அதிகமாக உள்ளது. காரமான உணவு சாப்பிட்டால் வயிற்று வலி கூடுகிறது.&quot;
                </p>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-teal-800">
                  <strong className="text-teal-950 font-bold">AYUSH Standardized Clinical Synthesis:</strong>
                  <span className="font-mono">Mapped</span>
                </div>
                <p className="text-teal-950 text-xs font-semibold leading-relaxed">
                  &quot;Severe retrosternal burning (*Amlapitta* / acid reflux) and sour eructation persisting for 3 weeks post-meals, aggravated by spicy / *Ushna Ahara*.&quot;
                </p>
              </div>

              <p className="text-[10px] text-slate-500 italic">
                * Translated/standardized view — verify with patient when clinically necessary.
              </p>
            </CardContent>
          </Card>

          {/* 4. Potential Red-Flag Screening */}
          <Card className="border-2 border-amber-200 bg-amber-50/30 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xs text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>4. Potential Red-Flag Screening</span>
                </CardTitle>
                <Badge variant="warning" size="sm">Triage Signal</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-950 text-xs font-bold">Screening Signal: Chronic PPI Dependency</strong>
                  <Badge variant="urgent" size="sm">Priority Validated</Badge>
                </div>
                <p className="text-[11px] text-slate-700">
                  6-month daily Pantoprazole dependency with rebound acid symptoms. Staff Nurse S. Meenakshi confirmed at desk counter check.
                </p>
              </div>
              <div className="p-2 rounded-lg bg-amber-100/60 border border-amber-300 text-[10px] text-amber-900 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                <span>GOVERNANCE: &ldquo;Potential Red Flag ≠ Diagnosis&rdquo; (Triage decision support only)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ======================================================================= */}
        {/* ZONE B: PRACTITIONER DECISION (RIGHT COLUMN - 7/12)                     */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Practitioner Decision Header Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-ayur-950 text-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/30 text-teal-200">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                  <span>PRACTITIONER DECISION</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 font-mono">
                    Vaidya Clinical Authority
                  </span>
                </h2>
                <p className="text-[11px] text-teal-200">
                  Objective assessment, diagnosis, formulations, dosage & follow-up
                </p>
              </div>
            </div>
            <Badge variant="success" size="sm">Doctor Controlled</Badge>
          </div>

          {/* 1. Clinical Observations */}
          <Card className="border-2 border-teal-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-700" />
                  <span>1. Clinical Observations & Physical Examination</span>
                </CardTitle>
                <Badge variant="success" size="sm">Practitioner Recorded</Badge>
              </div>
              <CardDescription>
                Attending Vaidya examination findings, Nadi Pariksha, Jihwa Samata, and Samprapti Ghataka
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <Textarea
                label="Objective General & Physical Findings"
                rows={2}
                value={clinicalObservations.generalFindings}
                onChange={(e) => setClinicalObservations(prev => ({ ...prev, generalFindings: e.target.value }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nadi (Radial Pulse Rhythm & Gati)"
                  value={clinicalObservations.nadiPulse}
                  onChange={(e) => setClinicalObservations(prev => ({ ...prev, nadiPulse: e.target.value }))}
                />
                <Input
                  label="Jihwa (Tongue Coating & Samata)"
                  value={clinicalObservations.jihwaTongue}
                  onChange={(e) => setClinicalObservations(prev => ({ ...prev, jihwaTongue: e.target.value }))}
                />
              </div>

              <Textarea
                label="Classical Ayurvedic Pathogenesis (Samprapti Ghataka)"
                rows={2}
                value={clinicalObservations.sampraptiProgression}
                onChange={(e) => setClinicalObservations(prev => ({ ...prev, sampraptiProgression: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* 2. Final Assessment / Diagnosis */}
          <Card className="border-2 border-teal-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-700" />
                  <span>2. Final Assessment & Confirmed Classical Diagnosis</span>
                </CardTitle>
                <Badge variant="vata">Final Diagnosis</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Classical Ayurvedic Diagnosis (Nidan)"
                  value={finalDiagnosis.classicalDiagnosis}
                  onChange={(e) => setFinalDiagnosis(prev => ({ ...prev, classicalDiagnosis: e.target.value }))}
                  className="font-bold text-slate-900 text-sm bg-teal-50/30 border-teal-300"
                />
                <Input
                  label="AYUSH NAMASTE / ICD-11 Classification"
                  value={finalDiagnosis.ayushNamasteCode}
                  onChange={(e) => setFinalDiagnosis(prev => ({ ...prev, ayushNamasteCode: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Chikitsa Sutra (Therapeutic Line of Action)"
                  value={finalDiagnosis.chikitsaType}
                  onChange={(e) => setFinalDiagnosis(prev => ({ ...prev, chikitsaType: e.target.value }))}
                />
                <Input
                  label="Disease Chronicity & Staging"
                  value={finalDiagnosis.diseaseStage}
                  onChange={(e) => setFinalDiagnosis(prev => ({ ...prev, diseaseStage: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. Treatment Plan (Chikitsa & Pathya/Apathya) */}
          <Card className="border-2 border-teal-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-700" />
                  <span>3. Treatment Plan & Dietary Regimen (Pathya-Apathya)</span>
                </CardTitle>
                <Badge variant="amber">Diet & Lifestyle</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <Textarea
                label="Chikitsa Sutra & Therapeutic Objectives"
                rows={2}
                value={treatmentPlan.chikitsaPrinciples}
                onChange={(e) => setTreatmentPlan(prev => ({ ...prev, chikitsaPrinciples: e.target.value }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pathya (Beneficial Dietary Protocol)</span>
                  </span>
                  <Textarea
                    rows={3}
                    value={treatmentPlan.pathyaAhara}
                    onChange={(e) => setTreatmentPlan(prev => ({ ...prev, pathyaAhara: e.target.value }))}
                    className="bg-white border-emerald-300"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                  <span className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5 text-rose-700" />
                    <span>Apathya (Contraindicated Foods & Triggers)</span>
                  </span>
                  <Textarea
                    rows={3}
                    value={treatmentPlan.apathyaAhara}
                    onChange={(e) => setTreatmentPlan(prev => ({ ...prev, apathyaAhara: e.target.value }))}
                    className="bg-white border-rose-300"
                  />
                </div>
              </div>

              <Textarea
                label="Vihara Advice (Dinacharya, Sleep Routine, Pranayama)"
                rows={2}
                value={treatmentPlan.viharaAdvice}
                onChange={(e) => setTreatmentPlan(prev => ({ ...prev, viharaAdvice: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* 4. Medicines, 5. Dosage, 6. Instructions */}
          <Card className="border-2 border-teal-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-700" />
                    <span>4. Medicines, 5. Dosage & 6. Instructions</span>
                  </CardTitle>
                  <CardDescription>
                    Classical formulations prescribed exclusively by the attending Vaidya
                  </CardDescription>
                </div>
                <Button size="sm" variant="primary" icon={Plus} onClick={() => setShowAddMedModal(true)}>
                  Add Medicine
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Medicine & Form</th>
                      <th className="py-2.5 px-3">Dosage & Freq</th>
                      <th className="py-2.5 px-3">Timing & Anupana</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicinesList.map((med, idx) => (
                      <tr key={med.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3">
                          <strong className="text-slate-900 block text-xs">{med.drugName}</strong>
                          <span className="text-[10px] text-slate-400">{med.form}</span>
                          <span className="text-[10px] text-teal-900 block mt-0.5">{med.instructions}</span>
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-slate-800 font-mono text-xs block">{med.dosage}</strong>
                          <Badge variant="secondary" size="sm">{med.frequency}</Badge>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-slate-900 block font-medium">{med.timing}</span>
                          <span className="text-[10px] text-teal-800 font-semibold">Anupana: {med.anupana}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">{med.duration}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(med.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                            title="Remove medicine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 7. Follow-up Recommendation */}
          <Card className="border-2 border-teal-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  <span>7. Follow-Up Recommendation</span>
                </CardTitle>
                <Badge variant="primary">Follow-Up Schedule</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Follow-Up Date"
                  type="date"
                  value={followUpRecommendation.followUpDate}
                  onChange={(e) => setFollowUpRecommendation(prev => ({ ...prev, followUpDate: e.target.value }))}
                  className="font-bold text-slate-900"
                />
                <Input
                  label="Appointment Time Slot"
                  value={followUpRecommendation.timeSlot}
                  onChange={(e) => setFollowUpRecommendation(prev => ({ ...prev, timeSlot: e.target.value }))}
                />
                <Input
                  label="Interval / Duration"
                  value={followUpRecommendation.interval}
                  onChange={(e) => setFollowUpRecommendation(prev => ({ ...prev, interval: e.target.value }))}
                />
              </div>
              <Input
                label="Clinical Objective / Evaluation Milestone"
                value={followUpRecommendation.clinicalGoal}
                onChange={(e) => setFollowUpRecommendation(prev => ({ ...prev, clinicalGoal: e.target.value }))}
              />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-teal-600" />
                <span>All 7 practitioner decisions confirmed by attending Vaidya</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Button variant="outline" size="md" icon={Save} onClick={handleSaveConsultation}>
                  Save Consultation
                </Button>
                <NavLink to={`/doctor/prescription/${patient.id}`}>
                  <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                    Proceed to Official Prescription Screen
                  </Button>
                </NavLink>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddMedModal && (
        <Modal
          isOpen={showAddMedModal}
          onClose={() => setShowAddMedModal(false)}
          title="Add Classical Ayurvedic Medicine"
          subtitle="Prescribed exclusively by attending Vaidya"
        >
          <div className="space-y-4 text-xs">
            <Input
              label="Medicine Name"
              value={newMedData.drugName}
              onChange={(e) => setNewMedData(prev => ({ ...prev, drugName: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Form (Churna, Vati, Kashayam)"
                value={newMedData.form}
                onChange={(e) => setNewMedData(prev => ({ ...prev, form: e.target.value }))}
              />
              <Input
                label="Dosage"
                value={newMedData.dosage}
                onChange={(e) => setNewMedData(prev => ({ ...prev, dosage: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Frequency (BD, OD, TID)"
                value={newMedData.frequency}
                onChange={(e) => setNewMedData(prev => ({ ...prev, frequency: e.target.value }))}
              />
              <Input
                label="Duration (e.g. 15 Days)"
                value={newMedData.duration}
                onChange={(e) => setNewMedData(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Timing (Abhakta, Pragbhakta)"
                value={newMedData.timing}
                onChange={(e) => setNewMedData(prev => ({ ...prev, timing: e.target.value }))}
              />
              <Input
                label="Anupana (Vehicle)"
                value={newMedData.anupana}
                onChange={(e) => setNewMedData(prev => ({ ...prev, anupana: e.target.value }))}
              />
            </div>
            <Textarea
              label="Specific Instructions"
              rows={2}
              value={newMedData.instructions}
              onChange={(e) => setNewMedData(prev => ({ ...prev, instructions: e.target.value }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAddMedModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddMedicine} icon={Plus}>
                Add to Prescription
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ConsultationRoom;
