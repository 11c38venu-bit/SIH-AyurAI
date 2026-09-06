import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  Info,
  Flame,
  ShieldCheck,
  Compass,
  Layers,
  ChevronDown,
  Utensils,
  Moon,
  Heart,
  Droplets,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import {
  ASHTAVIDHA_PARIKSHA_DATA,
  DASHAVIDHA_PARIKSHA_DATA,
  AGNI_ASSESSMENT_DATA,
  KOSHTHA_ASSESSMENT_DATA,
  AHARA_VIHARA_DATA
} from '../../data/ayurvedicAssessmentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { DoshaMeter } from '../../components/common/Progress';
import { Tabs } from '../../components/common/Tabs';
import LanguageSelector from '../../components/common/LanguageSelector';
import PatientJourneyTracker from '../../components/patient/PatientJourneyTracker';

export const PrakritiAssessment = () => {
  const { language, t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('prakriti_vikriti');

  // Prakriti questions state
  const [prakritiAnswers, setPrakritiAnswers] = useState({
    frame: 'pitta',
    skin: 'pitta',
    weather: 'pitta',
    eating: 'vata',
    energy: 'vata',
    sleep: 'vata',
    temperament: 'pitta',
  });

  // Vikriti state
  const [vikritiState, setVikritiState] = useState({
    primaryImbalance: 'Pitta Vriddhi with Vata Anubandha',
    activeAggravation: 'pitta',
    symptoms: 'Retrosternal burning sensation, sour eructations, disturbed sleep patterns',
    triggerFactors: 'Spicy / sour foods, irregular meal schedules, late working hours'
  });

  // Agni and Koshtha state
  const [agniSelection, setAgniSelection] = useState('tikshna');
  const [koshthaSelection, setKoshthaSelection] = useState('mridu');

  // Ashtavidha state
  const [ashtavidhaAnswers, setAshtavidhaAnswers] = useState({
    nadi: 'Pittaja — Manduka Gati (Jumping, forceful, frog-like, 70-80 bpm)',
    mutra: 'Pitta dominant — Deep yellow (Peetabha) with mild burning sensation',
    mala: 'Loose & Burning — Frequent, loose, yellowish (Pitta)',
    jihva: 'Yellowish Coating (Pitta/Sama) — Central yellow fur, redness on edges',
    shabda: 'Clear & Resonant (Spashta) — Normal pitch and stamina',
    sparsha: 'Warm to Touch (Ushna — Pitta) — Mild burning, oily forehead',
    drik: 'Reddish/Yellowish (Rakta/Peeta — Pitta) — Burning, photophobia, red vessels',
    akriti: 'Madhyama (Medium proportion, balanced strength)',
  });

  // Dashavidha state
  const [dashavidhaAnswers, setDashavidhaAnswers] = useState({
    d1_prakriti: 'Pitta-Vata (Estimated)',
    d2_vikriti: 'Pitta Vriddhi with Vata Anubandha',
    d3_sara: 'Rasa-Rakta Madhyama',
    d4_samhanana: 'Madhyama Samhanana',
    d5_pramana: 'Normal BMI (23.1)',
    d6_satmya: 'Ghritha-Dugdha Satmya',
    d7_satva: 'Madhyama Satva',
    d8_ahara_shakti: 'Tikshna Ahara Shakti',
    d9_vyayama_shakti: 'Madhyama Vyayama',
    d10_vaya: 'Madhyama Vaya (Pitta Era)',
  });

  // Ahara & Vihara state
  const [selectedTastes, setSelectedTastes] = useState(['katu', 'amla']);
  const [mealTiming, setMealTiming] = useState('irregular');
  const [waterHabit, setWaterHabit] = useState('cold');
  const [sleepPattern, setSleepPattern] = useState('alpa');
  const [exerciseHabit, setExerciseHabit] = useState('sedentary');
  const [mentalState, setMentalState] = useState('rajas');

  const [isSaving, setIsSaving] = useState(false);

  // Calculate Doshas
  const totalAnswers = Object.keys(prakritiAnswers).length;
  const vataCount = Object.values(prakritiAnswers).filter(v => v === 'vata').length;
  const pittaCount = Object.values(prakritiAnswers).filter(v => v === 'pitta').length;
  const kaphaCount = Object.values(prakritiAnswers).filter(v => v === 'kapha').length;

  const vataPct = Math.round((vataCount / totalAnswers) * 100);
  const pittaPct = Math.round((pittaCount / totalAnswers) * 100);
  const kaphaPct = Math.max(0, 100 - vataPct - pittaPct);

  const estimatedPrakritiType = pittaPct >= vataPct
    ? (pittaPct >= kaphaPct ? 'Pitta-Vata' : 'Kapha-Pitta')
    : (vataPct >= kaphaPct ? 'Vata-Pitta' : 'Kapha-Vata');

  const chartData = [
    { dosha: 'Vata', score: vataPct, color: '#6366F1' },
    { dosha: 'Pitta', score: pittaPct, color: '#E11D48' },
    { dosha: 'Kapha', score: kaphaPct, color: '#16A34A' },
  ];

  const handlePrakritiSelect = (trait, dosha) => {
    setPrakritiAnswers(prev => ({ ...prev, [trait]: dosha }));
  };

  const toggleTaste = (tasteId) => {
    setSelectedTastes(prev =>
      prev.includes(tasteId) ? prev.filter(t => t !== tasteId) : [...prev, tasteId]
    );
  };

  const handleSaveAndProceed = async () => {
    setIsSaving(true);
    await apiService.updatePatientCase(user?.id || 'pat-101', {
      prakriti: {
        primary: estimatedPrakritiType,
        vata: vataPct,
        pitta: pittaPct,
        kapha: kaphaPct,
        vikriti: vikritiState.primaryImbalance,
      },
      agniStatus: agniSelection,
      koshthaStatus: koshthaSelection,
      ashtavidhaAssessment: ashtavidhaAnswers,
      dashavidhaAssessment: dashavidhaAnswers,
      aharaVihara: {
        preferredTastes: selectedTastes,
        mealTiming,
        waterHabit,
        sleepPattern,
        exerciseHabit,
        mentalState
      }
    });
    setIsSaving(false);
    navigate('/patient/medical-history');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('assessment.title')}</span>
            <Badge variant="vata" size="sm">Ayurvedic Clinical Intake</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            Structured exploration of baseline constitution (Prakriti), current imbalance (Vikriti), Agni, Ashtavidha, Dashavidha, and Ahara-Vihara
          </p>
        </div>

        <LanguageSelector variant="dropdown" />
      </div>

      {/* Mandatory Clinical Safety Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-xs uppercase tracking-wider text-amber-950">
            AI-assisted Ayurvedic assessment — practitioner verification required.
          </p>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            All observations and scores shown are preliminary clinical intakes designed to assist your attending Ayurvedic practitioner (Vaidya). They do not constitute an automated diagnosis or final treatment prescription. Your doctor will review, adjust, and confirm all findings during consultation.
          </p>
        </div>
      </div>

      <PatientJourneyTracker currentStepId={4} variant="compact" />

      {/* 5-Tab Navigation */}
      <Tabs
        variant="pills"
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
        tabs={[
          { id: 'prakriti_vikriti', label: '1. Prakriti & Vikriti' },
          { id: 'agni_koshtha', label: '2. Agni & Koshtha' },
          { id: 'ashtavidha', label: '3. Ashtavidha (8-Fold)' },
          { id: 'dashavidha', label: '4. Dashavidha (10-Fold)' },
          { id: 'ahara_vihara', label: '5. Ahara & Vihara' },
        ]}
      />

      {/* ========================================================================= */}
      {/* TAB 1: PRAKRITI & VIKRITI (CONSTITUTION & ACTIVE IMBALANCE) */}
      {/* ========================================================================= */}
      {activeTab === 'prakriti_vikriti' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    <Compass className="w-4 h-4 text-ayur-700" />
                    <span>Constitutional Trait Intake (Prakriti)</span>
                  </CardTitle>
                  <span className="text-[11px] text-slate-500 font-medium">7 Key Parameters</span>
                </div>
                <CardDescription>
                  Select your lifelong natural physical and physiological traits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                {[
                  {
                    id: 'frame',
                    name: '1. Body Frame & Bone Structure',
                    vata: 'Lean, light frame, prominent joints',
                    pitta: 'Medium, proportionate, warm muscle tone',
                    kapha: 'Broad, sturdy, heavy bone structure',
                  },
                  {
                    id: 'skin',
                    name: '2. Skin Texture & Complexion',
                    vata: 'Dry, cool, rough texture, easily chapped',
                    pitta: 'Warm, oily T-zone, prone to redness/moles',
                    kapha: 'Cool, thick, soft, moist, glowing',
                  },
                  {
                    id: 'weather',
                    name: '3. Weather & Climate Preference',
                    vata: 'Dislikes cold & dry wind; loves warmth',
                    pitta: 'Dislikes hot sun & humidity; craves cool breeze',
                    kapha: 'Dislikes cold, damp days; prefers dry heat',
                  },
                  {
                    id: 'eating',
                    name: '4. Appetite & Eating Pace',
                    vata: 'Irregular appetite, eats quickly or skips meals',
                    pitta: 'Intense hunger, eats punctually, irritable if delayed',
                    kapha: 'Steady appetite, eats slowly and mindfully',
                  },
                  {
                    id: 'sleep',
                    name: '5. Sleep Quality (Nidra)',
                    vata: 'Light, interrupted, tends towards insomnia',
                    pitta: 'Moderate, wakes refreshed, active dreams',
                    kapha: 'Deep, heavy, hard to wake up early',
                  },
                  {
                    id: 'energy',
                    name: '6. Energy Endurance & Activity',
                    vata: 'Bursts of high energy followed by quick fatigue',
                    pitta: 'Strong goal-oriented stamina, driven pace',
                    kapha: 'Steady endurance, slow to start but persists',
                  },
                  {
                    id: 'temperament',
                    name: '7. Mental Temperament & Stress Response',
                    vata: 'Quick learner, creative, prone to anxiety/worry',
                    pitta: 'Sharp intellect, decisive, prone to irritation/anger',
                    kapha: 'Calm, patient, supportive, slow to anger',
                  },
                ].map((q) => (
                  <div key={q.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 block text-xs">{q.name}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {['vata', 'pitta', 'kapha'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => handlePrakritiSelect(q.id, d)}
                          className={`p-2.5 rounded-xl border text-left text-[11px] transition-all ${
                            prakritiAnswers[q.id] === d
                              ? 'bg-white border-ayur-600 text-ayur-950 font-bold shadow-xs ring-2 ring-ayur-100'
                              : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          <span className="font-bold uppercase text-[10px] block mb-0.5 text-slate-400">{d}</span>
                          <span className="leading-tight">{q[d]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Vikriti (Active Imbalance) Card */}
            <Card className="border-2 border-rose-200/80 bg-gradient-to-br from-white to-rose-50/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <span>Active Pathological Imbalance (Vikriti)</span>
                  </CardTitle>
                  <Badge variant="pitta" size="sm">Active Doshic Elevation</Badge>
                </div>
                <CardDescription>
                  Current symptomatic state compared to your baseline constitution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-rose-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Observed Doshic Elevation</span>
                  <strong className="text-rose-950 text-sm block">{vikritiState.primaryImbalance}</strong>
                  <p className="text-slate-600 text-[11px] pt-1">
                    Predominant presentation: Retrosternal burning, acid eructation, and mild joint dryness.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Identified Triggers</span>
                    <p className="text-slate-800 font-medium text-[11px] mt-0.5">
                      Excessive spicy/fried foods, irregular meal intervals, occupational mental stress.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Clinical Objective</span>
                    <p className="text-slate-800 font-medium text-[11px] mt-0.5">
                      Pitta Shamana (pacification of heat) with Vata Anulomana (restoring healthy downward movement).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Radar & Summary */}
          <div className="space-y-4">
            <Card className="border-t-4 border-t-ayur-600 text-center sticky top-24">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase text-slate-400 font-bold">
                  Tri-Dosha Ratio Estimation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Estimated Baseline Prakriti</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{estimatedPrakritiType} Dvandvaja</h3>
                  <span className="text-[10px] text-slate-500 italic block mt-0.5">
                    (Requires clinical confirmation by Vaidya)
                  </span>
                </div>

                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="dosha" tick={{ fontSize: 11, fontWeight: 600 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val) => [`${val}%`, 'Dosha Ratio']} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {chartData.map((e, idx) => (
                          <Cell key={idx} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <DoshaMeter vata={vataPct} pitta={pittaPct} kapha={kaphaPct} />

                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-left text-[11px] text-teal-900">
                  <span className="font-bold block mb-0.5">Assessment Note:</span>
                  Constitution estimation reflects intake answers and will be verified via pulse examination (Nadi Pariksha) by the attending doctor.
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => setActiveTab('agni_koshtha')}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Next: Agni & Koshtha
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AGNI & KOSHTHA (DIGESTIVE FIRE & BOWEL DYNAMICS) */}
      {/* ========================================================================= */}
      {activeTab === 'agni_koshtha' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>Agni Pariksha (Metabolic & Digestive Fire Assessment)</span>
                  </CardTitle>
                  <CardDescription>
                    Evaluation of Jatharagni strength, hunger regularity, and metabolic assimilation
                  </CardDescription>
                </div>
                <Badge variant="pitta">Metabolic Focus</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AGNI_ASSESSMENT_DATA.map((agni) => (
                  <div
                    key={agni.id}
                    onClick={() => setAgniSelection(agni.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      agniSelection === agni.id
                        ? 'bg-white border-ayur-600 shadow-md ring-2 ring-ayur-100'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <strong className="text-slate-900 text-sm">{agni.name}</strong>
                      <Badge variant={agni.badgeVariant} size="sm">{agni.badge}</Badge>
                    </div>
                    <span className="text-[10px] text-teal-800 font-semibold block mb-1">
                      Association: {agni.dosha}
                    </span>
                    <p className="text-slate-600 text-xs leading-relaxed">{agni.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-indigo-600" />
                    <span>Koshtha Pariksha (Gastrointestinal & Bowel Motility)</span>
                  </CardTitle>
                  <CardDescription>
                    Assessment of bowel evacuation ease, stool consistency, and intestinal sensitivity
                  </CardDescription>
                </div>
                <Badge variant="vata">Bowel Dynamics</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {KOSHTHA_ASSESSMENT_DATA.map((kosh) => (
                  <div
                    key={kosh.id}
                    onClick={() => setKoshthaSelection(kosh.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      koshthaSelection === kosh.id
                        ? 'bg-white border-ayur-600 shadow-md ring-2 ring-ayur-100'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <strong className="text-slate-900 text-sm block mb-1">{kosh.name}</strong>
                    <span className="text-[10px] text-slate-500 font-medium block mb-2">{kosh.dosha}</span>
                    <p className="text-slate-600 text-xs leading-relaxed">{kosh.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="md" onClick={() => setActiveTab('prakriti_vikriti')}>
                Back to Prakriti
              </Button>
              <Button variant="primary" size="md" onClick={() => setActiveTab('ashtavidha')} icon={ArrowRight} iconPosition="right">
                Next: Ashtavidha Pariksha
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ASHTAVIDHA PARIKSHA (8-FOLD CLINICAL EXAMINATION) */}
      {/* ========================================================================= */}
      {activeTab === 'ashtavidha' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-indigo-600" />
                  <span>Ashtavidha Pariksha (Classical 8-Fold Examination)</span>
                </CardTitle>
                <CardDescription>
                  Structured clinical observations across the 8 classical Ayurvedic diagnostic pathways
                </CardDescription>
              </div>
              <Badge variant="vata">8 Classical Parameters</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {ASHTAVIDHA_PARIKSHA_DATA.map((item) => {
                const localized = item.translations[language] || item.translations.en;
                return (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{localized.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">[{item.code}]</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-snug">{localized.desc}</p>
                    <select
                      value={ashtavidhaAnswers[item.id] || item.options[0].value}
                      onChange={(e) => setAshtavidhaAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-ayur-100 outline-none font-medium"
                    >
                      {item.options.map((opt) => (
                        <option key={opt.id} value={opt.value}>{opt.value}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="md" onClick={() => setActiveTab('agni_koshtha')}>
              Back to Agni & Koshtha
            </Button>
            <Button variant="primary" size="md" onClick={() => setActiveTab('dashavidha')} icon={ArrowRight} iconPosition="right">
              Next: Dashavidha Pariksha
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DASHAVIDHA PARIKSHA (10-FOLD HOLISTIC CLINICAL ASSESSMENT) */}
      {/* ========================================================================= */}
      {activeTab === 'dashavidha' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Dashavidha Pariksha (10-Fold Holistic Clinical Examination)</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive assessment of tissue quality, endurance, habituation, mental resilience, and life stage
                </CardDescription>
              </div>
              <Badge variant="success">10 Holistic Dimensions</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DASHAVIDHA_PARIKSHA_DATA.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-sm block">{item.title}</span>
                    <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                    <p className="text-[11px] text-teal-800 italic">Patient Guide: {item.patientExpl}</p>
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Observed Finding</span>
                    <select
                      value={dashavidhaAnswers[item.id] || item.status}
                      onChange={(e) => setDashavidhaAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-ayur-100 outline-none font-medium"
                    >
                      {item.options ? (
                        item.options.map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))
                      ) : (
                        <option value={item.status}>{item.status}</option>
                      )}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="md" onClick={() => setActiveTab('ashtavidha')}>
              Back to Ashtavidha
            </Button>
            <Button variant="primary" size="md" onClick={() => setActiveTab('ahara_vihara')} icon={ArrowRight} iconPosition="right">
              Next: Ahara & Vihara
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AHARA & VIHARA (DIETARY & LIFESTYLE HABITS) */}
      {/* ========================================================================= */}
      {activeTab === 'ahara_vihara' && (
        <div className="space-y-6">
          {/* Ahara Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-700" />
                    <span>Ahara (Dietary Habits & Taste Preferences — Shad Rasa)</span>
                  </CardTitle>
                  <CardDescription>
                    Explore dominant dietary tastes, eating schedules, and hydration patterns
                  </CardDescription>
                </div>
                <Badge variant="amber">Nutritional Regimen</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-2 text-xs">
                  Dominant Tastes in Regular Diet (Select all that apply):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AHARA_VIHARA_DATA.ahara.tastes.map((taste) => (
                    <button
                      key={taste.id}
                      type="button"
                      onClick={() => toggleTaste(taste.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedTastes.includes(taste.id)
                          ? 'bg-amber-50/80 border-amber-500 text-amber-950 font-bold shadow-xs ring-1 ring-amber-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900">{taste.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 leading-snug">{taste.effect}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">Meal Timing Regularity (Ahara Kala)</span>
                  <select
                    value={mealTiming}
                    onChange={(e) => setMealTiming(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-ayur-100 outline-none"
                  >
                    {AHARA_VIHARA_DATA.ahara.mealHabits.map((h) => (
                      <option key={h.id} value={h.id}>{h.label} ({h.value})</option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">Hydration & Water Temperature</span>
                  <select
                    value={waterHabit}
                    onChange={(e) => setWaterHabit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-ayur-100 outline-none"
                  >
                    {AHARA_VIHARA_DATA.ahara.waterIntake.map((w) => (
                      <option key={w.id} value={w.id}>{w.label} — {w.desc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vihara Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>Vihara (Daily Lifestyle & Behavioral Routine — Dinacharya)</span>
                  </CardTitle>
                  <CardDescription>
                    Evaluation of sleep quality (Nidra), exercise stamina (Vyayama), and mental resilience (Satva)
                  </CardDescription>
                </div>
                <Badge variant="indigo">Lifestyle Routine</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">Sleep Quality (Nidra)</span>
                  <select
                    value={sleepPattern}
                    onChange={(e) => setSleepPattern(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-ayur-100 outline-none"
                  >
                    {AHARA_VIHARA_DATA.vihara.nidra.map((n) => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">Daily Physical Activity</span>
                  <select
                    value={exerciseHabit}
                    onChange={(e) => setExerciseHabit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-ayur-100 outline-none"
                  >
                    {AHARA_VIHARA_DATA.vihara.vyayama.map((v) => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">Mental Stress & Temperament</span>
                  <select
                    value={mentalState}
                    onChange={(e) => setMentalState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-ayur-100 outline-none"
                  >
                    {AHARA_VIHARA_DATA.vihara.manasika.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="md" onClick={() => setActiveTab('dashavidha')}>
                Back to Dashavidha
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSaveAndProceed}
                isLoading={isSaving}
                icon={ArrowRight}
                iconPosition="right"
              >
                Save Assessment & Proceed to Medical History
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PrakritiAssessment;
