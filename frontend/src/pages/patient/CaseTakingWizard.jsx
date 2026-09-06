import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Save,
  Flame,
  Activity,
  Moon,
  Brain,
  Wind,
  Check,
  RotateCcw,
  Sliders,
  Globe2,
  HelpCircle,
  Eye,
  Type,
  Maximize2,
  Layers,
  Heart,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  ShieldCheck,
  Languages,
  User,
  Clock,
  FileText,
  Pill,
  Utensils,
  UploadCloud,
  Camera,
  FileCheck,
  Plus,
  Trash2,
  AlertTriangle,
  Keyboard,
  MousePointerClick
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/Progress';
import { AiDisclaimerBanner } from '../../components/common/Alert';
import PatientJourneyTracker from '../../components/patient/PatientJourneyTracker';

// 9 Defined Case-Taking Sections
const SECTIONS = [
  { id: 1, key: 'basic_info', title: 'Basic Information', shortTitle: '1. Basic Info', icon: User },
  { id: 2, key: 'chief_complaint', title: 'Chief Complaint', shortTitle: '2. Chief Complaint', icon: Flame },
  { id: 3, key: 'present_history', title: 'History of Present Complaint', shortTitle: '3. Present History', icon: Clock },
  { id: 4, key: 'medical_history', title: 'Medical History', shortTitle: '4. Medical History', icon: FileText },
  { id: 5, key: 'meds_allergies', title: 'Medications & Allergies', shortTitle: '5. Meds & Allergies', icon: Pill },
  { id: 6, key: 'lifestyle', title: 'Lifestyle / Ahara-Vihara', shortTitle: '6. Ahara-Vihara', icon: Utensils },
  { id: 7, key: 'ayurvedic_assessment', title: 'Ayurvedic Assessment', shortTitle: '7. Ayurveda', icon: Activity },
  { id: 8, key: 'documents', title: 'Previous Documents', shortTitle: '8. Documents', icon: UploadCloud },
  { id: 9, key: 'review_submit', title: 'Review & Submit', shortTitle: '9. Review & Submit', icon: CheckCircle2 },
];

