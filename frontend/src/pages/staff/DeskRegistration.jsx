import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Printer,
  Sparkles,
  Building,
  Phone,
  Clock,
  UserCheck,
  Languages,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const DeskRegistration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [patientType, setPatientType] = useState('new'); // 'new' | 'returning'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFound, setSearchFound] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Female',
    phone: '',
    address: '',
    emergencyContact: '',
    occupation: '',
    preferredLanguage: 'ta',
    assignedRoom: 'OPD-102',
    assignedDoctor: 'Vaidya Dr. K. Rajesh Sharma',
    chiefComplaint: '',
  });

  const [createdToken, setCreatedToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const patients = await apiService.getPatients();
    const found = patients.find(
      p => p.phone.includes(searchQuery.trim()) || p.uhid.toLowerCase().includes(searchQuery.toLowerCase()) || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      setFormData({
        name: found.name,
        age: String(found.age || '38'),
        gender: found.gender || 'Female',
        phone: found.phone || searchQuery,
        address: found.address || '',
        emergencyContact: found.emergencyContact || '',
        occupation: found.occupation || '',
        preferredLanguage: found.preferredLanguage || 'ta',
        assignedRoom: 'OPD-102',
        assignedDoctor: 'Vaidya Dr. K. Rajesh Sharma',
        chiefComplaint: found.chiefComplaint || 'Follow-Up Review',
      });
      setSearchFound(true);
    } else {
      alert('No previous patient found with this Phone/UHID. You can register as a New Patient.');
      setSearchFound(false);
    }
    setIsSearching(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill at least Patient Name and Mobile Number');
      return;
    }

    setIsSubmitting(true);
    const newPatient = await apiService.registerPatient(formData);
    setCreatedToken(newPatient);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'Female',
      phone: '',
      address: '',
      emergencyContact: '',
      occupation: '',
      preferredLanguage: 'ta',
      assignedRoom: 'OPD-102',
      assignedDoctor: 'Vaidya Dr. K. Rajesh Sharma',
      chiefComplaint: '',
    });
    setSearchQuery('');
    setSearchFound(false);
    setCreatedToken(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Counter OPD Patient Registration</span>
          <Badge variant="warning" size="sm">Staff Desk 1</Badge>
        </h1>
        <p className="text-xs text-slate-500">
          Fast walk-in intake, returning patient lookup, language assignment, and instant thermal slip generation
        </p>
      </div>

      <AiDisclaimerBanner compact />

      {/* New vs Returning Patient Toggle Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-700">Patient Type:</span>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setPatientType('new'); handleReset(); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              patientType === 'new' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Walk-In Patient
          </button>
          <button
            type="button"
            onClick={() => setPatientType('returning')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              patientType === 'returning' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Returning Patient (Lookup)
          </button>
        </div>
      </div>

      {/* Returning Patient Lookup Card */}
      {patientType === 'returning' && (
        <Card className="border-2 border-amber-200 bg-amber-50/20">
          <CardHeader>
            <CardTitle className="text-xs text-amber-950 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-700" />
              <span>Lookup Returning Patient by Phone / UHID</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="flex gap-2 text-xs">
              <Input
                placeholder="Enter Mobile (+91 98450 12345) or UHID (AYUR-2026-0891)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="md" variant="primary" isLoading={isSearching} icon={Search}>
                Find Record
              </Button>
            </form>
            {searchFound && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                ✓ Patient record found and demographic fields auto-populated below!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm">Patient Demographic Details & Language</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                required
                placeholder="e.g. Ananya Rao"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Age (Years)"
                  type="number"
                  placeholder="38"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                />
                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  options={[
                    { value: 'Female', label: 'Female' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Phone *"
                required
                placeholder="+91 98450 12345"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Select
                label="Preferred Consultation Language"
                value={formData.preferredLanguage}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                options={SUPPORTED_LANGUAGES.map(l => ({
                  value: l.code,
                  label: `${l.nativeName} (${l.name})`,
                }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Assigned OPD Room & Doctor"
                value={formData.assignedRoom}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedRoom: e.target.value }))}
                options={[
                  { value: 'OPD-102', label: 'Room 102 — Vaidya Dr. Rajesh Sharma (Kayachikitsa)' },
                  { value: 'OPD-104', label: 'Room 104 — Vaidya Dr. Priya Nair (Panchakarma)' },
                  { value: 'OPD-106', label: 'Room 106 — Vaidya Dr. Anand Deshmukh (Shalya)' },
                ]}
              />
              <Input
                label="Presenting Chief Complaint"
                placeholder="e.g. Acidity, knee pain, headache"
                value={formData.chiefComplaint}
                onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" variant="secondary" size="md" onClick={handleReset} icon={RotateCcw}>
              Clear
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="ml-auto"
              isLoading={isSubmitting}
              icon={UserPlus}
            >
              Generate Live Token & Print Slip
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Instant Thermal Slip Modal */}
      {createdToken && (
        <Modal
          isOpen={Boolean(createdToken)}
          onClose={() => setCreatedToken(null)}
          title="OPD Token Generated Successfully"
          subtitle="Direct patient to 1st floor waiting lounge near assigned room"
          size="md"
        >
          <div className="space-y-6 text-center py-4">
            {/* Printable Thermal Slip Design */}
            <div className="border-2 border-dashed border-slate-300 p-6 rounded-2xl bg-slate-50 space-y-3 font-mono text-xs text-left max-w-sm mx-auto shadow-inner">
              <div className="text-center pb-2 border-b border-slate-300">
                <h3 className="font-bold text-sm tracking-tight text-slate-900">AYURAI OPD TOKEN SLIP</h3>
                <p className="text-[10px] text-slate-500">Counter 1 • {new Date().toLocaleDateString()}</p>
              </div>

              <div className="text-center py-2">
                <span className="text-4xl font-black text-slate-900 tracking-tight block">
                  {createdToken.tokenNumber}
                </span>
                <Badge variant="vata" size="sm" className="mt-1">Room {createdToken.assignedRoom}</Badge>
              </div>

              <div className="space-y-1 text-[11px] pt-2 border-t border-slate-300">
                <div className="flex justify-between"><span>Patient:</span><strong>{createdToken.name}</strong></div>
                <div className="flex justify-between"><span>UHID:</span><strong>{createdToken.uhid}</strong></div>
                <div className="flex justify-between"><span>Language:</span><strong className="uppercase">{createdToken.preferredLanguage}</strong></div>
                <div className="flex justify-between"><span>Doctor:</span><strong>{createdToken.assignedDoctorName}</strong></div>
                <div className="flex justify-between"><span>Est. Wait:</span><strong>~{createdToken.estimatedWaitMins} mins</strong></div>
              </div>

              <p className="text-[9px] text-slate-400 text-center pt-2 italic">
                Please scan QR on slip to access digital case-taking on your mobile.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" size="md" icon={Printer} onClick={() => window.print()}>
                Print Thermal Slip
              </Button>
              <Button variant="primary" size="md" onClick={() => setCreatedToken(null)}>
                Done & Next Intake
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DeskRegistration;
