import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Search,
  Eye,
  Stethoscope,
  Activity,
  FileCheck,
  Filter
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const PatientList = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const data = await apiService.getPatients();
      setPatients(data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const columns = [
    {
      header: 'UHID / Token',
      key: 'uhid',
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-slate-800 block text-xs">{row.uhid}</span>
          <span className="font-mono text-[11px] text-ayur-700">{row.tokenNumber}</span>
        </div>
      )
    },
    {
      header: 'Patient Name',
      key: 'name',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{val}</span>
          <span className="text-[11px] text-slate-400">{row.gender}, {row.age} yrs • {row.phone}</span>
        </div>
      )
    },
    {
      header: 'Prakriti Balance',
      key: 'prakriti',
      render: (val) => (
        <Badge variant={val.primary.includes('Pitta') ? 'pitta' : val.primary.includes('Kapha') ? 'kapha' : 'vata'} size="sm">
          {val.primary}
        </Badge>
      )
    },
    {
      header: 'Chief Complaint',
      key: 'chiefComplaint',
      className: 'max-w-xs',
      render: (val) => (
        <p className="truncate max-w-xs text-xs text-slate-600" title={val}>
          {val}
        </p>
      )
    },
    {
      header: 'OPD Status',
      key: 'tokenStatus',
      render: (val) => (
        <Badge variant={val === 'in_consultation' ? 'inProgress' : val === 'completed' ? 'completed' : 'waiting'}>
          {val.replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <NavLink to={`/doctor/consultation/${row.id}`}>
            <Button size="sm" variant="outline" icon={Stethoscope}>
              Consult
            </Button>
          </NavLink>
          <NavLink to={`/doctor/patient/${row.id}`}>
            <Button size="sm" variant="ghost" icon={Eye}>
              EHR
            </Button>
          </NavLink>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('navigation.patientRecords')}</span>
            <Badge variant="primary" size="sm">{patients.length} Registered</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            Hospital-wide electronic health records, Ayurvedic anamnesis and clinical registries
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Table
            columns={columns}
            data={patients}
            searchable
            searchPlaceholder="Search by name, UHID, symptom..."
            pageSize={8}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;
