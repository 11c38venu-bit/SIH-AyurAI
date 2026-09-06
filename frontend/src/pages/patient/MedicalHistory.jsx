import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Activity,
  Heart,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { AiDisclaimerBanner } from '../../components/common/Alert';
import LanguageSelector from '../../components/common/LanguageSelector';
import PatientJourneyTracker from '../../components/patient/PatientJourneyTracker';

export const MedicalHistory = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState({
    pastIllnesses: 'Occasional migraine episodes (2021-2023), Mild GERD / Hyperacidity',
    surgeries: 'None',
    allergies: 'Penicillin (Allopathic antibiotic — skin hives), Dust & pollen sensitivity',
    currentMedicines: 'Pantoprazole 40mg (taken occasionally during burning episodes)',
    familyHistory: 'Father: Hypertension; Mother: Osteoarthritis (Janu Sandhigata Vata)',
    habits: 'Non-smoker, Tea (3 cups daily), No alcohol, Desk job',
    tobaccoAlcohol: 'No tobacco, No alcohol',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const pat = await apiService.getPatientById(user.id || 'pat-101');
      if (pat && pat.medicalHistory) {
        setHistory(prev => ({ ...prev, ...pat.medicalHistory }));
      }
    };
    loadData();
  }, [user]);

  const handleChange = (field, val) => {
    setHistory(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await apiService.updatePatientCase(user.id || 'pat-101', {
      medicalHistory: history,
    });
    setIsSaving(false);
    navigate('/patient/documents');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('medicalHistory.title')}</span>
            <Badge variant="primary" size="sm">Past Profile</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            {t('medicalHistory.subtitle')}
          </p>
        </div>

        <LanguageSelector variant="dropdown" />
      </div>

      <AiDisclaimerBanner compact />
      <PatientJourneyTracker currentStepId={5} variant="compact" />

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-sm">
            <FileText className="w-4 h-4 text-ayur-700" />
            <span>Clinical Background & Allergies</span>
          </CardTitle>
          <CardDescription>
            Helps prevent adverse drug-herb interactions and tailors Pathya (dietary rules)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <Textarea
            label={t('medicalHistory.pastIllnesses')}
            rows={2}
            placeholder="e.g. Migraine, Thyroid, Jaundice, High BP..."
            value={history.pastIllnesses}
            onChange={(e) => handleChange('pastIllnesses', e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('medicalHistory.surgeries')}
              placeholder="e.g. Appendectomy (2018), Knee Arthroscopy"
              value={history.surgeries}
              onChange={(e) => handleChange('surgeries', e.target.value)}
            />
            <Input
              label={t('medicalHistory.allergies')}
              placeholder="e.g. Penicillin, Sulpha, Peanuts"
              value={history.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
              className="border-rose-300"
            />
          </div>

          <Textarea
            label={t('medicalHistory.currentMedicines')}
            rows={2}
            placeholder="e.g. Blood pressure tablets, diabetic medicines, supplements..."
            value={history.currentMedicines}
            onChange={(e) => handleChange('currentMedicines', e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('medicalHistory.familyHistory')}
              placeholder="e.g. Diabetes, Arthritis, Heart Disease in parents"
              value={history.familyHistory}
              onChange={(e) => handleChange('familyHistory', e.target.value)}
            />
            <Input
              label={t('medicalHistory.habits')}
              placeholder="e.g. Tea 3 cups/day, vegetarian, sedentary"
              value={history.habits}
              onChange={(e) => handleChange('habits', e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="md" onClick={() => navigate('/patient/assessment')} icon={ArrowLeft}>
            {t('common.previous')}
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            isLoading={isSaving}
            icon={ArrowRight}
            iconPosition="right"
          >
            {t('medicalHistory.saveHistory')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MedicalHistory;
