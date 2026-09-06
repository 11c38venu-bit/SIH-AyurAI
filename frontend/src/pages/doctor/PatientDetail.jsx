import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  User,
  Heart,
  Activity,
  FileText,
  Clock,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Layers,
  Calendar,
  Pill,
  Languages,
  Eye,
  Edit3,
  Plus,
  Save,
  Flag,
  ArrowRight,
  Flame,
  Check,
  History,
  Compass,
  Utensils,
  Moon,
  Droplets,
  ShieldAlert,
  UserCheck,
  Printer,
  QrCode,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import apiService from '../../services/api';
import { ASHTAVIDHA_PARIKSHA_DATA, DASHAVIDHA_PARIKSHA_DATA } from '../../data/ayurvedicAssessmentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { DoshaMeter } from '../../components/common/Progress';
import { Tabs } from '../../components/common/Tabs';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { AiDisclaimerBanner } from '../../components/common/Alert';
import AiClinicalSummary from '../../components/summary/AiClinicalSummary';
import AyurvedicReviewStudio from '../../components/ayurvedic/AyurvedicReviewStudio';
import FollowUpTimeline from '../../components/followup/FollowUpTimeline';

export const PatientDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // AI Summary review actions state
  const [summaryStatus, setSummaryStatus] = useState('pending'); // 'accepted' | 'edited' | 'flagged'
  const [summaryDoctorNote, setSummaryDoctorNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Editable Ayurvedic Assessment State
  const [editableAssessment, setEditableAssessment] = useState({
    prakritiPrimary: 'Pitta-Vata',
    vataScore: 35,
    pittaScore: 50,
    kaphaScore: 15,
    vikriti: 'Pitta Vriddhi (Active mucosal irritation with Vata Anubandha)',
    agni: 'Tikshna Agni (Sharp burning hunger with irregular metabolism)',
    koshtha: 'Mridu Koshtha (2-3 loose bowel evacuations daily)',
    nadi: 'Manduka Gati (Frog jump, Pitta dominant, 78 bpm)',
    jihwa: 'Raktavarna with mild yellow coating at center (Samata)',
    mutra: 'Peeta varna, mild burning micturition',
    mala: 'Peetabha, Mridu, Sasneha',
    shabda: 'Spashta (Clear)',
    sparsha: 'Ushna (Warm to touch)',
    drik: 'Rakta-Pitaabh (Mild conjunctival hyperemia)',
    akriti: 'Madhyama (Medium built)',
    // Dashavidha
    d_sara: 'Rasa-Rakta Madhyama',
    d_samhanana: 'Madhyama Samhanana',
    d_pramana: 'Normal BMI (23.1)',
    d_satmya: 'Ghritha-Dugdha Satmya',
    d_satva: 'Madhyama Satva',
    d_ahara_shakti: 'Tikshna Ahara Shakti',
    d_vyayama_shakti: 'Madhyama Vyayama',
    d_vaya: 'Madhyama Vaya (38 yrs — Pitta Era)',
    // Ahara & Vihara
    pathyaAhara: 'Old Basmati rice, Moong dal soup, Cow ghee, Pomegranate, Coconut water, Ushnodaka',
    apathyaAhara: 'Excessive green chilies, deep fried snacks, sour curds, vinegar, late dinners, chilled beverages',
    viharaAdvice: 'Regular sleep schedule (before 10:30 PM), light morning walks (Ardhashakti), Shitali Pranayama for Pitta cooling',
    practitionerNotes: 'Pulse and tongue confirm Samata with Pitta elevation. Patient advised to initiate Snehana and avoid Ushna-Teekshna Ahara.'
  });

  // Editable Consultation State
  const [consultationNotes, setConsultationNotes] = useState({
    findings: 'Mild epigastric tenderness on deep palpation. No organomegaly. Nadi rhythm confirms Pitta-Vata vitiation.',
    samprapti: 'Mithya Ahara (excess spicy tea/fermented foods) -> Pitta Dosha Prakopa -> Agni Dushti (Vidagdha Ajeerna) -> Urdhwaga Amlapitta manifestation.',
    provisionalDiagnosis: 'Urdhwaga Amlapitta (Hyperacidity / Gastro-Esophageal Reflux)',
    finalDiagnosis: 'Urdhwaga Amlapitta with Pitta-Vata Dushti (ICD-11 / AYUSH NAMASTE: AG-042)',
    pathyaAdvice: 'Old Basmati rice, Mung dal soup, Cow ghee, Pomegranate, Coconut water.',
    apathyaAdvice: 'Strict avoidance of green chilies, deep fried snacks, vinegar, late night dinners, citrus fruits.'
  });

  // Editable Treatment Prescription State
  const [medicinesList, setMedicinesList] = useState([
    {
      id: 1,
      drugName: 'Avipattikar Churna',
      form: 'Churna (Herbal Powder)',
      dosage: '3 to 5 grams',
      frequency: 'Twice daily (BD)',
      duration: '15 Days',
      route: 'Oral (Abhakta)',
      anupana: 'Lukewarm water / Honey',
      instructions: 'Take 30 mins before breakfast and dinner'
    },
    {
      id: 2,
      drugName: 'Praval Pishti',
      form: 'Bhasma / Pishti',
      dosage: '250 mg',
      frequency: 'Twice daily (BD)',
      duration: '15 Days',
      route: 'Oral',
      anupana: 'Gulkand / Coconut water',
      instructions: 'Take immediately after food to pacify burning'
    },
    {
      id: 3,
      drugName: 'Maharasnadi Kashayam',
      form: 'Kashayam (Decoction)',
      dosage: '15 ml with 45 ml warm water',
      frequency: 'Morning empty stomach',
      duration: '15 Days',
      route: 'Oral',
      anupana: 'Warm water',
      instructions: 'Take at 7:00 AM for morning joint stiffness'
    }
  ]);

  // Follow-up state
  const [followUpSchedule, setFollowUpSchedule] = useState({
    date: '2026-09-17',
    time: '10:30 AM',
    interval: '14 Days (2 Weeks)',
    reason: 'Evaluate Pitta pacification, resolution of retrosternal burning, and repeat Nadi Pariksha for Samata check.',
    treatmentContinuation: 'Continue active 15-day course (Avipattikar Churna 5g BD + Praval Pishti 250mg BD + Maharasnadi Kashayam 15ml OD)',
    instructions: 'Avoid sour curds, deep fried snacks, vinegar, and late dinners. Take warm water before sleep. Report immediately if chest burning flares.',
    notes: 'Repeat Nadi Pariksha and inspect tongue central Samata coating. If burning persists, plan for Mridu Virechana.'
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      const data = await apiService.getPatientById(id || 'pat-101');
      if (data) {
        setPatient(data);
        if (data.prakriti) {
          setEditableAssessment(prev => ({
            ...prev,
            prakritiPrimary: data.prakriti.primary,
            vataScore: data.prakriti.vata,
            pittaScore: data.prakriti.pitta,
            kaphaScore: data.prakriti.kapha,
            vikriti: data.prakriti.vikriti,
          }));
        }
      }
      setLoading(false);
    };
    fetchPatientData();
  }, [id]);

  const handleSaveAssessment = async () => {
    setIsSaved(true);
    await apiService.updatePatientCase(patient.id, {
      prakriti: {
        primary: editableAssessment.prakritiPrimary,
        vata: editableAssessment.vataScore,
        pitta: editableAssessment.pittaScore,
        kapha: editableAssessment.kaphaScore,
        vikriti: editableAssessment.vikriti,
      },
      agniStatus: editableAssessment.agni,
      koshthaStatus: editableAssessment.koshtha,
      ashtavidhaAssessment: {
        nadi: editableAssessment.nadi,
        jihwa: editableAssessment.jihwa,
        mutra: editableAssessment.mutra,
        mala: editableAssessment.mala,
        shabda: editableAssessment.shabda,
        sparsha: editableAssessment.sparsha,
        drik: editableAssessment.drik,
        akriti: editableAssessment.akriti,
      },
      dashavidhaAssessment: {
        d3_sara: editableAssessment.d_sara,
        d4_samhanana: editableAssessment.d_samhanana,
        d5_pramana: editableAssessment.d_pramana,
        d6_satmya: editableAssessment.d_satmya,
        d7_satva: editableAssessment.d_satva,
        d8_ahara_shakti: editableAssessment.d_ahara_shakti,
        d9_vyayama_shakti: editableAssessment.d_vyayama_shakti,
        d10_vaya: editableAssessment.d_vaya,
      },
      aharaVihara: {
        pathyaAhara: editableAssessment.pathyaAhara,
        apathyaAhara: editableAssessment.apathyaAhara,
        viharaAdvice: editableAssessment.viharaAdvice,
      },
      practitionerNotes: editableAssessment.practitionerNotes
    });
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddMedicine = () => {
    const newMed = {
      id: Date.now(),
      drugName: 'Triphala Churna',
      form: 'Churna',
      dosage: '3 grams',
      frequency: 'At bedtime (HS)',
      duration: '15 Days',
      route: 'Oral',
      anupana: 'Warm water',
      instructions: 'Take with lukewarm water at bedtime'
    };
    setMedicinesList(prev => [...prev, newMed]);
  };

  const handleRemoveMedicine = (medId) => {
    setMedicinesList(prev => prev.filter(m => m.id !== medId));
  };

  if (loading || !patient) {
    return <div className="p-8 text-center text-slate-400">Loading Patient 360° EHR...</div>;
  }

  const patientLanguageLabel = SUPPORTED_LANGUAGES.find(l => l.code === (patient.preferredLanguage || 'ta'))?.name || 'Tamil';

  const hasRedFlag = patient.priority === 'Potential Red Flag — Review Required' || patient.priority === 'Priority Validated' || (patient.redFlags && patient.redFlags.length > 0);
  const isRedFlagValidated = patient.priority === 'Priority Validated';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_consultation':
        return <Badge variant="inProgress" size="sm" dot>With Doctor</Badge>;
      case 'completed':
        return <Badge variant="completed" size="sm">Completed</Badge>;
      case 'assessment':
        return <Badge variant="primary" size="sm">Case Ready</Badge>;
      case 'waiting':
      default:
        return <Badge variant="waiting" size="sm" dot>Waiting</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Priority Validated':
        return <Badge variant="urgent" size="sm" dot className="font-bold">Priority Validated</Badge>;
      case 'Potential Red Flag — Review Required':
        return <Badge variant="warning" size="sm" className="font-bold bg-amber-100 text-amber-900 border-amber-300">⚠ Review Required</Badge>;
      case 'Normal':
      default:
        return <Badge variant="secondary" size="sm">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Patient Header Bar with exact requested fields */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-ayur-950 text-white shadow-md space-y-4">
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
                <span>Status: {getStatusBadge(patient.tokenStatus)}</span>
                <span>•</span>
                <span>Priority: {getPriorityBadge(patient.priority)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <NavLink to={`/doctor/consultation/${patient.id}`}>
              <Button variant="amber" size="md" icon={Stethoscope}>
                Consultation Room
              </Button>
            </NavLink>
            <NavLink to={`/doctor/prescription/${patient.id}`}>
              <Button variant="primary" size="md" icon={FileCheck}>
                Prescribe Formulations
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
                  ⚠ Potential Red Flag
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
              <button
                type="button"
                onClick={() => setActiveTab('red_flags')}
                className="text-xs text-amber-200 underline font-semibold hover:text-white"
              >
                View Safety Audit →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clinical Directive Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white border border-teal-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            CLINICAL GOVERNANCE: <strong className="text-amber-300 font-bold">&ldquo;Potential Red Flag ≠ Diagnosis&rdquo;</strong> • AI generates draft synthesis only; practitioner diagnosis is final.
          </span>
        </div>
        <Badge variant="primary" size="sm">
          Ayurvedic Case Dossier
        </Badge>
      </div>

      <AiDisclaimerBanner compact />

      {isSaved && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Patient EHR record updated and saved to clinical registry.</span>
        </div>
      )}

      {/* 12 Organized Tabs/Sections */}
      <Tabs
        variant="pills"
        activeTab={activeTab}
        onChange={(tId) => setActiveTab(tId)}
        tabs={[
          { id: 'overview', label: '1. Overview' },
          { id: 'complaints', label: '2. Chief Complaints' },
          { id: 'case_history', label: '3. Case History' },
          { id: 'medical_history', label: '4. Medical History' },
          { id: 'documents', label: '5. Documents' },
          { id: 'ayurvedic', label: '6. Ayurvedic Assessment' },
          { id: 'ai_summary', label: '7. AI Summary' },
          { id: 'red_flags', label: '8. Red Flags' },
          { id: 'consultation', label: '9. Consultation' },
          { id: 'treatment', label: '10. Treatment' },
          { id: 'prescription', label: '11. Prescription' },
          { id: 'followup', label: '12. Follow-Up' },
        ]}
      />

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span>Clinical Snapshot & Presenting Problem</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Chief Complaint</span>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {patient.chiefComplaint}
                  </p>
                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Duration: <strong className="text-slate-900">{patient.duration || '6 months'}</strong></span>
                    <span>Severity: <strong className="text-slate-900">6 / 10</strong></span>
                    <span>Registered: <strong className="text-slate-900">{patient.registrationTime || '09:15 AM'}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Pulse / Nadi</span>
                    <strong className="text-base text-slate-900 font-mono">{patient.vitals?.pulse || 78} bpm</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Blood Pressure</span>
                    <strong className="text-base text-slate-900 font-mono">{patient.vitals?.bp || '124/82'}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Weight / BMI</span>
                    <strong className="text-base text-slate-900 font-mono">{patient.vitals?.weight || 62}kg ({patient.vitals?.bmi || '23.1'})</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Temperature</span>
                    <strong className="text-base text-slate-900 font-mono">{patient.vitals?.temperature || '98.4 F'}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Timeline Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-700" />
                  <span>Longitudinal Care Timeline Snapshot</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="divide-y divide-slate-100">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block">Today&apos;s OPD Intake (Kayachikitsa)</strong>
                      <span className="text-slate-500 text-[11px]">Amlapitta & Sandhigata Vata evaluation with Dr. Rajesh Sharma</span>
                    </div>
                    <Badge variant="inProgress">Today</Badge>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block">Upper GI Scope & LFT Lipid Profile</strong>
                      <span className="text-slate-500 text-[11px]">Mild antral gastritis noted; normal lipid panel</span>
                    </div>
                    <Badge variant="secondary">15 July 2026</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-t-4 border-t-ayur-600">
              <CardHeader>
                <CardTitle className="text-xs">Tri-Dosha Prakriti Ratio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-center">
                <h4 className="text-lg font-bold text-slate-900">{patient.prakriti?.primary || 'Pitta-Vata'}</h4>
                <DoshaMeter
                  vata={patient.prakriti?.vata || 35}
                  pitta={patient.prakriti?.pitta || 50}
                  kapha={patient.prakriti?.kapha || 15}
                />
                <p className="text-[11px] text-slate-500 text-left pt-2">
                  <strong>Pathological Imbalance:</strong> {patient.prakriti?.vikriti || 'Pitta Vriddhi with Vata Anubandha'}
                </p>
              </CardContent>
            </Card>

            {/* Quick Red Flags Card */}
            <Card className="border-l-4 border-l-amber-500 bg-amber-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Clinical Safety Flags ({patient.redFlags?.length || 2})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="font-bold text-amber-950 block">Chronic Antacid Dependency</span>
                  <p className="text-[11px] text-amber-800">6 months of daily Pantoprazole with recurrent burning.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block">Penicillin Allergy</span>
                  <p className="text-[11px] text-slate-600">Documented urticaria rash with allopathic antibiotics.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CHIEF COMPLAINTS */}
      {/* ========================================================= */}
      {activeTab === 'complaints' && (
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>2. Chief Complaints (Pradhana Vedana) & Multilingual Synthesis</span>
              </CardTitle>
              <Badge variant="primary">Mother Tongue: {patientLanguageLabel}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Multilingual Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 text-[11px]">
                  <strong className="text-slate-900">Original Patient Response ({patientLanguageLabel}):</strong>
                  <span className="text-[10px] text-slate-400 font-mono">Patient Voice/Text</span>
                </div>
                <p className="text-slate-900 font-medium text-xs leading-relaxed italic">
                  &quot;கடந்த 3 வாரங்களாக உணவுக்குப் பின் நெஞ்செரிச்சல் மற்றும் புளித்த ஏப்பம் அதிகமாக உள்ளது. காரமான உணவு சாப்பிட்டால் வயிற்று வலி கூடுகிறது.&quot;
                </p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Recorded via: Guided Multilingual Intake Wizard
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-teal-200/60 text-[11px]">
                  <strong className="text-teal-950">Standardized Clinical Synthesis (English / AYUSH):</strong>
                  <span className="text-[10px] text-teal-700 font-mono">Mapped</span>
                </div>
                <p className="text-teal-950 font-semibold text-xs leading-relaxed">
                  &quot;Severe retrosternal burning (Amlapitta / acid reflux) and sour eructation persisting for 3 weeks post-meals, aggravated by spicy / Ushna Ahara.&quot;
                </p>
                <span className="text-[10px] text-teal-800 block pt-1">
                  Standardized View — Vaidya pulse verification required.
                </span>
              </div>
            </div>

            {/* Symptom Characteristics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Onset & Duration</span>
                <strong className="text-slate-900 text-xs block mt-0.5">6 Months (Exacerbation 3 wks)</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Diurnal Peak (Kala)</span>
                <strong className="text-slate-900 text-xs block mt-0.5">Post-meals & Midnight (Pitta)</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Pain Intensity Scale</span>
                <strong className="text-rose-700 text-xs block mt-0.5">6 / 10 (Moderate to Severe)</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CASE HISTORY */}
      {/* ========================================================= */}
      {activeTab === 'case_history' && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>3. Case History & Samprapti Progression</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">Detailed History of Present Illness (HPI)</span>
              <p className="text-slate-800 leading-relaxed text-xs">
                Patient is a 38-year-old software professional who presents with progressive epigastric and retrosternal burning for the past 6 months. Symptoms worsen after consuming spicy food, commercial restaurant meals, and skipping regular breakfasts. Patient reports partial temporary relief with OTC Pantoprazole but experiences rebound acidity when discontinued. Also reports morning stiffness in bilateral knee joints for 2 months.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">Aggravating Factors (Hetu / Prakopa)</span>
                <p className="text-slate-800 text-xs leading-relaxed">
                  Deep fried savory snacks, spicy tomato gravies, late-night dinners after 10:30 PM, prolonged work stress.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Relieving Factors (Upashaya)</span>
                <p className="text-slate-800 text-xs leading-relaxed">
                  Tender coconut water, cold cow milk, early light meals, resting in a quiet cool room.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 4: MEDICAL HISTORY */}
      {/* ========================================================= */}
      {activeTab === 'medical_history' && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-ayur-700" />
              <span>4. Medical History & Lifestyle Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">Past Illnesses & Chronic Conditions</span>
                <p className="text-slate-700">{patient.medicalHistory?.pastIllnesses || 'Mild GERD episodes in 2023, Occasional migraine'}</p>
                <span className="font-bold text-slate-900 block text-sm pt-2">Prior Surgeries</span>
                <p className="text-slate-700">{patient.medicalHistory?.surgeries || 'None'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-rose-700 block text-sm">Drug & Food Allergies</span>
                <p className="text-rose-900 font-semibold">{patient.medicalHistory?.allergies || 'Penicillin (Urticaria skin rash), Dust allergy'}</p>
                <span className="font-bold text-slate-900 block text-sm pt-2">Current Medications</span>
                <p className="text-slate-700">{patient.medicalHistory?.currentMedicines || 'Pantoprazole 40mg OD (Occasional)'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-sm">Family Medical History</span>
                <p className="text-slate-700">{patient.medicalHistory?.familyHistory || 'Father: Hypertension; Mother: Osteoarthritis (Janu Sandhigata Vata)'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-sm">Lifestyle Habits & Daily Routine</span>
                <p className="text-slate-700">{patient.medicalHistory?.habits || 'Non-smoker, Tea (3 cups daily), Sedentary desk job'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 5: DOCUMENTS */}
      {/* ========================================================= */}
      {activeTab === 'documents' && (
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>5. Uploaded Medical Records & Diagnostic Scans ({patient.documents?.length || 2})</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {patient.documents && patient.documents.map((doc) => (
              <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-200 text-slate-700">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{doc.name}</h5>
                    <span className="text-[10px] text-slate-400">{doc.date} • {doc.size} • {doc.status}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" icon={Eye} onClick={() => setPreviewDoc(doc)}>
                  View Document
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 6: AYURVEDIC ASSESSMENT (EDITABLE BY VAIDYA) */}
      {/* ========================================================= */}
      {activeTab === 'ayurvedic' && (
        <AyurvedicReviewStudio
          patientData={patient}
          onSaveAssessment={handleSaveAssessment}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 7: AI SUMMARY (14 SECTIONS + CONTROLS) */}
      {/* ========================================================= */}
      {activeTab === 'ai_summary' && (
        <AiClinicalSummary
          patientData={patient}
          isDoctorView={true}
          onUpdatePatient={(updated) => setPatient(prev => ({ ...prev, ...updated }))}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 8: RED FLAGS & SAFETY AUDIT */}
      {/* ========================================================= */}
      {activeTab === 'red_flags' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-amber-950">
                ⚠ Potential Red Flag — {isRedFlagValidated ? 'Review Completed' : 'Triage Review Required'}
              </p>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Potential Red Flag ≠ Diagnosis. The clinical safety stream detects symptom patterns during intake to ensure prompt counter validation by clinical staff.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Identified Clinical Safety Observations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {patient.redFlags && patient.redFlags.map((rf) => (
                    <div key={rf.id} className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-amber-950 text-xs">{rf.title}</strong>
                        <Badge variant="warning" size="sm">{rf.level}</Badge>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed">{rf.desc}</p>
                      <span className="text-[10px] text-amber-800 font-semibold block pt-1">
                        ✓ Action: {rf.action}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 4-Step Audit Trail */}
            <div className="space-y-4">
              <Card className="border-l-4 border-l-amber-500 bg-amber-50/20 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>4-Step Triage Audit Trail</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <strong className="text-slate-900">1. Alert Generated</strong>
                      <span className="font-mono text-slate-400">09:16 AM</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Digital intake rules flagged 6-month severe retrosternal burning.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <strong className="text-amber-950">2. Reason for Alert</strong>
                      <Badge variant="warning" size="sm">Mucosal Check</Badge>
                    </div>
                    <p className="text-[11px] text-slate-700">Prolonged daily OTC antacid dependency warrants Vaidya review.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-teal-200 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <strong className="text-teal-950">3. Staff Desk Review</strong>
                      <span className="font-mono text-teal-700">09:22 AM</span>
                    </div>
                    <p className="text-[11px] text-slate-700">Nurse S. Meenakshi confirmed no active acute emergency at counter.</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <strong className="text-emerald-950">4. Priority Decision</strong>
                      <Badge variant="urgent" size="sm">Priority Validated</Badge>
                    </div>
                    <p className="text-[11px] text-emerald-900 font-medium">Allocated to OPD-102 priority queue for Vaidya consultation.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 9: CONSULTATION FINDINGS */}
      {/* ========================================================= */}
      {activeTab === 'consultation' && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/60 text-amber-950 flex items-start gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="font-semibold text-xs leading-relaxed">
              <strong>Clinical Governance:</strong> Final prescription and treatment are determined by the qualified Ayurveda practitioner. AI provides decision support drafts only.
            </p>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-ayur-700" />
                  <span>9. Clinical Consultation Findings & Samprapti Studio</span>
                </CardTitle>
                <Badge variant="vata">Practitioner Confirmed</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <strong>Clinical Protocol:</strong> AI-generated differential suggestions do not constitute a diagnosis. The attending Vaidya confirms the definitive Samprapti and Nidan below.
              </div>

            <Textarea
              label="Objective Physical & Examination Findings"
              rows={2}
              value={consultationNotes.findings}
              onChange={(e) => setConsultationNotes(prev => ({ ...prev, findings: e.target.value }))}
            />

            <Textarea
              label="Ayurvedic Pathogenesis (Samprapti Ghataka)"
              rows={3}
              value={consultationNotes.samprapti}
              onChange={(e) => setConsultationNotes(prev => ({ ...prev, samprapti: e.target.value }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Provisional Diagnosis (Nidan)"
                value={consultationNotes.provisionalDiagnosis}
                onChange={(e) => setConsultationNotes(prev => ({ ...prev, provisionalDiagnosis: e.target.value }))}
              />
              <Input
                label="Final Confirmed Classical Diagnosis"
                value={consultationNotes.finalDiagnosis}
                onChange={(e) => setConsultationNotes(prev => ({ ...prev, finalDiagnosis: e.target.value }))}
                className="font-semibold text-slate-900"
              />
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 10: TREATMENT & RX COMPOSER */}
      {/* ========================================================= */}
      {activeTab === 'treatment' && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/60 text-amber-950 flex items-start gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="font-semibold text-xs leading-relaxed">
              <strong>Clinical Governance:</strong> Final prescription and treatment are determined by the qualified Ayurveda practitioner.
            </p>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Pill className="w-4 h-4 text-ayur-700" />
                    <span>10. Classical Formulation Prescription Composer</span>
                  </CardTitle>
                  <CardDescription>Composes Kashayam, Churna, Vati, Bhasma & Rasayana regimens</CardDescription>
                </div>
                <Button size="sm" variant="primary" icon={Plus} onClick={handleAddMedicine}>
                  Add Medicine
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Formulation</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Timing & Anupana</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicinesList.map((med) => (
                      <tr key={med.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <strong className="text-slate-900 block">{med.drugName}</strong>
                          <span className="text-[10px] text-slate-400">{med.form}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{med.dosage}</td>
                        <td className="py-3 px-3"><Badge variant="secondary" size="sm">{med.frequency}</Badge></td>
                        <td className="py-3 px-3">
                          <span className="text-slate-800 block">{med.instructions}</span>
                          <span className="text-[10px] text-teal-800 font-medium">Anupana: {med.anupana}</span>
                        </td>
                        <td className="py-3 px-3 font-mono">{med.duration}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(med.id)}
                            className="text-rose-500 hover:text-rose-700 font-semibold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <NavLink to={`/doctor/prescription/${patient.id}`} className="ml-auto">
                <Button variant="primary" size="md" icon={FileCheck} iconPosition="right">
                  Generate Official Prescription
                </Button>
              </NavLink>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 11: PRESCRIPTION DOSSIER PREVIEW */}
      {/* ========================================================= */}
      {activeTab === 'prescription' && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/60 text-amber-950 flex items-start gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="font-semibold text-xs leading-relaxed">
              <strong>Clinical Governance:</strong> Final prescription and treatment are determined by the qualified Ayurveda practitioner.
            </p>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-teal-700" />
                    <span>11. Official Ayurvedic Prescription & Thermal Slip Dossier</span>
                  </CardTitle>
                  <CardDescription>Digitally authenticated AYUSH prescription with QR validation</CardDescription>
                </div>
                <NavLink to={`/doctor/prescription/${patient.id}`}>
                  <Button size="sm" variant="amber" icon={Edit3}>
                    Edit Prescription
                  </Button>
                </NavLink>
              </div>
            </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">AYURAI CLINICAL OPD RX</h4>
                  <p className="text-[10px] text-slate-500">OPD Suite 102 • Vaidya Dr. K. Rajesh Sharma (MD Kayachikitsa)</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-slate-900">Rx ID: AYUR-RX-2026-0891</span>
                  <span className="text-[10px] text-slate-400 block">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Prescribed Formulations:</span>
                <div className="divide-y divide-slate-200 border rounded-xl overflow-hidden bg-white">
                  {medicinesList.map((m, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900">{m.drugName}</strong>
                        <span className="text-[11px] text-slate-500 ml-2">({m.form})</span>
                        <p className="text-[11px] text-teal-900 mt-0.5">{m.instructions} • Anupana: {m.anupana}</p>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span>{m.dosage}</span>
                        <span className="text-slate-400 block">{m.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-950 text-[11px] space-y-1">
                <strong>Pathya Advice:</strong> Old Basmati rice, Moong dal soup, Cow ghee, Pomegranate, Coconut water.
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 12: FOLLOW-UP SCHEDULE */}
      {/* ========================================================= */}
      {activeTab === 'followup' && (
        <div className="space-y-6">
          <FollowUpTimeline
            activeStep={3}
            consultationDate="03 Sep 2026"
            treatmentDate="03 Sep 2026"
            followUpDate={followUpSchedule.date}
            progressDate="Today"
            nextReviewDate={`${followUpSchedule.date} (${followUpSchedule.time})`}
            doctorName="Vaidya Dr. K. Rajesh Sharma"
            diagnosis="Urdhwaga Amlapitta (Hyperacidity with Pitta-Vata Dushti)"
            treatmentSummary={followUpSchedule.treatmentContinuation}
            adherenceScore="92% (12/13 Doses Taken)"
            symptomStatus="Severity Level 3/10 (Significant Relief)"
          />

          <Card className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-ayur-700" />
                    <span>12. Doctor-Controlled Follow-Up Clinical Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Configure follow-up date, clinical rationale, treatment continuation, interim instructions, and notes
                  </CardDescription>
                </div>
                <Button size="sm" variant="primary" icon={Save} onClick={handleSaveAssessment}>
                  Save Follow-Up
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* 1. Follow-up date & time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="1. Follow-Up Date"
                  type="date"
                  value={followUpSchedule.date}
                  onChange={(e) => setFollowUpSchedule(prev => ({ ...prev, date: e.target.value }))}
                  className="font-bold text-slate-900"
                />
                <Input
                  label="Appointment Slot / Time"
                  value={followUpSchedule.time}
                  onChange={(e) => setFollowUpSchedule(prev => ({ ...prev, time: e.target.value }))}
                />
                <Input
                  label="Follow-Up Interval"
                  value={followUpSchedule.interval}
                  onChange={(e) => setFollowUpSchedule(prev => ({ ...prev, interval: e.target.value }))}
                />
              </div>

              {/* 2. Reason */}
              <Input
                label="2. Clinical Reason for Follow-Up"
                value={followUpSchedule.reason}
                onChange={(e) => setFollowUpSchedule(prev => ({ ...prev, reason: e.target.value }))}
              />

              {/* 3. Treatment continuation */}
              <Textarea
                label="3. Treatment Continuation & Formulations Regimen"
                rows={2}
                value={followUpSchedule.treatmentContinuation}
                onChange={(e) => setFollowUpSchedule(prev => ({ ...prev, treatmentContinuation: e.target.value }))}
              />

              {/* 4. Instructions */}
              <Textarea
                label="4. Interim Instructions for Patient (Diet & Home Protocol)"
                rows={2}
                value={followUpSchedule.instructions}
                onChange={(e) => setFollowUpSchedule(prev => ({ ...prev, instructions: e.target.value }))}
              />

              {/* 5. Notes */}
              <Textarea
                label="5. Practitioner Clinical Notes & Next Evaluation Milestones"
                rows={2}
                value={followUpSchedule.notes}
                onChange={(e) => setFollowUpSchedule(prev => ({ ...prev, notes: e.target.value }))}
              />
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="md" className="ml-auto" onClick={handleSaveAssessment} icon={Save}>
                Save Follow-Up Settings
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Add Clinical Note Modal */}
      {showNoteModal && (
        <Modal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          title="Add Practitioner Clinical Note"
          subtitle="Document specific observations to append to patient summary"
        >
          <div className="space-y-4 text-xs">
            <Textarea
              label="Clinical Note"
              rows={4}
              placeholder="e.g. Verified with patient in Tamil: symptom flares mainly during stressful work periods..."
              value={summaryDoctorNote}
              onChange={(e) => setSummaryDoctorNote(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowNoteModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowNoteModal(false)}>
                Save Note
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.name}
          subtitle={`Uploaded: ${previewDoc.date} • Size: ${previewDoc.size}`}
        >
          <div className="p-6 text-center space-y-3">
            <FileText className="w-12 h-12 text-teal-700 mx-auto" />
            <p className="text-xs text-slate-600">
              Document verified for Vaidya consultation. Contents indexed for Ashtavidha Pariksha.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PatientDetail;
