import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  Stethoscope,
  FileText,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  PhoneCall,
  Languages,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const DoctorQueue = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('token'); // 'token' | 'wait' | 'priority'

  const fetchPatients = async () => {
    setLoading(true);
    const data = await apiService.getPatients();
    setPatients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleCallPatient = async (patientId) => {
    await apiService.callNextPatient(user?.id || 'doc-1');
    fetchPatients();
  };

  // Filter & Search Logic
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.chiefComplaint && p.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.tokenStatus === statusFilter;
    
    // Priority filter
    let matchesPriority = true;
    if (priorityFilter !== 'all') {
      if (priorityFilter === 'validated') matchesPriority = p.priority === 'Priority Validated';
      else if (priorityFilter === 'review') matchesPriority = p.priority === 'Potential Red Flag — Review Required';
      else if (priorityFilter === 'normal') matchesPriority = p.priority === 'Normal' || p.priority === 'Normal Queue';
    }

    const matchesLanguage = languageFilter === 'all' || p.preferredLanguage === languageFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesLanguage;
  });

  // Sort Logic
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortBy === 'wait') {
      return (b.estimatedWaitMins || 0) - (a.estimatedWaitMins || 0);
    }
    if (sortBy === 'priority') {
      const aVal = a.priority === 'Priority Validated' ? 2 : a.priority === 'Potential Red Flag — Review Required' ? 1 : 0;
      const bVal = b.priority === 'Priority Validated' ? 2 : b.priority === 'Potential Red Flag — Review Required' ? 1 : 0;
      return bVal - aVal;
    }
    return a.tokenNumber.localeCompare(b.tokenNumber);
  });

  const getLanguageNative = (code) => {
    const found = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return found ? `${found.nativeName} (${code.toUpperCase()})` : code.toUpperCase();
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Priority Validated':
        return (
          <Badge variant="urgent" size="sm" dot className="font-bold">
            Priority Validated
          </Badge>
        );
      case 'Potential Red Flag — Review Required':
        return (
          <Badge variant="warning" size="sm" className="font-bold bg-amber-100 text-amber-900 border-amber-300">
            ⚠ Review Required
          </Badge>
        );
      case 'Normal Queue':
      case 'Normal':
      default:
        return <Badge variant="secondary" size="sm">Routine</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('queue.title')}</span>
            <Badge variant="vata" size="sm">Room OPD-102</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            {t('queue.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPatients} isLoading={loading} icon={RefreshCw}>
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Doctor Safety Directive Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white border border-teal-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            CLINICAL SAFETY PRINCIPLE: <strong className="text-amber-300 font-extrabold">&ldquo;Potential Red Flag ≠ Diagnosis&rdquo;</strong>
          </span>
        </div>
        <span className="text-[11px] text-teal-200 bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-700/60">
          All prioritized cases have undergone staff counter check
        </span>
      </div>

      <AiDisclaimerBanner compact />

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-white shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by Patient Name, UHID, Token, or Symptom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefixIcon={Search}
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'waiting', label: 'Waiting in Lounge' },
              { value: 'in_consultation', label: 'In Consultation' },
              { value: 'completed', label: 'Completed' },
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'validated', label: 'Priority Validated' },
              { value: 'review', label: 'Review Required' },
              { value: 'normal', label: 'Routine Queue' },
            ]}
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'token', label: 'Sort: Token #' },
              { value: 'wait', label: 'Sort: Wait Time' },
              { value: 'priority', label: 'Sort: Clinical Priority' },
            ]}
          />
        </div>
      </Card>

      {/* Triage Queue Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Token</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Chief Complaint</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Est. Wait</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No patients found matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  sortedPatients.map((p) => {
                    const isCurrent = p.tokenStatus === 'in_consultation';

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isCurrent ? 'bg-amber-50/60 font-semibold' : ''
                        }`}
                      >
                        {/* Token */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                          {p.tokenNumber}
                        </td>

                        {/* Patient */}
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block text-xs">{p.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.gender}, {p.age}y • {p.uhid}
                          </span>
                        </td>

                        {/* Chief Complaint */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="truncate text-slate-700 text-xs" title={p.chiefComplaint}>
                            {p.chiefComplaint || 'Ayurvedic General Consultation'}
                          </p>
                          <span className="text-[10px] text-slate-400">Duration: {p.duration || '1 month'}</span>
                        </td>

                        {/* Patient Language Badge */}
                        <td className="py-3.5 px-4">
                          <Badge variant="secondary" size="sm" className="font-semibold">
                            {getLanguageNative(p.preferredLanguage || 'ta')}
                          </Badge>
                        </td>

                        {/* Waiting Time */}
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {p.tokenStatus === 'completed' ? 'Done' : `~${p.estimatedWaitMins || 10} mins`}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              p.tokenStatus === 'in_consultation'
                                ? 'inProgress'
                                : p.tokenStatus === 'completed'
                                ? 'completed'
                                : 'waiting'
                            }
                            dot
                          >
                            {p.tokenStatus.replace('_', ' ')}
                          </Badge>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4">
                          {getPriorityBadge(p.priority)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <NavLink to={`/doctor/patient/${p.id}`}>
                              <Button size="sm" variant="outline" icon={FileText} title="View 360° EHR Dossier">
                                EHR
                              </Button>
                            </NavLink>
                            <NavLink to={`/doctor/consultation/${p.id}`}>
                              <Button size="sm" variant="primary" icon={Stethoscope}>
                                Consult
                              </Button>
                            </NavLink>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorQueue;
