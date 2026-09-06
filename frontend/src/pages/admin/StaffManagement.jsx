import React, { useState } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  Building,
  CheckCircle2,
  Mail,
  Phone,
  Clock
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const StaffManagement = () => {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);

  const [staffMembers, setStaffMembers] = useState([
    {
      id: 'st-1',
      name: 'Meenakshi Sundaram',
      role: 'Receptionist / Token Operator',
      desk: 'Counter 1 (Main Entrance)',
      phone: '+91 94440 11223',
      email: 'meenakshi@ayurai.health',
      shift: 'Morning (08:00 - 16:00)',
      status: 'Active Duty',
    },
    {
      id: 'st-2',
      name: 'Raghavan Iyer',
      role: 'Pharmacist & Dispenser',
      desk: 'Herbal Pharmacy Desk 4',
      phone: '+91 98450 33445',
      email: 'raghavan@ayurai.health',
      shift: 'Full Day (09:00 - 18:00)',
      status: 'Active Duty',
    },
    {
      id: 'st-3',
      name: 'Deepa Narayan',
      role: 'Panchakarma Therapist Coordinator',
      desk: 'Therapy Block 2',
      phone: '+91 97450 66778',
      email: 'deepa@ayurai.health',
      shift: 'Morning (07:00 - 15:00)',
      status: 'Active Duty',
    },
    {
      id: 'st-4',
      name: 'Suresh Kumar',
      role: 'Triage & Vital Signs Assistant',
      desk: 'Counter 2 (Vitals Station)',
      phone: '+91 98800 22334',
      email: 'suresh@ayurai.health',
      shift: 'Evening (14:00 - 22:00)',
      status: 'On Standby',
    }
  ]);

  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Receptionist / Token Operator',
    desk: 'Counter 1',
    phone: '',
    email: '',
    shift: 'Morning (08:00 - 16:00)',
  });

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!newStaff.name) return;
    setStaffMembers(prev => [
      ...prev,
      {
        id: `st-${Date.now()}`,
        name: newStaff.name,
        role: newStaff.role,
        desk: newStaff.desk,
        phone: newStaff.phone || '+91 90000 00000',
        email: newStaff.email || 'staff@ayurai.health',
        shift: newStaff.shift,
        status: 'Active Duty',
      }
    ]);
    setShowAddModal(false);
  };

  const columns = [
    {
      header: 'Staff Name & Contact',
      key: 'name',
      render: (val, row) => (
        <div>
          <strong className="text-slate-900 block text-xs">{val}</strong>
          <span className="text-[10px] text-slate-400">{row.email} • {row.phone}</span>
        </div>
      )
    },
    {
      header: 'Role / Designation',
      key: 'role',
      render: (val) => <span className="text-xs font-semibold text-slate-800">{val}</span>
    },
    {
      header: 'Assigned Counter / Station',
      key: 'desk',
      render: (val) => <Badge variant="secondary" size="sm">{val}</Badge>
    },
    {
      header: 'Shift Timing',
      key: 'shift',
      render: (val) => <span className="text-xs text-slate-600 font-mono">{val}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <Badge variant={val === 'Active Duty' ? 'success' : 'waiting'} dot>{val}</Badge>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Staff Directory & Counter Stations</span>
            <Badge variant="warning" size="sm">{staffMembers.length} Registered</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            Frontdesk receptionists, triage nurses, herbal pharmacists, and Panchakarma coordinators
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Staff Member
        </Button>
      </div>

      <AiDisclaimerBanner compact />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Table
            columns={columns}
            data={staffMembers}
            searchable
            searchPlaceholder="Search staff by name, counter, role..."
          />
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Onboard Hospital Staff Member"
          subtitle="Assign counter desk and shift schedule"
        >
          <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
            <Input
              label="Staff Full Name *"
              required
              placeholder="e.g. Ramesh Chandra"
              value={newStaff.name}
              onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Role / Designation"
                value={newStaff.role}
                onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                options={[
                  { value: 'Receptionist / Token Operator', label: 'Receptionist / Token Operator' },
                  { value: 'Pharmacist & Dispenser', label: 'Pharmacist & Dispenser' },
                  { value: 'Panchakarma Therapist Coordinator', label: 'Therapist Coordinator' },
                  { value: 'Triage Assistant', label: 'Triage Assistant' },
                ]}
              />
              <Input
                label="Counter / Station Desk"
                value={newStaff.desk}
                onChange={(e) => setNewStaff(prev => ({ ...prev, desk: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Mobile Phone"
                value={newStaff.phone}
                onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                label="Email"
                value={newStaff.email}
                onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Staff Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StaffManagement;
