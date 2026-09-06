import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Plus,
  Users,
  Building,
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const DoctorsManagement = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    qualification: 'BAMS, MD (Ayurveda)',
    specialty: 'Kayachikitsa',
    roomNo: 'OPD-108',
    experience: '8 Years',
  });

  const fetchDoctors = async () => {
    setLoading(true);
    const data = await apiService.getDoctors();
    setDoctors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctorSubmit = (e) => {
    e.preventDefault();
    if (!newDoctor.name) return;
    const added = {
      id: `doc-${Date.now()}`,
      name: newDoctor.name,
      qualification: newDoctor.qualification,
      specialty: newDoctor.specialty,
      experience: newDoctor.experience,
      roomNo: newDoctor.roomNo,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      status: 'Available',
      patientsServedToday: 0,
      averageTimePerPatient: '12 mins'
    };
    setDoctors(prev => [...prev, added]);
    setShowAddModal(false);
  };

  const columns = [
    {
      header: 'Vaidya Name & Qualification',
      key: 'name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={val}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
          />
          <div>
            <strong className="text-slate-900 block text-xs">{val}</strong>
            <span className="text-[11px] text-slate-400">{row.qualification} • {row.experience}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Clinical Specialty Area',
      key: 'specialty',
      render: (val) => <span className="text-xs font-semibold text-slate-800">{val}</span>
    },
    {
      header: 'OPD Suite',
      key: 'roomNo',
      render: (val) => <Badge variant="vata">{val}</Badge>
    },
    {
      header: 'Consultations Today',
      key: 'patientsServedToday',
      render: (val) => <span className="font-mono font-bold text-slate-900">{val}</span>
    },
    {
      header: 'Duty Status',
      key: 'status',
      render: (val) => (
        <Badge variant={val === 'In Consultation' ? 'inProgress' : 'success'} dot>
          {val}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Doctor Roster & OPD Rooms</span>
            <Badge variant="primary" size="sm">{doctors.length} On Duty</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            Manage Vaidya duty schedules, consultation quotas, and OPD room allocations
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Practitioner
        </Button>
      </div>

      <AiDisclaimerBanner compact />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Table
            columns={columns}
            data={doctors}
            searchable
            searchPlaceholder="Search doctors by name, specialty, room..."
          />
        </CardContent>
      </Card>

      {/* Add Practitioner Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Ayurvedic Practitioner"
          subtitle="Onboard licensed Vaidya to hospital clinical roster"
        >
          <form onSubmit={handleAddDoctorSubmit} className="space-y-4 text-xs">
            <Input
              label="Doctor Full Name *"
              required
              placeholder="e.g. Vaidya Dr. Sunita Joshi"
              value={newDoctor.name}
              onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Qualification"
                value={newDoctor.qualification}
                onChange={(e) => setNewDoctor(prev => ({ ...prev, qualification: e.target.value }))}
              />
              <Input
                label="Experience"
                value={newDoctor.experience}
                onChange={(e) => setNewDoctor(prev => ({ ...prev, experience: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Clinical Specialty"
                value={newDoctor.specialty}
                onChange={(e) => setNewDoctor(prev => ({ ...prev, specialty: e.target.value }))}
                options={[
                  { value: 'Kayachikitsa', label: 'Kayachikitsa (General/Metabolic)' },
                  { value: 'Panchakarma', label: 'Panchakarma (Detoxification)' },
                  { value: 'Shalya Tantra', label: 'Shalya Tantra (Surgical/Gut)' },
                  { value: 'Prasuti & Stri Roga', label: 'Prasuti & Stri Roga (Gynecology)' },
                ]}
              />
              <Input
                label="Assigned Room #"
                value={newDoctor.roomNo}
                onChange={(e) => setNewDoctor(prev => ({ ...prev, roomNo: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add to Roster
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DoctorsManagement;
