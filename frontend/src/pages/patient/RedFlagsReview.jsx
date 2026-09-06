import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Info,
  Clock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  PhoneCall,
  HeartPulse,
  UserCheck,
  Activity,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LanguageSelector from '../../components/common/LanguageSelector';
import PatientJourneyTracker from '../../components/patient/PatientJourneyTracker';

export const RedFlagsReview = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await apiService.getPatientById(user?.id || 'pat-101');
      setPatient(data);
    };
    load();
  }, [user]);

  if (!patient) return <div className="p-8 text-center text-slate-400">Loading safety review...</div>;

  const redFlagsList = patient.redFlags || [
    {
      id: 'rf-1',
      level: 'practitioner_review',
      title: 'Chronic Retrosternal Burning & Prolonged Antacid Dependency',
      desc: '6-month history of burning with sour regurgitation; warrants Vaidya review for mucosal irritation (Urdhwaga Amlapitta) vs ulceration.',
      action: 'Prioritized in Room OPD-102 session for staff triage review.'
    },
    {
      id: 'rf-2',
      level: 'informational',
      title: 'Reported Penicillin Drug Allergy',
      desc: 'Documented allopathic antibiotic allergy. Safe for Classical Ayurvedic herbs.',
      action: 'Noted in Patient Safety Log.'
    }
  ];

  const workflowStages = [
    { id: 1, title: 'Patient Responses', desc: 'Case-taking answers', status: 'completed' },
    { id: 2, title: 'AI / Rule-Based Screening', desc: 'Automated safety check', status: 'completed' },
    { id: 3, title: 'Potential Red Flag', desc: 'Flagged for attention', status: 'active' },
    { id: 4, title: 'Priority / Triage Alert', desc: 'Routed to frontdesk', status: 'pending' },
    { id: 5, title: 'Staff Review', desc: 'Nurse clinical check', status: 'pending' },
    { id: 6, title: 'Queue Decision', desc: 'Validated Priority or Normal', status: 'pending' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('redFlags.title')}</span>
            <Badge variant="warning" size="sm">Clinical Safety</Badge>
          </h1>
          <p className="text-xs text-slate-500">{t('redFlags.subtitle')}</p>
        </div>

        <LanguageSelector variant="dropdown" />
      </div>

      <PatientJourneyTracker currentStepId={8} variant="compact" />

      {/* Safety Protocol Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">Ayurvedic Clinical Safety Assurance</p>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            {t('redFlags.safetyDisclaimer')}
          </p>
          <p className="text-amber-900 font-semibold text-[11px] pt-1">
            ℹ️ Potential urgent cases are reviewed by hospital staff before priority handling.
          </p>
        </div>
      </div>

      {/* Mandatory Red-Flag Workflow Pipeline Visualization */}
      <Card className="border-teal-100 bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span>Safety & Triage Review Protocol</span>
            </CardTitle>
            <Badge variant="secondary" size="sm">6-Stage Pipeline</Badge>
          </div>
          <CardDescription className="text-[11px]">
            How AYURAI screens case-taking responses and coordinates with hospital staff
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {workflowStages.map((stage, idx) => {
              const isCompleted = stage.status === 'completed';
              const isActive = stage.status === 'active';
              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                    isActive
                      ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-200 shadow-xs'
                      : isCompleted
                      ? 'bg-teal-50/60 border-teal-200 text-teal-950'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isActive
                          ? 'bg-amber-500 text-white animate-pulse'
                          : isCompleted
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? '✓' : stage.id}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <div>
                    <strong className={`block text-[11px] leading-tight ${isActive ? 'text-amber-950 font-bold' : isCompleted ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                      {stage.title}
                    </strong>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                      {stage.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Potential Red Flag State Card */}
      <Card className="border-2 border-amber-400 bg-amber-50/40 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-sm text-amber-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>⚠ Potential Red Flag — Triage Review Required</span>
            </CardTitle>
            <Badge variant="warning" size="sm" dot>Review Queued</Badge>
          </div>
          <CardDescription className="text-amber-900 font-medium text-xs">
            Reason: Potential urgent symptom detected during case-taking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <strong className="text-slate-900 text-xs block">
                  Identified Observation: Chronic Retrosternal Burning & Prolonged Antacid Dependency
                </strong>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  Patient reported a 6-month history of daily burning sensation with sour regurgitation (Urdhwaga Amlapitta) and continuous reliance on OTC antacids.
                </p>
              </div>
              <Badge variant="amber" size="sm">Observation</Badge>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>What happens next?</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Our clinical desk nurse will conduct a brief physical review at the counter. If confirmed, your token will be placed in the priority stream for Vaidya consultation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorized Safety Tiers */}
      <div className="space-y-4">
        {/* Tier 1: Urgent Attention */}
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{t('redFlags.urgentAttention')}</span>
              </CardTitle>
              <Badge variant="success">0 Acute Emergencies</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-slate-600">
            <p className="text-[11px] text-slate-500">
              No acute cardiovascular distress, acute respiratory failure, or active hemorrhage indicators reported in digital case intake.
            </p>
          </CardContent>
        </Card>

        {/* Tier 2: Practitioner Review */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{t('redFlags.practitionerReview')}</span>
              </CardTitle>
              <Badge variant="warning">1 Highlighted for Vaidya</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {redFlagsList.filter(rf => rf.level === 'practitioner_review').map(rf => (
              <div key={rf.id} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-slate-800 space-y-1">
                <span className="font-bold text-amber-950 block text-xs">{rf.title}</span>
                <p className="text-slate-600 text-[11px]">{rf.desc}</p>
                <span className="text-[10px] text-amber-800 font-semibold block pt-1">
                  ✓ Clinical Action: {rf.action}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tier 3: Informational */}
        <Card className="border-l-4 border-l-teal-600">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm text-teal-900">
                <Info className="w-4 h-4 text-teal-600" />
                <span>{t('redFlags.informational')}</span>
              </CardTitle>
              <Badge variant="primary">Documented Observations</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {redFlagsList.filter(rf => rf.level === 'informational').map(rf => (
              <div key={rf.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="font-semibold text-slate-900 block">{rf.title}</span>
                <p className="text-[11px] text-slate-500">{rf.desc}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="md" onClick={() => navigate('/patient/summary')} icon={ArrowLeft}>
              {t('common.previous')}
            </Button>

            <NavLink to="/patient/status">
              <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                Proceed to Live Queue Status
              </Button>
            </NavLink>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RedFlagsReview;
