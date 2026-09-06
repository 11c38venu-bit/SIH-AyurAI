import React, { useState } from 'react';
import {
  Stethoscope,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Plus,
  Save,
  Check,
  Compass,
  Flame,
  Layers,
  Utensils,
  Moon,
  ShieldCheck,
  Activity,
  FileText,
  Eye,
  Info
} from 'lucide-react';
import { ASHTAVIDHA_PARIKSHA_DATA, DASHAVIDHA_PARIKSHA_DATA } from '../../data/ayurvedicAssessmentData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { DoshaMeter } from '../common/Progress';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import { Modal } from '../common/Modal';

export const AyurvedicReviewStudio = ({ patientData, onSaveAssessment }) => {
  // Section verification statuses: 'ai_suggested' | 'needs_review' | 'verified'
  const [sectionStatuses, setSectionStatuses] = useState({
    prakriti: 'needs_review',
    vikriti: 'needs_review',
    agni: 'needs_review',
    ashtavidha: 'needs_review',
    dashavidha: 'ai_suggested',
    ahara: 'needs_review',
    vihara: 'ai_suggested',
    observations: 'verified'
  });

  // Clinical parameters state
  const [assessmentData, setAssessmentData] = useState({
    prakritiPrimary: patientData?.prakriti?.primary || 'Pitta-Vata',
    vataScore: patientData?.prakriti?.vata || 35,
    pittaScore: patientData?.prakriti?.pitta || 50,
    kaphaScore: patientData?.prakriti?.kapha || 15,
    vikriti: patientData?.prakriti?.vikriti || 'Pitta Vriddhi with Vata Anubandha (Mucosal hyperacidity & joint crepitus)',
    agni: patientData?.caseIntake?.appetite || 'Tikshna Agni (Intense sharp hunger with epigastric burning)',
    koshtha: patientData?.caseIntake?.bowel || 'Mridu Koshtha (2-3 loose motions daily, sensitive to spicy Ushna Ahara)',
    nadi: patientData?.ashtavidhaAssessment?.nadi || 'Manduka Gati (Frog jump, Pitta dominant, 78 bpm, warm radial pulse)',
    jihwa: patientData?.ashtavidhaAssessment?.jihwa || 'Raktavarna with mild yellow coating at center (Samata present)',
    mutra: patientData?.ashtavidhaAssessment?.mutra || 'Peeta varna, mild burning micturition post-spicy meals',
    mala: patientData?.ashtavidhaAssessment?.mala || 'Peetabha, Mridu, Sasneha, 2-3 evacuations',
    shabda: patientData?.ashtavidhaAssessment?.shabda || 'Spashta (Clear & resonant pitch)',
    sparsha: patientData?.ashtavidhaAssessment?.sparsha || 'Ushna (Warm to touch, oily forehead and palms)',
    drik: patientData?.ashtavidhaAssessment?.drik || 'Rakta-Pitaabh (Mild conjunctival hyperemia)',
    akriti: patientData?.ashtavidhaAssessment?.akriti || 'Madhyama (Medium proportioned frame)',
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
    pathyaAhara: 'Old Basmati rice, Mudga (Moong dal soup), Cow ghee in moderate quantity, Pomegranate, Tender coconut water, Boiled cooled water.',
    apathyaAhara: 'Excessive green chilies, deep fried snacks, vinegar, sour curds, late dinners after 10:30 PM, carbonated cold drinks.',
    viharaAdvice: 'Regular sleep schedule (retire before 10:30 PM), light morning walking (Ardhashakti), Shitali/Sheetkari Pranayama for Pitta cooling.',
    otherObservations: [
      { id: 1, author: 'Vaidya Dr. K. Rajesh Sharma', time: 'Today, 09:30 AM', note: 'Pulse confirms Manduka Gati with Pitta-Vata elevation. Tongue shows central Samata coating requiring Deepana-Pachana.' }
    ]
  });

  // Modal states
  const [editSectionModal, setEditSectionModal] = useState(null); // section key
  const [addObsModal, setAddObsModal] = useState(null); // section key
  const [newObsText, setNewObsText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleVerify = (sectionKey) => {
    setSectionStatuses(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey] === 'verified' ? 'needs_review' : 'verified'
    }));
  };

  const handleVerifyAll = () => {
    setSectionStatuses({
      prakriti: 'verified',
      vikriti: 'verified',
      agni: 'verified',
      ashtavidha: 'verified',
      dashavidha: 'verified',
      ahara: 'verified',
      vihara: 'verified',
      observations: 'verified'
    });
  };

  const handleAddObservation = (sectionKey) => {
    if (!newObsText.trim()) return;
    const newEntry = {
      id: Date.now(),
      author: 'Vaidya Dr. K. Rajesh Sharma',
      time: 'Just now',
      section: sectionKey,
      note: newObsText
    };
    setAssessmentData(prev => ({
      ...prev,
      otherObservations: [...prev.otherObservations, newEntry]
    }));
    setNewObsText('');
    setAddObsModal(null);
  };

  const handleSaveAll = () => {
    setSaveSuccess(true);
    if (onSaveAssessment) {
      onSaveAssessment(assessmentData, sectionStatuses);
    }
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="success" size="sm" className="font-bold bg-emerald-100 text-emerald-900 border-emerald-300">
            <Check className="w-3 h-3 text-emerald-700" />
            <span>Practitioner Verified</span>
          </Badge>
        );
      case 'needs_review':
        return (
          <Badge variant="warning" size="sm" className="font-bold bg-amber-100 text-amber-900 border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-700" />
            <span>Needs Review</span>
          </Badge>
        );
      case 'ai_suggested':
      default:
        return (
          <Badge variant="secondary" size="sm" className="font-semibold bg-indigo-50 text-indigo-900 border-indigo-200">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>AI Suggested</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Visible Mandatory Clinical Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/95 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-xs uppercase tracking-wider text-amber-950">
              Clinical Review Principle
            </p>
            <p className="text-xs text-amber-900 font-semibold leading-relaxed">
              &ldquo;AI assists with structuring information. Final clinical interpretation remains with the qualified Ayurveda practitioner.&rdquo;
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleVerifyAll} icon={CheckCircle2}>
            Verify All Sections
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveAll} icon={Save}>
            Save Review
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Ayurvedic Clinical Assessment verified and saved to the patient permanent EHR dossier.</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PRAKRITI (CONSTITUTIONAL RATIO) */}
      {/* ========================================================= */}
      <Card className={`transition-all ${sectionStatuses.prakriti === 'verified' ? 'border-emerald-300 bg-emerald-50/10' : 'border-dashed border-indigo-300 bg-indigo-50/10'}`}>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-ayur-700" />
              <CardTitle className="text-sm">1. Baseline Constitution (Prakriti)</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(sectionStatuses.prakriti)}
              <Button size="sm" variant="outline" icon={Edit3} onClick={() => setEditSectionModal('prakriti')}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={sectionStatuses.prakriti === 'verified' ? 'secondary' : 'primary'}
                icon={Check}
                onClick={() => toggleVerify('prakriti')}
              >
                {sectionStatuses.prakriti === 'verified' ? 'Unverify' : 'Verify'}
              </Button>
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setAddObsModal('prakriti')}>
                Add Obs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Primary Type</span>
              <strong className="text-sm text-slate-900 block mt-0.5">{assessmentData.prakritiPrimary}</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Vata Dosha</span>
              <strong className="text-sm text-indigo-700 block mt-0.5">{assessmentData.vataScore}%</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Pitta Dosha</span>
              <strong className="text-sm text-rose-700 block mt-0.5">{assessmentData.pittaScore}%</strong>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block">Kapha Dosha</span>
              <strong className="text-sm text-emerald-700 block mt-0.5">{assessmentData.kaphaScore}%</strong>
            </div>
          </div>

          <DoshaMeter
            vata={assessmentData.vataScore}
            pitta={assessmentData.pittaScore}
            kapha={assessmentData.kaphaScore}
          />
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 2. VIKRITI (ACTIVE PATHOLOGICAL IMBALANCE) */}
      {/* ========================================================= */}
      <Card className={`transition-all ${sectionStatuses.vikriti === 'verified' ? 'border-emerald-300 bg-emerald-50/10' : 'border-dashed border-amber-300 bg-amber-50/10'}`}>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <CardTitle className="text-sm">2. Active Pathological Imbalance (Vikriti)</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(sectionStatuses.vikriti)}
              <Button size="sm" variant="outline" icon={Edit3} onClick={() => setEditSectionModal('vikriti')}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={sectionStatuses.vikriti === 'verified' ? 'secondary' : 'primary'}
                icon={Check}
                onClick={() => toggleVerify('vikriti')}
              >
                {sectionStatuses.vikriti === 'verified' ? 'Unverify' : 'Verify'}
              </Button>
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setAddObsModal('vikriti')}>
                Add Obs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-2 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">Current Imbalance Description</span>
            <p className="text-sm font-semibold text-slate-900 mt-1">{assessmentData.vikriti}</p>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 3. AGNI & KOSHTHA */}
      {/* ========================================================= */}
      <Card className={`transition-all ${sectionStatuses.agni === 'verified' ? 'border-emerald-300 bg-emerald-50/10' : 'border-dashed border-amber-300 bg-amber-50/10'}`}>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm">3. Metabolic Fire (Agni) & Bowel Dynamics (Koshtha)</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(sectionStatuses.agni)}
              <Button size="sm" variant="outline" icon={Edit3} onClick={() => setEditSectionModal('agni')}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={sectionStatuses.agni === 'verified' ? 'secondary' : 'primary'}
                icon={Check}
                onClick={() => toggleVerify('agni')}
              >
                {sectionStatuses.agni === 'verified' ? 'Unverify' : 'Verify'}
              </Button>
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setAddObsModal('agni')}>
                Add Obs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Jatharagni Assessment</span>
              <strong className="text-slate-900 text-xs block">{assessmentData.agni}</strong>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-800 block">Koshtha Assessment</span>
              <strong className="text-slate-900 text-xs block">{assessmentData.koshtha}</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 4. ASHTAVIDHA PARIKSHA (8-FOLD EXAMINATION) */}
      {/* ========================================================= */}
      <Card className={`transition-all ${sectionStatuses.ashtavidha === 'verified' ? 'border-emerald-300 bg-emerald-50/10' : 'border-dashed border-indigo-300 bg-indigo-50/10'}`}>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-sm">4. Ashtavidha Pariksha (Classical 8-Fold Clinical Findings)</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(sectionStatuses.ashtavidha)}
              <Button size="sm" variant="outline" icon={Edit3} onClick={() => setEditSectionModal('ashtavidha')}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={sectionStatuses.ashtavidha === 'verified' ? 'secondary' : 'primary'}
                icon={Check}
                onClick={() => toggleVerify('ashtavidha')}
              >
                {sectionStatuses.ashtavidha === 'verified' ? 'Unverify' : 'Verify'}
              </Button>
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setAddObsModal('ashtavidha')}>
                Add Obs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: '1. Nadi (Pulse)', val: assessmentData.nadi, code: 'Nadi' },
              { label: '2. Jihwa (Tongue)', val: assessmentData.jihwa, code: 'Jihwa' },
              { label: '3. Mutra (Urine)', val: assessmentData.mutra, code: 'Mutra' },
              { label: '4. Mala (Stool)', val: assessmentData.mala, code: 'Mala' },
              { label: '5. Shabda (Voice)', val: assessmentData.shabda, code: 'Shabda' },
              { label: '6. Sparsha (Touch)', val: assessmentData.sparsha, code: 'Sparsha' },
              { label: '7. Drik (Eyes)', val: assessmentData.drik, code: 'Drik' },
              { label: '8. Akriti (Build)', val: assessmentData.akriti, code: 'Akriti' },
            ].map((p, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                <span className="text-[10px] text-slate-400 font-bold block">{p.label}</span>
                <p className="text-slate-900 font-medium text-xs leading-snug">{p.val}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 5. DASHAVIDHA PARIKSHA (10-FOLD ASSESSMENT) */}
      {/* ========================================================= */}
      <Card className={`transition-all ${sectionStatuses.dashavidha === 'verified' ? 'border-emerald-300 bg-emerald-50/10' : 'border-dashed border-emerald-300 bg-emerald-50/10'}`}>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-sm">5. Dashavidha Pariksha (10-Fold Holistic Clinical Assessment)</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(sectionStatuses.dashavidha)}
              <Button size="sm" variant="outline" icon={Edit3} onClick={() => setEditSectionModal('dashavidha')}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={sectionStatuses.dashavidha === 'verified' ? 'secondary' : 'primary'}
                icon={Check}
                onClick={() => toggleVerify('dashavidha')}
              >
                {sectionStatuses.dashavidha === 'verified' ? 'Unverify' : 'Verify'}
              </Button>
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setAddObsModal('dashavidha')}>
                Add Obs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Sara (Tissues)', val: assessmentData.d_sara },
              { label: 'Samhanana (Symmetry)', val: assessmentData.d_samhanana },
              { label: 'Pramana (BMI)', val: assessmentData.d_pramana },
              { label: 'Satmya (Adaptability)', val: assessmentData.d_satmya },
              { label: 'Satva (Resilience)', val: assessmentData.d_satva },
              { label: 'Ahara Shakti (Digestion)', val: assessmentData.d_ahara_shakti },
              { label: 'Vyayama Shakti (Stamina)', val: assessmentData.d_vyayama_shakti },
              { label: 'Vaya (Life Era)', val: assessmentData.d_vaya },
            ].map((d, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">{d.label}</span>
                <strong className="text-slate-800 text-xs block mt-0.5">{d.val}</strong>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 6. AHARA & 7. VIHARA */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ahara Card */}
        <Card className={`transition-all ${sectionStatuses.ahara === 'verified' ? 'border-emerald-300 bg-emerald-50/10' : 'border-dashed border-amber-300 bg-amber-50/10'}`}>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-700" />
                <CardTitle className="text-sm">6. Ahara (Dietary Regimen)</CardTitle>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusBadge(sectionStatuses.ahara)}
                <Button size="sm" variant="outline" icon={Edit3} onClick={() => setEditSectionModal('ahara')}>
                  Edit
                </Button>
                <Button size="sm" variant={sectionStatuses.ahara === 'verified' ? 'secondary' : 'primary'} icon={Check} onClick={() => toggleVerify('ahara')}>
                  {sectionStatuses.ahara === 'verified' ? 'Unverify' : 'Verify'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-emerald-900 uppercase block">Pathya Ahara (Beneficial)</span>
              <p className="text-slate-800 leading-relaxed text-xs">{assessmentData.pathyaAhara}</p>
            </div>
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-rose-900 uppercase block">Apathya Ahara (Contraindicated)</span>
              <p className="text-slate-800 leading-relaxed text-xs">{assessmentData.apathyaAhara}</p>
            </div>
          </CardContent>
        </Card>

        {/* Vihara Card */}
        <Card className={`transition-all ${sectionStatuses.vihara === 'verified' ? 'border-emerald-300 bg-emerald-50/10' : 'border-dashed border-indigo-300 bg-indigo-50/10'}`}>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-700" />
                <CardTitle className="text-sm">7. Vihara (Lifestyle & Routine)</CardTitle>
              </div>
              <div className="flex items-center gap-1.5">
                {getStatusBadge(sectionStatuses.vihara)}
                <Button size="sm" variant="outline" icon={Edit3} onClick={() => setEditSectionModal('vihara')}>
                  Edit
                </Button>
                <Button size="sm" variant={sectionStatuses.vihara === 'verified' ? 'secondary' : 'primary'} icon={Check} onClick={() => toggleVerify('vihara')}>
                  {sectionStatuses.vihara === 'verified' ? 'Unverify' : 'Verify'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-indigo-900 uppercase block">Dinacharya & Behavioral Protocol</span>
              <p className="text-slate-800 leading-relaxed text-xs">{assessmentData.viharaAdvice}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* 8. OTHER CLINICAL OBSERVATIONS */}
      {/* ========================================================= */}
      <Card className="border-2 border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              <CardTitle className="text-sm">8. Other Practitioner Clinical Observations</CardTitle>
            </div>
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setAddObsModal('general')}>
              Add Observation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3 text-xs">
          {assessmentData.otherObservations.map((obs) => (
            <div key={obs.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <strong className="text-slate-900">{obs.author}</strong>
                <span className="text-slate-400 font-mono">{obs.time}</span>
              </div>
              <p className="text-slate-800 text-xs leading-relaxed">{obs.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* EDIT MODAL */}
      {/* ========================================================= */}
      {editSectionModal && (
        <Modal
          isOpen={Boolean(editSectionModal)}
          onClose={() => setEditSectionModal(null)}
          title={`Edit Section: ${editSectionModal.toUpperCase()}`}
          subtitle="Directly modify Ayurvedic parameters based on active examination"
          size="lg"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditSectionModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setEditSectionModal(null)}>
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            {editSectionModal === 'prakriti' && (
              <div className="space-y-3">
                <Input
                  label="Primary Prakriti Type"
                  value={assessmentData.prakritiPrimary}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, prakritiPrimary: e.target.value }))}
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Vata %"
                    type="number"
                    value={assessmentData.vataScore}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, vataScore: Number(e.target.value) }))}
                  />
                  <Input
                    label="Pitta %"
                    type="number"
                    value={assessmentData.pittaScore}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, pittaScore: Number(e.target.value) }))}
                  />
                  <Input
                    label="Kapha %"
                    type="number"
                    value={assessmentData.kaphaScore}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, kaphaScore: Number(e.target.value) }))}
                  />
                </div>
              </div>
            )}

            {editSectionModal === 'vikriti' && (
              <Textarea
                label="Vikriti (Active Imbalance & Pathological Aggravation)"
                rows={3}
                value={assessmentData.vikriti}
                onChange={(e) => setAssessmentData(prev => ({ ...prev, vikriti: e.target.value }))}
              />
            )}

            {editSectionModal === 'agni' && (
              <div className="space-y-3">
                <Input
                  label="Jatharagni Status"
                  value={assessmentData.agni}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, agni: e.target.value }))}
                />
                <Input
                  label="Koshtha Profile"
                  value={assessmentData.koshtha}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, koshtha: e.target.value }))}
                />
              </div>
            )}

            {editSectionModal === 'ashtavidha' && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="1. Nadi" value={assessmentData.nadi} onChange={(e) => setAssessmentData(prev => ({ ...prev, nadi: e.target.value }))} />
                <Input label="2. Jihwa" value={assessmentData.jihwa} onChange={(e) => setAssessmentData(prev => ({ ...prev, jihwa: e.target.value }))} />
                <Input label="3. Mutra" value={assessmentData.mutra} onChange={(e) => setAssessmentData(prev => ({ ...prev, mutra: e.target.value }))} />
                <Input label="4. Mala" value={assessmentData.mala} onChange={(e) => setAssessmentData(prev => ({ ...prev, mala: e.target.value }))} />
                <Input label="5. Shabda" value={assessmentData.shabda} onChange={(e) => setAssessmentData(prev => ({ ...prev, shabda: e.target.value }))} />
                <Input label="6. Sparsha" value={assessmentData.sparsha} onChange={(e) => setAssessmentData(prev => ({ ...prev, sparsha: e.target.value }))} />
                <Input label="7. Drik" value={assessmentData.drik} onChange={(e) => setAssessmentData(prev => ({ ...prev, drik: e.target.value }))} />
                <Input label="8. Akriti" value={assessmentData.akriti} onChange={(e) => setAssessmentData(prev => ({ ...prev, akriti: e.target.value }))} />
              </div>
            )}

            {editSectionModal === 'dashavidha' && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Sara" value={assessmentData.d_sara} onChange={(e) => setAssessmentData(prev => ({ ...prev, d_sara: e.target.value }))} />
                <Input label="Samhanana" value={assessmentData.d_samhanana} onChange={(e) => setAssessmentData(prev => ({ ...prev, d_samhanana: e.target.value }))} />
                <Input label="Pramana" value={assessmentData.d_pramana} onChange={(e) => setAssessmentData(prev => ({ ...prev, d_pramana: e.target.value }))} />
                <Input label="Satmya" value={assessmentData.d_satmya} onChange={(e) => setAssessmentData(prev => ({ ...prev, d_satmya: e.target.value }))} />
                <Input label="Satva" value={assessmentData.d_satva} onChange={(e) => setAssessmentData(prev => ({ ...prev, d_satva: e.target.value }))} />
                <Input label="Ahara Shakti" value={assessmentData.d_ahara_shakti} onChange={(e) => setAssessmentData(prev => ({ ...prev, d_ahara_shakti: e.target.value }))} />
                <Input label="Vyayama Shakti" value={assessmentData.d_vyayama_shakti} onChange={(e) => setAssessmentData(prev => ({ ...prev, d_vyayama_shakti: e.target.value }))} />
                <Input label="Vaya" value={assessmentData.d_vaya} onChange={(e) => setAssessmentData(prev => ({ ...prev, d_vaya: e.target.value }))} />
              </div>
            )}

            {editSectionModal === 'ahara' && (
              <div className="space-y-3">
                <Textarea
                  label="Pathya Ahara (Beneficial Foods & Drinks)"
                  rows={2}
                  value={assessmentData.pathyaAhara}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, pathyaAhara: e.target.value }))}
                />
                <Textarea
                  label="Apathya Ahara (Contraindicated Foods)"
                  rows={2}
                  value={assessmentData.apathyaAhara}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, apathyaAhara: e.target.value }))}
                />
              </div>
            )}

            {editSectionModal === 'vihara' && (
              <Textarea
                label="Vihara Advice (Dinacharya & Sleep Routine)"
                rows={3}
                value={assessmentData.viharaAdvice}
                onChange={(e) => setAssessmentData(prev => ({ ...prev, viharaAdvice: e.target.value }))}
              />
            )}
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* ADD OBSERVATION MODAL */}
      {/* ========================================================= */}
      {addObsModal && (
        <Modal
          isOpen={Boolean(addObsModal)}
          onClose={() => setAddObsModal(null)}
          title="Add Practitioner Clinical Observation"
          subtitle={`Append a verified observation for ${addObsModal.toUpperCase()}`}
          size="md"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setAddObsModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleAddObservation(addObsModal)}>
                Append Observation
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Textarea
              label="Practitioner Observation"
              rows={4}
              placeholder="e.g. Radial pulse shows prominent frog jump (Manduka Gati) on deep palpation, indicating aggravated Pitta with mucosal irritation..."
              value={newObsText}
              onChange={(e) => setNewObsText(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AyurvedicReviewStudio;
