import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  Printer,
  Save,
  Plus,
  Trash2,
  FileCheck,
  Building,
  Stethoscope,
  Sparkles,
  Download,
  Calendar,
  Utensils,
  Ban,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  QrCode,
  Edit3,
  Heart,
  CheckSquare,
  UserCheck
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const PrescriptionBuilder = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [formulationsCatalog, setFormulationsCatalog] = useState([]);

  // ==========================================
  // PRACTITIONER PRESCRIPTION STATE
  // ==========================================

  // Doctor Details
  const doctorDetails = {
    name: 'Vaidya Dr. K. Rajesh Sharma',
    qualifications: 'BAMS, MD (Kayachikitsa - BHU)',
    designation: 'Senior Consultant & Head of Clinical Services',
    department: 'Department of Kayachikitsa (Internal Medicine)',
    hospitalName: 'AYURAI NATIONAL AYURVEDIC RESEARCH HOSPITAL',
    hospitalSubtext: 'NABH Accredited Tertiary Center for Classical Ayurvedic Medicine & Integrative Health',
    registrationNumber: 'AYUSH-KAR-2010-4491',
    roomNo: 'OPD Suite 102'
  };

  // Assessment / Diagnosis
  const [assessmentDiagnosis, setAssessmentDiagnosis] = useState({
    classicalDiagnosis: 'Urdhwaga Amlapitta with Pitta-Vata Dushti',
    icdNamasteCode: 'NAMASTE: AG-042 (Urdhwaga Amlapitta / Hyperacidity Syndrome)',
    sampraptiNotes: 'Mithya Ahara (Irregular spicy & sour foods) -> Agnimandya -> Pitta Vriddhi in Amashaya -> Vidagdha Ajeerna.'
  });

  // Medicines, Dosage, Instructions
  const [medicines, setMedicines] = useState([
    {
      id: 'm1',
      drugName: 'Avipattikar Churna',
      form: 'Churna (Herbal Powder)',
      dosage: '3 to 5 grams',
      frequency: 'Twice daily (BD)',
      timing: 'Abhakta (30 mins before food)',
      anupana: 'Lukewarm water or Honey',
      duration: '15 Days',
      route: 'Oral',
      instructions: 'Take 30 mins before breakfast and dinner with lukewarm water.'
    },
    {
      id: 'm2',
      drugName: 'Praval Pishti',
      form: 'Pishti / Bhasma',
      dosage: '250 mg',
      frequency: 'Twice daily (BD)',
      timing: 'Pragbhakta (With first morsel of meal)',
      anupana: 'Gulkand / Tender coconut water',
      duration: '15 Days',
      route: 'Oral',
      instructions: 'Pacifies acute retrosternal burning and neutralizing acidic reflux.'
    },
    {
      id: 'm3',
      drugName: 'Maharasnadi Kashayam',
      form: 'Kashayam (Decoction)',
      dosage: '15 ml + 45 ml lukewarm water',
      frequency: 'Once daily (OD)',
      timing: 'Early morning empty stomach (7:00 AM)',
      anupana: 'Lukewarm water',
      duration: '15 Days',
      route: 'Oral',
      instructions: 'For early morning joint stiffness and Vata pacification.'
    }
  ]);

  // Pathya & Apathya Clinical Diet Rules
  const [pathyaRules, setPathyaRules] = useState(
    'Old Basmati rice, Mung dal soup (Mudga Yusha), Cow Ghee in moderation, Pomegranate, Tender coconut water, boiled and cooled water (Ushnodaka).'
  );

  const [apathyaRules, setApathyaRules] = useState(
    'Green chilies, sour curds, vinegar, deep fried snacks, carbonated chilled beverages, midnight waking, skipping regular breakfasts.'
  );

  // Follow-up Date
  const [followUpDate, setFollowUpDate] = useState('2026-09-17');
  const [followUpNotes, setFollowUpNotes] = useState('Repeat Nadi Pariksha and evaluate symptom relief in 2 weeks.');

  // Modal State for custom medicine
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customMed, setCustomMed] = useState({
    drugName: '',
    form: 'Churna',
    dosage: '3 grams',
    frequency: 'Twice daily (BD)',
    timing: 'Abhakta (Before food)',
    anupana: 'Warm water',
    duration: '15 Days',
    instructions: 'Take as directed by Vaidya'
  });

  useEffect(() => {
    const load = async () => {
      const pat = await apiService.getPatientById(id || 'pat-101');
      const catalog = await apiService.getFormulations();
      setPatient(pat);
      setFormulationsCatalog(catalog);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleAddMedicineFromCatalog = (formulationId) => {
    const item = formulationsCatalog.find(f => f.id === formulationId);
    if (item) {
      const newMed = {
        id: `m-${Date.now()}`,
        drugName: item.name,
        form: item.type,
        dosage: item.standardDosage.split(' ')[0] || '1-2 tablets',
        frequency: 'Twice daily (BD)',
        timing: item.timing,
        anupana: item.anupana,
        duration: '15 Days',
        route: 'Oral',
        instructions: item.indications
      };
      setMedicines(prev => [...prev, newMed]);
    }
  };

  const handleAddCustomMedicine = () => {
    if (!customMed.drugName.trim()) return;
    setMedicines(prev => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        ...customMed
      }
    ]);
    setShowAddCustomModal(false);
    setCustomMed({
      drugName: '',
      form: 'Churna',
      dosage: '3 grams',
      frequency: 'Twice daily (BD)',
      timing: 'Abhakta (Before food)',
      anupana: 'Warm water',
      duration: '15 Days',
      instructions: 'Take as directed by Vaidya'
    });
  };

  const handleRemoveMedicine = (medId) => {
    setMedicines(prev => prev.filter(m => m.id !== medId));
  };

  const handleSaveRx = async () => {
    await apiService.savePrescription(patient.id, {
      diagnosis: assessmentDiagnosis.classicalDiagnosis,
      medicines,
      pathyaRules,
      apathyaRules,
      followUpDate,
      issuedBy: doctorDetails.name,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (loading || !patient) {
    return <div className="p-8 text-center text-slate-400">Loading prescription builder...</div>;
  }

  const patientLanguageLabel = SUPPORTED_LANGUAGES.find(l => l.code === (patient.preferredLanguage || 'ta'))?.name || 'Tamil';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <NavLink to={`/doctor/consultation/${patient.id}`}>
            <Button variant="secondary" size="sm" icon={ArrowLeft}>
              Consultation Room
            </Button>
          </NavLink>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Official Ayurvedic Prescription Dossier</span>
              <Badge variant="primary" size="sm">NABH / AYUSH Verified</Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Formulated and authenticated by attending Ayurveda Practitioner (Vaidya)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
            Print Prescription
          </Button>
          <Button variant="primary" size="sm" icon={Save} onClick={handleSaveRx}>
            Save to Clinical Registry
          </Button>
        </div>
      </div>

      {/* MANDATORY CLINICAL GOVERNANCE NOTICE BANNER */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-xs uppercase tracking-wide text-amber-950">
              Final prescription and treatment are determined by the qualified Ayurveda practitioner.
            </p>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Prescription orders are non-autonomous. AI does not prescribe medication. Every formulation, dosage schedule, and dietary directive below is verified and signed off by the qualified Vaidya.
            </p>
          </div>
        </div>
        <Badge variant="amber" size="sm" className="shrink-0 font-bold">
          Doctor Controlled
        </Badge>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Official prescription authenticated and dispatched to Herbal Pharmacy Counter 4!</span>
        </div>
      )}

      {/* Quick Formulation Catalog Adder Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 text-xs block">Formulation Catalog & Custom Adder</span>
            <span className="text-slate-500 text-[11px]">Click classical medicines to add to Rx or add custom formulation</span>
          </div>
          <Button size="sm" variant="outline" icon={Plus} onClick={() => setShowAddCustomModal(true)}>
            Add Custom Formulation
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {formulationsCatalog.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAddMedicineFromCatalog(item.id)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-ayur-50 hover:border-ayur-300 hover:text-ayur-900 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-teal-600" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OFFICIAL AYURVEDIC PRESCRIPTION DOCUMENT                                  */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none">

        {/* 1. DOCTOR & HOSPITAL LETTERHEAD */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-amber-500/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-ayur-500 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                🌿
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-white uppercase">
                  {doctorDetails.hospitalName}
                </h2>
                <p className="text-[10px] text-slate-300">
                  {doctorDetails.hospitalSubtext} • License: AYUSH-NABH-2026-9812
                </p>
              </div>
            </div>
            <p className="text-[11px] text-teal-300 font-semibold pt-1">
              {doctorDetails.department} • {doctorDetails.roomNo}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700">
            <h3 className="font-bold text-teal-300 text-sm">{doctorDetails.name}</h3>
            <p className="text-slate-300 text-[11px]">{doctorDetails.qualifications}</p>
            <p className="text-[10px] text-slate-400 font-mono">Reg No: {doctorDetails.registrationNumber}</p>
            <Badge variant="success" size="sm" className="mt-1 font-bold">Authorized Signatory</Badge>
          </div>
        </div>

        {/* 2. PATIENT DETAILS RIBBON */}
        <div className="p-4 sm:px-8 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-700">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Details</span>
            <strong className="text-slate-900 block text-xs">{patient.name}</strong>
            <span className="text-[11px] text-slate-500">{patient.gender}, {patient.age} years</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">UHID & Token</span>
            <span className="font-mono text-slate-900 block">{patient.uhid}</span>
            <span className="font-mono font-bold text-teal-800 text-[11px]">Token: {patient.tokenNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Language & Date</span>
            <strong className="text-slate-900 block text-xs">{patientLanguageLabel} ({patient.preferredLanguage?.toUpperCase() || 'TA'})</strong>
            <span className="text-[11px] text-slate-500">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Prakriti Baseline</span>
            <Badge variant="pitta" size="sm" className="mt-0.5">{patient.prakriti?.primary || 'Pitta-Vata'}</Badge>
            <span className="text-[10px] text-slate-400 block mt-0.5">Metabolism: {patient.caseIntake?.appetite || 'Tikshna Agni'}</span>
          </div>
        </div>

        {/* 3. PRESCRIPTION BODY CONTENT */}
        <div className="p-6 sm:p-8 space-y-6 text-xs">

          {/* ASSESSMENT / DIAGNOSIS SECTION */}
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-900 block">
                Ayurvedic Clinical Assessment & Confirmed Classical Diagnosis (Nidan & Samprapti)
              </span>
              <Badge variant="vata" size="sm">Practitioner Confirmed</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">Classical Nidan / Diagnosis</label>
                <Input
                  value={assessmentDiagnosis.classicalDiagnosis}
                  onChange={(e) => setAssessmentDiagnosis(prev => ({ ...prev, classicalDiagnosis: e.target.value }))}
                  className="font-bold text-slate-900 text-sm bg-white border-teal-300"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold block">AYUSH NAMASTE / ICD-11 Code</label>
                <Input
                  value={assessmentDiagnosis.icdNamasteCode}
                  onChange={(e) => setAssessmentDiagnosis(prev => ({ ...prev, icdNamasteCode: e.target.value }))}
                  className="bg-white border-teal-300 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 font-bold block">Samprapti Pathogenesis Progression</label>
              <Textarea
                rows={2}
                value={assessmentDiagnosis.sampraptiNotes}
                onChange={(e) => setAssessmentDiagnosis(prev => ({ ...prev, sampraptiNotes: e.target.value }))}
                className="bg-white border-teal-300 text-xs"
              />
            </div>
          </div>

          {/* MEDICINES, DOSAGE, INSTRUCTIONS RX TABLE */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold font-display text-slate-900 flex items-center gap-1.5">
                <span className="text-teal-700 font-serif italic text-lg">℞</span>
                <span>Classical Ayurvedic Formulations, Dosage & Administration Regimen</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Total {medicines.length} Formulations</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Medicine & Form</th>
                    <th className="py-2.5 px-3">Dosage & Frequency</th>
                    <th className="py-2.5 px-3">Timing & Anupana</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Instructions</th>
                    <th className="py-2.5 px-3 print:hidden text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicines.map((med, idx) => (
                    <tr key={med.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-900 block text-xs">{med.drugName}</strong>
                        <span className="text-[10px] text-slate-400">{med.form}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <span className="block font-mono text-xs text-slate-900">{med.dosage}</span>
                        <Badge variant="secondary" size="sm" className="mt-0.5">{med.frequency}</Badge>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-900 block font-medium text-[11px]">{med.timing}</span>
                        <span className="text-[10px] text-teal-800 font-semibold block">Anupana: {med.anupana}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">{med.duration}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-700 leading-snug">
                        {med.instructions}
                      </td>
                      <td className="py-3 px-3 print:hidden text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(med.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                          title="Remove formulation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PATHYA & APATHYA CLINICAL RULES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pathya (Beneficial Dietary & Lifestyle Protocol)</span>
              </span>
              <Textarea
                rows={3}
                value={pathyaRules}
                onChange={(e) => setPathyaRules(e.target.value)}
                className="bg-white border-emerald-300 text-xs"
              />
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
              <span className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-700" />
                <span>Apathya (Contraindicated Foods & Restrictions)</span>
              </span>
              <Textarea
                rows={3}
                value={apathyaRules}
                onChange={(e) => setApathyaRules(e.target.value)}
                className="bg-white border-rose-300 text-xs"
              />
            </div>
          </div>

          {/* FOLLOW-UP DATE & VAIDYA DIGITAL SIGNATURE BLOCK */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Next Clinical Follow-Up Schedule</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-700" />
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-44 font-bold text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-500 italic">
                {followUpNotes}
              </p>
            </div>

            {/* Official Digital Signature & Verification Seal */}
            <div className="text-right space-y-1 border-2 border-dashed border-teal-300 p-4 rounded-2xl bg-teal-50/40 min-w-[240px]">
              <span className="font-script text-xl text-slate-900 block italic font-serif font-bold">
                {doctorDetails.name}
              </span>
              <span className="text-[9px] text-slate-500 font-mono block">
                Digitally Signed • {doctorDetails.qualifications}
              </span>
              <span className="text-[9px] text-teal-800 font-mono block">
                Reg No: {doctorDetails.registrationNumber}
              </span>
              <div className="pt-1 flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ayurvedic Practitioner Verified</span>
              </div>
            </div>
          </div>

          {/* Mandatory Bottom Footer Notice */}
          <div className="pt-2 text-center border-t border-slate-100 text-[10px] text-slate-400">
            <span>NABH AYUSH Clinical Standard • Electronic Health Record Dossier AYUR-RX-2026-0891 • Not valid for medicolegal claims without practitioner seal.</span>
          </div>
        </div>
      </div>

      {/* Custom Formulation Add Modal */}
      {showAddCustomModal && (
        <Modal
          isOpen={showAddCustomModal}
          onClose={() => setShowAddCustomModal(false)}
          title="Add Custom Classical Formulation"
          subtitle="Formulation prescribed exclusively by attending Vaidya"
        >
          <div className="space-y-4 text-xs">
            <Input
              label="Medicine / Formulation Name"
              placeholder="e.g. Kamadudha Rasa, Sutashekhara Rasa, Triphala Guggulu"
              value={customMed.drugName}
              onChange={(e) => setCustomMed(prev => ({ ...prev, drugName: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Form (Churna, Vati, Bhasma, Kashayam)"
                value={customMed.form}
                onChange={(e) => setCustomMed(prev => ({ ...prev, form: e.target.value }))}
              />
              <Input
                label="Dosage"
                value={customMed.dosage}
                onChange={(e) => setCustomMed(prev => ({ ...prev, dosage: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Frequency (BD, OD, TID, HS)"
                value={customMed.frequency}
                onChange={(e) => setCustomMed(prev => ({ ...prev, frequency: e.target.value }))}
              />
              <Input
                label="Duration (e.g. 15 Days, 1 Month)"
                value={customMed.duration}
                onChange={(e) => setCustomMed(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Timing (Abhakta, Pragbhakta, Samabhakta)"
                value={customMed.timing}
                onChange={(e) => setCustomMed(prev => ({ ...prev, timing: e.target.value }))}
              />
              <Input
                label="Anupana (Vehicle - Honey, Warm Water, Milk)"
                value={customMed.anupana}
                onChange={(e) => setCustomMed(prev => ({ ...prev, anupana: e.target.value }))}
              />
            </div>
            <Textarea
              label="Specific Administration Instructions"
              rows={2}
              value={customMed.instructions}
              onChange={(e) => setCustomMed(prev => ({ ...prev, instructions: e.target.value }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAddCustomModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddCustomMedicine} icon={Plus}>
                Add to Prescription
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PrescriptionBuilder;
