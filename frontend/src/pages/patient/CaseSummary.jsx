import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Printer, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import Button from '../../components/common/Button';
import LanguageSelector from '../../components/common/LanguageSelector';
import PatientJourneyTracker from '../../components/patient/PatientJourneyTracker';
import AiClinicalSummary from '../../components/summary/AiClinicalSummary';

export const CaseSummary = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      const data = await apiService.getPatientById(user.id || 'pat-101');
      setPatient(data);
      setLoading(false);
    };
    fetchPatient();
  }, [user]);

  if (loading || !patient) {
    return <div className="p-8 text-center text-slate-400">Loading structured summary...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls & Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 font-medium">Step 7 of 10: AI Clinical Synthesis</span>
          <h2 className="text-xl font-bold text-slate-900">Pre-Consultation Case Dossier</h2>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageSelector variant="dropdown" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={Printer}
          >
            {t('common.print')}
          </Button>
        </div>
      </div>

      <PatientJourneyTracker currentStepId={7} variant="compact" />

      {/* Main AI Clinical Summary (14 Sections with Visual Labels) */}
      <AiClinicalSummary
        patientData={patient}
        isDoctorView={false}
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button variant="secondary" size="md" onClick={() => navigate('/patient/documents')} icon={ArrowLeft}>
          {t('common.previous')}
        </Button>

        <NavLink to="/patient/red-flags">
          <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
            Review Red Flags & Safety Status
          </Button>
        </NavLink>
      </div>
    </div>
  );
};

export default CaseSummary;