export const CaseTakingWizard = () => {
  const { language, changeLanguage, t, currentLanguageMeta } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Active Section (1 to 9)
  const [currentSectionId, setCurrentSectionId] = useState(2); // Start at Chief Complaint or Basic Info

  // Active Input Mode per section: 'select' | 'type' | 'voice'
  const [inputMode, setInputMode] = useState('select');

  // Voice Interaction State (UI Placeholder)
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);

  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [saveToastText, setSaveToastText] = useState('Progress saved successfully!');

  // Accessibility State
  const [fontSizeScale, setFontSizeScale] = useState('normal'); // 'normal' | 'large' | 'xl'
  const [showWorkflowDrawer, setShowWorkflowDrawer] = useState(false);

  // Comprehensive Case Intake Data Model
  const [intakeData, setIntakeData] = useState({
    // Section 1: Basic Information
    fullName: 'Ananya S. Rao',
    age: '38',
    gender: 'Female',
    dob: '1988-05-14',
    phone: '+91 98450 12345',
    emergencyContact: '+91 98450 99887 (Srinivasa Rao - Spouse)',
    occupation: 'Software Engineer (Desk Work)',
    vitals: { bp: '124/82 mmHg', pulse: '78 bpm', weight: '62 kg', height: '164 cm', bmi: '23.1' },

    // Section 2: Chief Complaint ("Where are you experiencing discomfort?")
    discomfortLocation: 'chest_discomfort', // 'chest_discomfort' | 'gastrointestinal' | 'musculoskeletal' | 'respiratory' | 'dermatology' | 'neurological' | 'general_fatigue'
    chiefComplaintCustomText: '',

    // Section 3: History of Present Complaint (Adaptive Questions)
    onsetTiming: '1_to_6_months', // 'today', 'less_than_week', '1_to_4_weeks', '1_to_6_months', 'more_than_6_months'
    severityLevel: 6, // 1 - 10
    painPattern: 'post_meals', // 'continuous', 'intermittent', 'empty_stomach', 'post_meals', 'late_night'
    associatedSymptoms: ['acid_reflux', 'burning_throat', 'morning_stiffness'], // multi-select array

    // Section 4: Medical History
    pastIllnesses: ['gerd_gastritis', 'migraine_past'],
    surgeries: 'None',
    familyHistory: ['hypertension_father', 'arthritis_mother'],

    // Section 5: Medications & Allergies
    currentMedications: 'Pantoprazole 40mg (taken occasionally during severe burning episodes)',
    allergies: ['penicillin_allergy', 'dust_pollen'],

    // Section 6: Lifestyle / Ahara-Vihara
    dietType: 'lacto_vegetarian', // 'strict_veg', 'lacto_vegetarian', 'non_veg', 'vegan'
    spicePreference: 'high_spicy', // 'high_spicy', 'moderate', 'mild_bland'
    mealRegularity: 'irregular_delayed', // 'regular_on_time', 'irregular_delayed', 'skips_meals'
    waterIntake: '1.5_to_2.5_liters',
    activityLevel: 'sedentary_desk', // 'sedentary_desk', 'light_walk', 'yoga_pranayama', 'gym_sports'
    sleepSchedule: 'late_night', // 'early_10pm', 'moderate_11pm', 'late_night'

    // Section 7: Ayurvedic Assessment (Agni, Koshtha, Nidra)
    agniAppetite: 'tikshna', // 'sama', 'tikshna', 'manda', 'vishama'
    koshthaBowel: 'mridu', // 'mridu', 'madhyama', 'krura'
    nidraQuality: 'disturbed_light', // 'deep_heavy', 'moderate_pitta', 'disturbed_light'

    // Section 8: Previous Documents
    attachedDocuments: [
      { id: 1, name: 'Upper GI Endoscopy Report.pdf', type: 'Endoscopy', date: '15 July 2026', size: '2.4 MB' },
      { id: 2, name: 'CBC & Lipid Profile.pdf', type: 'Lab Report', date: '02 June 2026', size: '1.1 MB' },
    ],
  });

  // Calculate Overall Progress
  const progressPct = Math.round((currentSectionId / SECTIONS.length) * 100);

  // Field change handler
  const updateField = (field, val) => {
    setIntakeData(prev => ({ ...prev, [field]: val }));
  };

  // Toggle multi-select items
  const toggleMultiSelect = (field, itemValue) => {
    setIntakeData(prev => {
      const currentList = prev[field] || [];
      const exists = currentList.includes(itemValue);
      const updatedList = exists
        ? currentList.filter(i => i !== itemValue)
        : [...currentList, itemValue];
      return { ...prev, [field]: updatedList };
    });
  };

  // Save Progress draft
  const handleSaveProgress = async (customMessage) => {
    setIsSaving(true);
    await apiService.updatePatientCase(user.id || 'pat-101', {
      caseIntake: intakeData,
      preferredLanguage: language,
    });
    setIsSaving(false);
    setSaveToastText(customMessage || 'AI-assisted case-taking progress saved! You can resume anytime.');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Navigation handlers
  const handleNextSection = () => {
    if (currentSectionId < 9) {
      setCurrentSectionId(curr => curr + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmitCase();
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionId > 1) {
      setCurrentSectionId(curr => curr - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitCase = async () => {
    setIsSaving(true);
    await apiService.updatePatientCase(user.id || 'pat-101', {
      caseIntake: intakeData,
      chiefComplaint: `Chest Discomfort / Hyperacidity (Amlapitta) — Duration: 6 months, Severity: 6/10`,
      preferredLanguage: language,
    });
    setIsSaving(false);
    navigate('/patient/assessment');
  };

  // Voice recognition simulation
  const toggleVoice = () => {
    if (!isVoiceListening) {
      setIsVoiceListening(true);
      const samplePhrases = {
        en: 'I have intense burning in chest and sour acid taste after meals for 3 weeks.',
        ta: 'கடந்த 3 வாரங்களாக உணவுக்குப் பின் நெஞ்செரிச்சல் மற்றும் புளித்த ஏப்பம் அதிகமாக உள்ளது.',
        hi: 'मुझे पिछले 3 हफ़्तों से भोजन के बाद सीने में तेज़ जलन और खट्टी डकारें आ रही हैं।',
        ml: 'കഴിഞ്ഞ 3 ആഴ്ചയായി ഭക്ഷണത്തിനു ശേഷം നെഞ്ചെരിച്ചിലും പുളിച്ചുതികട്ടലും അനുഭവപ്പെടുന്നു.',
        te: 'గత 3 వారాలుగా భోజనం చేసిన తర్వాత ఛాతీలో తీవ్రమైన మంట మరియు పుల్లటి తేన్పులు వస్తున్నాయి.',
        kn: 'ಕಳೆದ 3 ವಾರಗಳಿಂದ ಊಟದ ನಂತರ ಎದೆಯುರಿ ಮತ್ತು ಹುಳಿ ತೇಗು ಹೆಚ್ಚಾಗಿದೆ.',
      };
      setVoiceTranscript(`[Speech Recorded in ${currentLanguageMeta.nativeName}]: "${samplePhrases[language] || samplePhrases.en}"`);
      setTimeout(() => {
        setIsVoiceListening(false);
      }, 3500);
    } else {
      setIsVoiceListening(false);
    }
  };

  // Audio Read-Aloud simulation
  const toggleAudioReadAloud = () => {
    if (!isSpeakingAudio) {
      setIsSpeakingAudio(true);
      setTimeout(() => {
        setIsSpeakingAudio(false);
      }, 3500);
    } else {
      setIsSpeakingAudio(false);
    }
  };

  // Font sizing scale classes
  const fontStyles = {
    normal: {
      title: 'text-lg sm:text-xl',
      question: 'text-base sm:text-lg',
      subtext: 'text-xs sm:text-sm',
      cardText: 'text-xs sm:text-sm',
    },
    large: {
      title: 'text-xl sm:text-2xl font-bold',
      question: 'text-lg sm:text-xl font-bold',
      subtext: 'text-sm sm:text-base',
      cardText: 'text-sm sm:text-base font-semibold',
    },
    xl: {
      title: 'text-2xl sm:text-3xl font-extrabold',
      question: 'text-xl sm:text-2xl font-extrabold',
      subtext: 'text-base sm:text-lg font-medium',
      cardText: 'text-base sm:text-lg font-bold',
    },
  }[fontSizeScale];

  // Document upload simulation
  const handleSimulatedDocAdd = () => {
    const newDoc = {
      id: Date.now(),
      name: `Prescription_Slip_${new Date().toLocaleDateString('en-GB')}.pdf`,
      type: 'Prescription',
      date: 'Today',
      size: '1.4 MB'
    };
    setIntakeData(prev => ({
      ...prev,
      attachedDocuments: [...prev.attachedDocuments, newDoc]
    }));
    handleSaveProgress('Document added to case file!');
  };

  const handleRemoveDoc = (docId) => {
    setIntakeData(prev => ({
      ...prev,
      attachedDocuments: prev.attachedDocuments.filter(d => d.id !== docId)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-ayur-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="vata" size="sm" dot>AI-Assisted Case-Taking</Badge>
            <span className="text-xs text-teal-300 font-medium">9-Section Guided Clinical Anamnesis</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Patient Health Intake & Anamnesis
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            A calm, step-by-step intake that captures your symptoms in plain language before your Vaidya consultation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSaveProgress()}
            isLoading={isSaving}
            icon={Save}
          >
            Save / Continue Later
          </Button>
        </div>
      </div>

      <AiDisclaimerBanner compact />
      <PatientJourneyTracker currentStepId={3} variant="compact" />

      {/* Prominent Active Language & Accessibility Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-ayur-100 text-ayur-800">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Selected Language:</span>
                <Badge variant="primary" size="sm" className="font-bold font-sans">
                  {currentLanguageMeta.nativeName} ({currentLanguageMeta.name})
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                You can switch your preferred language at any stage of intake.
              </p>
            </div>
          </div>

          {/* Text Size Accessibility Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Type className="w-3.5 h-3.5" /> Text Size:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setFontSizeScale('normal')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  fontSizeScale === 'normal' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Normal Text Size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeScale('large')}
                className={`px-2.5 py-1 rounded text-sm font-bold transition-all ${
                  fontSizeScale === 'large' ? 'bg-white text-ayur-800 shadow-xs ring-1 ring-ayur-200' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Large Text Size"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSizeScale('xl')}
                className={`px-3 py-1 rounded text-base font-extrabold transition-all ${
                  fontSizeScale === 'xl' ? 'bg-white text-ayur-900 shadow-xs ring-2 ring-ayur-400' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Extra Large (Elderly / High Readability)"
              >
                A++
              </button>
            </div>
          </div>
        </div>

        {/* 6-Language Quick Switcher Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`
                  p-2 rounded-xl border transition-all duration-150 flex flex-col items-center justify-center text-center gap-0.5
                  ${isSelected
                    ? 'bg-ayur-700 text-white border-ayur-700 shadow-sm font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-ayur-300 hover:bg-white'}
                `}
              >
                <span className="text-xs font-bold">{lang.nativeName}</span>
                <span className={`text-[10px] ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>{lang.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Toast Feedback */}
      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveToastText}</span>
        </div>
      )}

      {/* 9-Section Guided Stepper Navigation */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-slate-800">
            Section {currentSectionId} of 9: <span className="text-ayur-800">{SECTIONS[currentSectionId - 1].title}</span>
          </span>
          <span className="font-mono text-slate-500 font-semibold">{progressPct}% Overall Completed</span>
        </div>
        <ProgressBar value={progressPct} />

        {/* Horizontal Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {SECTIONS.map((sec) => {
            const isCurrent = currentSectionId === sec.id;
            const isCompleted = currentSectionId > sec.id;
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setCurrentSectionId(sec.id)}
                className={`
                  px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0
                  ${isCurrent
                    ? 'bg-ayur-700 text-white shadow-sm ring-2 ring-ayur-200'
                    : isCompleted
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-600'}
                `}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span>{sec.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN GUIDED SECTION CARD CONTAINER */}
      <Card className="shadow-lg border-2 border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">Section {currentSectionId} / 9</Badge>
                <CardTitle className={fontStyles.title}>
                  {SECTIONS[currentSectionId - 1].title}
                </CardTitle>
              </div>
              <CardDescription className={fontStyles.subtext}>
                {currentSectionId === 1 && 'Confirm your demographics & basic hospital intake measurements.'}
                {currentSectionId === 2 && 'Identify the primary area or system where you feel health discomfort.'}
                {currentSectionId === 3 && 'Adaptive questions exploring the onset, severity, and patterns of your complaint.'}
                {currentSectionId === 4 && 'Record prior chronic illnesses, surgeries, and family health trends.'}
                {currentSectionId === 5 && 'Document ongoing medications, PPI antacids, and known drug allergies.'}
                {currentSectionId === 6 && 'Ayurvedic Ahara (dietary routine) and Vihara (daily physical lifestyle).'}
                {currentSectionId === 7 && 'Core Ayurvedic metabolic indicators: Agni (appetite), Koshtha (bowel), Nidra (sleep).'}
                {currentSectionId === 8 && 'Attach or capture prior prescription slips and diagnostic lab reports.'}
                {currentSectionId === 9 && 'Review your comprehensive AI-assisted case intake before consulting the Vaidya.'}
              </CardDescription>
            </div>

            {/* Input Mode Switcher (Voice / Type / Select) on question screens */}
            {currentSectionId >= 2 && currentSectionId <= 7 && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setInputMode('select')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    inputMode === 'select' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Touch Select Options"
                >
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span>👆 Select</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('type')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    inputMode === 'type' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Type Custom Text"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>⌨️ Type</span>
                </button>
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isVoiceListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : inputMode === 'voice'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Voice Input (Speech-to-Text Placeholder)"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>🎤 Voice</span>
                </button>
              </div>
            )}
          </div>

          {/* Voice Input Simulated Banner */}
          {isVoiceListening && (
            <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-center gap-2.5 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
              <div className="space-y-0.5">
                <span className="font-bold block">Listening in {currentLanguageMeta.nativeName}...</span>
                <span className="italic">{voiceTranscript}</span>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* ========================================================= */}
          {/* SECTION 1: BASIC INFORMATION */}
          {/* ========================================================= */}
          {currentSectionId === 1 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Patient Name</span>
                  <strong className="text-slate-900 text-sm">{intakeData.fullName}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Age & Gender</span>
                  <strong className="text-slate-900 text-sm">{intakeData.age} Years • {intakeData.gender} (DOB: {intakeData.dob})</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Phone & Emergency Contact</span>
                  <span className="text-slate-800 font-medium">{intakeData.phone} • {intakeData.emergencyContact}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Occupation / Daily Routine</span>
                  <span className="text-slate-800 font-medium">{intakeData.occupation}</span>
                </div>
              </div>

              {/* Vitals Snapshot */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Initial Frontdesk Vitals Recorded
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Blood Pressure</span>
                    <strong className="text-sm font-mono text-slate-900">{intakeData.vitals.bp}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Pulse / Nadi</span>
                    <strong className="text-sm font-mono text-slate-900">{intakeData.vitals.pulse}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Weight / BMI</span>
                    <strong className="text-sm font-mono text-slate-900">{intakeData.vitals.weight} ({intakeData.vitals.bmi})</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-semibold">Height</span>
                    <strong className="text-sm font-mono text-slate-900">{intakeData.vitals.height}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Basic details verified with hospital reception. Click <strong>Continue</strong> to proceed to Chief Complaint.</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 2: CHIEF COMPLAINT */}
          {/* ========================================================= */}
          {currentSectionId === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className={`${fontStyles.question} font-bold text-slate-900`}>
                  Where are you experiencing discomfort?
                </h3>
                <p className={`${fontStyles.subtext} text-slate-500`}>
                  Select the primary bodily region or complaint bringing you to the clinic today:
                </p>
              </div>

              {/* Selection Mode Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: 'chest_discomfort',
                    title: 'Chest Discomfort / Heartburn (Amlapitta)',
                    desc: 'Retrosternal burning sensation, sour regurgitation, acidic reflux, chest fullness',
                    icon: Flame,
                    color: 'text-amber-600 bg-amber-50'
                  },
                  {
                    id: 'gastrointestinal',
                    title: 'Stomach & Digestive System (Agni Dushti)',
                    desc: 'Abdominal cramping, gas bloating, irregular digestion, sluggish bowel',
                    icon: Utensils,
                    color: 'text-orange-600 bg-orange-50'
                  },
                  {
                    id: 'musculoskeletal',
                    title: 'Joints, Spine & Musculoskeletal (Sandhigata Vata)',
                    desc: 'Joint pain, morning stiffness, knee crepitus, low backache, cervical stiffness',
                    icon: Activity,
                    color: 'text-indigo-600 bg-indigo-50'
                  },
                  {
                    id: 'respiratory',
                    title: 'Breathing & Respiratory (Pranavaha Srotas)',
                    desc: 'Chronic cough, breathlessness, wheezing, throat irritation, sinus congestion',
                    icon: Wind,
                    color: 'text-teal-600 bg-teal-50'
                  },
                  {
                    id: 'dermatology',
                    title: 'Skin & Dermatology (Twak Vikara)',
                    desc: 'Skin itching, allergic hives, eczema rashes, excessive dryness, pigmentation',
                    icon: Sparkles,
                    color: 'text-rose-600 bg-rose-50'
                  },
                  {
                    id: 'neurological',
                    title: 'Headache, Sleep & Stress (Manasika)',
                    desc: 'Frequent headaches, migraine, insomnia, restlessness, overthinking, anxiety',
                    icon: Brain,
                    color: 'text-purple-600 bg-purple-50'
                  },
                  {
                    id: 'general_fatigue',
                    title: 'General Fatigue & Metabolism (Dhatu Kshaya)',
                    desc: 'Chronic tiredness, body heaviness, unrefreshing sleep, weight imbalance',
                    icon: Heart,
                    color: 'text-emerald-600 bg-emerald-50'
                  }
                ].map((item) => {
                  const isSelected = intakeData.discomfortLocation === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateField('discomfortLocation', item.id)}
                      className={`
                        p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-150 flex items-start gap-3.5 min-h-[72px]
                        ${isSelected
                          ? 'border-ayur-700 bg-ayur-50/80 text-ayur-950 font-bold shadow-sm ring-4 ring-ayur-100 scale-[1.01]'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'}
                      `}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className={`${fontStyles.cardText} font-bold text-slate-900 block`}>
                          {item.title}
                        </span>
                        <p className="text-xs text-slate-500 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                        isSelected ? 'bg-ayur-700 border-ayur-700 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Type Mode Textarea */}
              {inputMode === 'type' && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700">
                    Describe your complaint in your own words (Optional):
                  </label>
                  <textarea
                    rows={3}
                    value={intakeData.chiefComplaintCustomText}
                    onChange={(e) => updateField('chiefComplaintCustomText', e.target.value)}
                    placeholder="Type additional details about your symptoms..."
                    className="w-full p-4 rounded-2xl border border-slate-300 focus:border-ayur-600 focus:ring-4 focus:ring-ayur-100 outline-none text-xs leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 3: HISTORY OF PRESENT COMPLAINT (ADAPTIVE QUESTIONS) */}
          {/* ========================================================= */}
          {currentSectionId === 3 && (
            <div className="space-y-6">
              {/* Adaptive Header Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Adaptive questions generated for: <strong>Chest Discomfort / Heartburn</strong>
                  </span>
                </div>
                <Badge variant="warning" size="sm">Adaptive Branch</Badge>
              </div>

              {/* Adaptive Question 1: When did it begin? */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-900 block">
                  1. When did your discomfort begin? (Onset & Duration)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'today', label: 'Today / Recent (< 24 hrs)' },
                    { id: 'less_than_week', label: 'Less than 1 week (Navina)' },
                    { id: '1_to_4_weeks', label: '1 to 4 weeks (1 month)' },
                    { id: '1_to_6_months', label: '1 to 6 months' },
                    { id: 'more_than_6_months', label: 'More than 6 months (Jirna / Chronic)' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('onsetTiming', opt.id)}
                      className={`
                        p-3 rounded-xl border text-xs font-semibold text-left transition-all
                        ${intakeData.onsetTiming === opt.id
                          ? 'bg-ayur-700 text-white border-ayur-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adaptive Question 2: Severity Scale (1 - 10) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    2. How severe is your discomfort today?
                  </label>
                  <Badge
                    size="md"
                    variant={intakeData.severityLevel > 7 ? 'danger' : intakeData.severityLevel > 4 ? 'warning' : 'success'}
                  >
                    Level {intakeData.severityLevel} / 10
                  </Badge>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = intakeData.severityLevel === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => updateField('severityLevel', num)}
                        className={`
                          py-3 rounded-xl font-bold font-mono text-sm transition-all
                          ${isSelected
                            ? 'bg-ayur-700 text-white shadow-md ring-4 ring-ayur-100 scale-105'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}
                        `}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 (Mild Discomfort)</span>
                  <span>5 (Moderate / Limits Work)</span>
                  <span>10 (Severe / Debilitating)</span>
                </div>
              </div>

              {/* Adaptive Question 3: Continuous vs Intermittent Pattern */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-900 block">
                  3. Is your discomfort continuous or intermittent?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'post_meals', label: 'Immediately after meals (Within 30-60 mins)' },
                    { id: 'empty_stomach', label: 'On empty stomach / Early morning (Relieved slightly by milk)' },
                    { id: 'late_night', label: 'Late night during sleep (Wakes up with burning)' },
                    { id: 'continuous', label: 'Continuous throughout the entire day' },
                    { id: 'intermittent', label: 'Intermittent episodes coming and going' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('painPattern', opt.id)}
                      className={`
                        p-3 rounded-xl border text-left font-semibold transition-all
                        ${intakeData.painPattern === opt.id
                          ? 'bg-ayur-700 text-white border-ayur-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adaptive Question 4: Associated Symptoms (Multi-Select) */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-900 block">
                  4. Are there any associated symptoms? (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'acid_reflux', label: 'Sour eructation / Acid regurgitation (Amlodgara)' },
                    { id: 'burning_throat', label: 'Burning in throat or chest (Daha)' },
                    { id: 'morning_stiffness', label: 'Morning joint stiffness' },
                    { id: 'radiating_pain', label: 'Pain radiating to back or neck' },
                    { id: 'breathlessness', label: 'Breathlessness / Difficulty catching breath' },
                    { id: 'nausea', label: 'Nausea or vomiting sensation (Utklesha)' },
                    { id: 'headache', label: 'Throbbing headache' },
                    { id: 'sweating', label: 'Excessive sweating / Heat flashes' },
                  ].map((sym) => {
                    const isChecked = intakeData.associatedSymptoms.includes(sym.id);
                    return (
                      <button
                        key={sym.id}
                        type="button"
                        onClick={() => toggleMultiSelect('associatedSymptoms', sym.id)}
                        className={`
                          px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5
                          ${isChecked
                            ? 'bg-ayur-800 text-white border-ayur-800 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}
                        `}
                      >
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-white text-ayur-800' : 'border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5 text-ayur-800" />}
                        </span>
                        <span>{sym.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 4: MEDICAL HISTORY */}
          {/* ========================================================= */}
          {currentSectionId === 4 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 block">
                  Past Illnesses & Chronic Conditions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'gerd_gastritis', label: 'Acid Peptic Disease / GERD / Gastritis' },
                    { id: 'hypertension', label: 'Hypertension (High Blood Pressure)' },
                    { id: 'diabetes', label: 'Type 2 Diabetes' },
                    { id: 'thyroid', label: 'Thyroid Disorder' },
                    { id: 'asthma_allergies', label: 'Bronchial Asthma / Respiratory Allergies' },
                    { id: 'joint_arthritis', label: 'Osteoarthritis / Joint Pain' },
                    { id: 'migraine_past', label: 'Occasional Migraine Episodes' },
                    { id: 'none', label: 'No Prior Chronic Illnesses' },
                  ].map((item) => {
                    const isChecked = intakeData.pastIllnesses.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleMultiSelect('pastIllnesses', item.id)}
                        className={`
                          p-3 rounded-xl border text-left font-semibold flex items-center justify-between transition-all
                          ${isChecked
                            ? 'bg-ayur-50 border-ayur-600 text-ayur-950 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
                        `}
                      >
                        <span>{item.label}</span>
                        {isChecked && <Check className="w-4 h-4 text-ayur-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block">Prior Surgeries or Hospitalizations</label>
                  <input
                    type="text"
                    value={intakeData.surgeries}
                    onChange={(e) => updateField('surgeries', e.target.value)}
                    placeholder="e.g. None or Appendectomy (2018)"
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-ayur-100 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-900 block">Family Health History</label>
                  <input
                    type="text"
                    value="Father: Hypertension; Mother: Joint Arthritis"
                    readOnly
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 5: MEDICATIONS & ALLERGIES */}
          {/* ========================================================= */}
          {currentSectionId === 5 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 block">
                  Current Ongoing Medications (Allopathic / Ayurvedic / Supplements)
                </label>
                <textarea
                  rows={3}
                  value={intakeData.currentMedications}
                  onChange={(e) => updateField('currentMedications', e.target.value)}
                  placeholder="Specify brand name, dosage and frequency..."
                  className="w-full p-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-ayur-100 outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-rose-800 block">
                  Known Drug & Food Allergies (High Clinical Safety Flag)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'penicillin_allergy', label: 'Penicillin (Allopathic Antibiotic hives)' },
                    { id: 'sulfa_drugs', label: 'Sulfa Drugs / Co-Trimoxazole' },
                    { id: 'dairy_lactose', label: 'Milk / Dairy (Lactose Intolerance)' },
                    { id: 'dust_pollen', label: 'Dust, Mites & Pollen Sensitivity' },
                    { id: 'no_allergies', label: 'No Known Drug or Food Allergies' },
                  ].map((item) => {
                    const isChecked = intakeData.allergies.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleMultiSelect('allergies', item.id)}
                        className={`
                          p-3 rounded-xl border text-left font-semibold flex items-center justify-between transition-all
                          ${isChecked
                            ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
                        `}
                      >
                        <span>{item.label}</span>
                        {isChecked && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 6: LIFESTYLE / AHARA-VIHARA */}
          {/* ========================================================= */}
          {currentSectionId === 6 && (
            <div className="space-y-5 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">1. Dietary Pattern (Ahara Routine)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'strict_veg', label: 'Strict Vegetarian' },
                    { id: 'lacto_vegetarian', label: 'Lacto-Vegetarian' },
                    { id: 'non_veg', label: 'Non-Vegetarian' },
                    { id: 'vegan', label: 'Vegan' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('dietType', opt.id)}
                      className={`p-3 rounded-xl border font-semibold text-center transition-all ${
                        intakeData.dietType === opt.id ? 'bg-ayur-700 text-white border-ayur-700' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="font-bold text-slate-900 block">2. Food Taste & Spice Preference</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'high_spicy', label: 'High Spicy & Fried (Katu-Amla dominant)' },
                    { id: 'moderate', label: 'Moderate Spice & Oil' },
                    { id: 'mild_bland', label: 'Mild, Bland & Freshly Cooked' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('spicePreference', opt.id)}
                      className={`p-3 rounded-xl border font-semibold text-left transition-all ${
                        intakeData.spicePreference === opt.id ? 'bg-ayur-700 text-white border-ayur-700' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="font-bold text-slate-900 block">3. Physical Activity & Daily Routine (Vihara)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'sedentary_desk', label: 'Sedentary desk job (< 3,000 steps daily)' },
                    { id: 'light_walk', label: 'Light morning walking (30 mins daily)' },
                    { id: 'yoga_pranayama', label: 'Moderate Yoga & Pranayama practice' },
                    { id: 'gym_sports', label: 'Intense physical labor / gym workouts' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('activityLevel', opt.id)}
                      className={`p-3 rounded-xl border font-semibold text-left transition-all ${
                        intakeData.activityLevel === opt.id ? 'bg-ayur-700 text-white border-ayur-700' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 7: AYURVEDIC ASSESSMENT */}
          {/* ========================================================= */}
          {currentSectionId === 7 && (
            <div className="space-y-5 text-xs">
              {/* 1. Agni */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-900 block text-xs">
                  1. Appetite & Hunger Rhythm (Jatharagni)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'tikshna', title: 'Tikshna Agni (Intense & Sharp)', desc: 'Frequent burning hunger, irritable if meal delayed' },
                    { id: 'sama', title: 'Sama Agni (Balanced & Timely)', desc: 'Hungry every 4-5 hours, smoothly digests food' },
                    { id: 'manda', title: 'Manda Agni (Slow & Heavy)', desc: 'Heavy stomach, lack of appetite for long hours' },
                    { id: 'vishama', title: 'Vishama Agni (Variable & Irregular)', desc: 'Unpredictable hunger patterns day to day' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('agniAppetite', opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        intakeData.agniAppetite === opt.id
                          ? 'bg-ayur-700 text-white border-ayur-700 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <strong className="block text-xs">{opt.title}</strong>
                      <span className={`text-[11px] ${intakeData.agniAppetite === opt.id ? 'text-teal-200' : 'text-slate-500'}`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Koshtha */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-900 block text-xs">
                  2. Bowel Habits & Evacuation (Koshtha)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'mridu', title: 'Mridu Koshtha (Soft / Loose)', desc: 'Easily triggered by warm milk or fruit' },
                    { id: 'madhyama', title: 'Madhyama Koshtha (Regular)', desc: '1-2 times daily formed stools smoothly' },
                    { id: 'krura', title: 'Krura Koshtha (Constipated / Hard)', desc: 'Hard, dry stools with strain tendency' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('koshthaBowel', opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        intakeData.koshthaBowel === opt.id
                          ? 'bg-ayur-700 text-white border-ayur-700 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <strong className="block text-xs">{opt.title}</strong>
                      <span className={`text-[11px] ${intakeData.koshthaBowel === opt.id ? 'text-teal-200' : 'text-slate-500'}`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Nidra */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="font-bold text-slate-900 block text-xs">
                  3. Sleep Quality & Night Rest (Nidra)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'disturbed_light', title: 'Light & Disturbed (Vata)', desc: 'Wakes up often, difficulty falling asleep' },
                    { id: 'moderate_pitta', title: 'Moderate (Pitta)', desc: '6-7 hrs rest, vivid dreams, feels warm' },
                    { id: 'deep_heavy', title: 'Deep & Heavy (Kapha)', desc: '> 8 hrs sleep, slight morning lethargy' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('nidraQuality', opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        intakeData.nidraQuality === opt.id
                          ? 'bg-ayur-700 text-white border-ayur-700 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <strong className="block text-xs">{opt.title}</strong>
                      <span className={`text-[11px] ${intakeData.nidraQuality === opt.id ? 'text-teal-200' : 'text-slate-500'}`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 8: PREVIOUS DOCUMENTS */}
          {/* ========================================================= */}
          {currentSectionId === 8 && (
            <div className="space-y-5 text-xs">
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-3">
                <UploadCloud className="w-10 h-10 text-ayur-700 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">Upload Prior Prescriptions or Lab Reports</h4>
                  <p className="text-xs text-slate-500">
                    Attach recent blood tests, endoscopy scans, or previous Ayurvedic slips for the doctor.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={handleSimulatedDocAdd}
                  >
                    Attach PDF / Image File
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Camera}
                    onClick={handleSimulatedDocAdd}
                  >
                    Scan Document with Camera
                  </Button>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">
                  Attached Documents ({intakeData.attachedDocuments.length})
                </h4>
                <div className="space-y-2">
                  {intakeData.attachedDocuments.map((doc) => (
                    <div key={doc.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-slate-900 block text-xs">{doc.name}</strong>
                          <span className="text-[10px] text-slate-400">{doc.type} • {doc.date} • {doc.size}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 9: REVIEW & SUBMIT */}
          {/* ========================================================= */}
          {currentSectionId === 9 && (
            <div className="space-y-6 text-xs">
              {/* Clinical Protocol Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-xs">
                    AI-assisted case-taking — preliminary intake synthesis.
                  </p>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    This structured dossier organizes your clinical symptoms for your attending Vaidya. This is an <strong>AI-assisted case-taking assistant</strong> and <em>does not diagnose</em> medical conditions. Your doctor will review and confirm all details during consultation.
                  </p>
                </div>
              </div>

              {/* Consolidated 8-Section Summary Dossier */}
              <div className="space-y-4">
                {/* 1. Demographics & Chief Complaint */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-2 font-bold text-slate-900">
                    <span>1 & 2. Demographics & Chief Complaint</span>
                    <button type="button" onClick={() => setCurrentSectionId(2)} className="text-ayur-800 text-[11px] hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-slate-400">Patient:</span> <strong>{intakeData.fullName} ({intakeData.age}y, {intakeData.gender})</strong></div>
                    <div><span className="text-slate-400">Primary Complaint:</span> <strong className="text-amber-700">Chest Discomfort / Heartburn (Amlapitta)</strong></div>
                  </div>
                </div>

                {/* 3. Present Complaint History */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-2 font-bold text-slate-900">
                    <span>3. History of Present Complaint (Adaptive)</span>
                    <button type="button" onClick={() => setCurrentSectionId(3)} className="text-ayur-800 text-[11px] hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div><span className="text-slate-400 block">Duration:</span> <strong>1 to 6 Months (Jirna)</strong></div>
                    <div><span className="text-slate-400 block">Severity:</span> <strong>Level 6 / 10 (Moderate-High)</strong></div>
                    <div><span className="text-slate-400 block">Pattern:</span> <strong>Post-Meals (30-60 mins)</strong></div>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block">Associated Symptoms:</span>
                    <strong className="text-slate-800">Sour Eructation (Amlodgara), Throat Burning (Daha), Morning Joint Stiffness</strong>
                  </div>
                </div>

                {/* 4 & 5. Medical History & Meds */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-2 font-bold text-slate-900">
                    <span>4 & 5. Medical History, Medications & Allergies</span>
                    <button type="button" onClick={() => setCurrentSectionId(5)} className="text-ayur-800 text-[11px] hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div><span className="text-slate-400">Past Illnesses:</span> <strong>Acid Peptic Disease / GERD, Migraine</strong></div>
                    <div><span className="text-slate-400">Ongoing Meds:</span> <strong>Pantoprazole 40mg (Occasional)</strong></div>
                    <div><span className="text-slate-400">Allergies:</span> <strong className="text-rose-700">Penicillin (Skin Hives), Dust/Pollen</strong></div>
                    <div><span className="text-slate-400">Family History:</span> <strong>Father: Hypertension, Mother: Joint Arthritis</strong></div>
                  </div>
                </div>

                {/* 6 & 7. Ahara-Vihara & Ayurvedic Assessment */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between border-b border-slate-200 pb-2 font-bold text-slate-900">
                    <span>6 & 7. Lifestyle & Ayurvedic Indicators</span>
                    <button type="button" onClick={() => setCurrentSectionId(7)} className="text-ayur-800 text-[11px] hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div><span className="text-slate-400 block">Diet & Spice:</span> <strong>Lacto-Vegetarian • High Spicy (Katu)</strong></div>
                    <div><span className="text-slate-400 block">Agni (Appetite):</span> <strong className="text-amber-800">Tikshna Agni (Sharp / Burning)</strong></div>
                    <div><span className="text-slate-400 block">Koshtha (Bowel):</span> <strong>Mridu Koshtha (Soft / Loose)</strong></div>
                    <div><span className="text-slate-400 block">Nidra (Sleep):</span> <strong>Disturbed / Light Rest (Vata)</strong></div>
                    <div><span className="text-slate-400 block">Physical Routine:</span> <strong>Sedentary Desk Work</strong></div>
                    <div><span className="text-slate-400 block">Attached Scans:</span> <strong>2 Medical Documents</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* GUIDED BOTTOM NAVIGATION CONTROLS */}
        <CardFooter className="border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={handlePreviousSection}
            disabled={currentSectionId === 1}
            icon={ArrowLeft}
            className="min-h-[50px] px-6"
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="md"
              onClick={() => handleSaveProgress()}
              isLoading={isSaving}
              icon={Save}
              className="hidden sm:inline-flex"
            >
              Save Progress
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleNextSection}
              icon={currentSectionId === 9 ? CheckCircle2 : ArrowRight}
              iconPosition="right"
              className="shadow-md min-h-[50px] px-8"
            >
              {currentSectionId === 9 ? 'Submit Case Intake' : 'Continue'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CaseTakingWizard;
