import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  CheckCircle2,
  Clock,
  Heart,
  FileText,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { AiDisclaimerBanner } from '../../components/common/Alert';
import LanguageSelector from '../../components/common/LanguageSelector';

export const PatientRegister = () => {
  const { t, language } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: 'Ananya S. Rao',
    dob: '1988-05-14',
    age: '38',
    gender: 'Female',
    phone: '+91 98450 12345',
    email: 'ananya.rao@example.com',
    address: 'No. 42, 4th Main Road, Indiranagar, Bengaluru - 560038',
    emergencyContact: '+91 98450 99887 (Srinivasa Rao - Spouse)',
    occupation: 'Senior Software Architect',
    preferredLanguage: language || 'ta',
    pulse: '78',
    bp: '124/82',
    weight: '62',
    height: '164',
    chiefComplaint: 'Chronic hyperacidity (Amlapitta), burning sensation in chest after meals, morning joint stiffness',
    duration: '6 months',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPatient, setCreatedPatient] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.chiefComplaint) {
      alert('Please fill all required fields marked with *');
      return;
    }

    setIsSubmitting(true);
    try {
      const newPatient = await apiService.registerPatient(formData);
      setCreatedPatient(newPatient);
      login('patient', newPatient);
    } catch (err) {
      console.error('Registration failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdPatient) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <Badge variant="success" size="md">{t('common.success')}</Badge>
            <h2 className="text-2xl font-bold text-slate-900">{t('registration.successAlert')}</h2>
            <p className="text-xs text-slate-500">
              Registration Time: <strong>{createdPatient.registrationTime}</strong> • {createdPatient.assignedDepartment}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto grid grid-cols-2 gap-4 text-left">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">{t('common.tokenNo')}</span>
              <span className="text-2xl font-bold text-ayur-800 font-mono">{createdPatient.tokenNumber}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">{t('common.uhid')}</span>
              <span className="text-sm font-bold text-slate-800 font-mono">{createdPatient.uhid}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">{t('token.assignedRoom')}</span>
              <span className="text-sm font-bold text-slate-800">{createdPatient.assignedRoom}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-semibold block">{t('token.estimatedTime')}</span>
              <span className="text-sm font-bold text-slate-800">~{createdPatient.estimatedWaitMins} mins</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/patient/case-taking')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Start Conversational Case-Taking
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/patient/token')}
              icon={Clock}
            >
              {t('navigation.tokenTracker')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('registration.title')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('registration.subtitle')}
          </p>
        </div>

        <LanguageSelector variant="dropdown" />
      </div>

      <AiDisclaimerBanner compact />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal & Contact Information (8 Required Fields) */}
        <Card>
          <CardHeader>
            <CardTitle>{t('registration.personalSection')}</CardTitle>
            <CardDescription>Patient demographics, emergency details, and occupation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('common.name')}
                required
                placeholder="e.g. Ananya Rao"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Date of Birth (DOB)"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                />
                <Select
                  label={t('common.gender')}
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  options={[
                    { value: 'Female', label: t('common.female') },
                    { value: 'Male', label: t('common.male') },
                    { value: 'Other', label: t('common.other') },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('common.phone')}
                required
                placeholder="+91 98450 12345"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              <Input
                label={t('common.email')}
                type="email"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Residential Address & City"
                placeholder="Street address, city, pincode"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
              <Input
                label="Emergency Contact Person & Phone"
                placeholder="Name & phone number of relative"
                value={formData.emergencyContact}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Occupation / Work Routine"
                placeholder="e.g. Teacher, Engineer, Homemaker"
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
              />
              <Select
                label={t('registration.preferredLanguage')}
                value={formData.preferredLanguage}
                onChange={(e) => handleChange('preferredLanguage', e.target.value)}
                options={SUPPORTED_LANGUAGES.map(l => ({
                  value: l.code,
                  label: `${l.nativeName} (${l.name})`,
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Vitals */}
        <Card>
          <CardHeader>
            <CardTitle>{t('registration.vitalsSection')}</CardTitle>
            <CardDescription>Preliminary clinic measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label={t('registration.pulse')}
                type="number"
                placeholder="78"
                value={formData.pulse}
                onChange={(e) => handleChange('pulse', e.target.value)}
              />
              <Input
                label={t('registration.bp')}
                placeholder="124/82"
                value={formData.bp}
                onChange={(e) => handleChange('bp', e.target.value)}
              />
              <Input
                label={t('registration.weight')}
                type="number"
                placeholder="62"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
              />
              <Input
                label={t('registration.height')}
                type="number"
                placeholder="164"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Primary Health Concern */}
        <Card>
          <CardHeader>
            <CardTitle>{t('registration.complaintSection')}</CardTitle>
            <CardDescription>Primary health symptom bringing you to the hospital</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label={t('registration.chiefComplaint')}
              required
              rows={3}
              placeholder={t('registration.chiefComplaintPlaceholder')}
              value={formData.chiefComplaint}
              onChange={(e) => handleChange('chiefComplaint', e.target.value)}
            />

            <Input
              label="Duration of symptoms"
              placeholder="e.g. 6 months, 2 weeks"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <span className="text-xs text-slate-500">
              * Required fields for clinical record initialization
            </span>
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              icon={UserPlus}
            >
              {t('registration.generateToken')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default PatientRegister;
