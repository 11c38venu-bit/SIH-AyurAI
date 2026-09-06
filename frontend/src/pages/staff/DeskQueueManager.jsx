import React, { useState, useEffect } from 'react';
import {
  Clock,
  ArrowUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Building,
  RefreshCw,
  PhoneCall,
  Volume2,
  UserCheck,
  Languages,
  Check,
  ShieldCheck,
  AlertCircle,
  Eye,
  Filter,
  Sparkles,
  FileText
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const DeskQueueManager = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomFilter, setRoomFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [callingToken, setCallingToken] = useState(null);
  const [reviewPatient, setReviewPatient] = useState(null);

  // Dedicated Red-Flag Alerts List
  const [redFlagAlerts, setRedFlagAlerts] = useState([
    {
      id: 'alert-1',
      patientId: 'pat-101',
      token: 'A-024',
      patientName: 'Ananya S. Rao',
      age: 38,
      gender: 'Female',
      uhid: 'AYUR-2026-0891',
      room: 'OPD-102',
      triggeringResponse: 'Chronic retrosternal burning & acid reflux for 6 months with daily OTC antacid dependency',
      reason: 'Potential urgent symptom detected during case-taking: Prolonged mucosal irritation / ulceration risk',
      time: '09:15 AM (15 mins ago)',
      status: 'Review Required' // 'Review Required' | 'Priority Validated' | 'Normal Queue'
    },
    {
      id: 'alert-2',
      patientId: 'pat-104',
      token: 'A-026',
      patientName: 'Vikas Sharma',
      age: 48,
      gender: 'Male',
      uhid: 'AYUR-2026-0894',
      room: 'OPD-102',
      triggeringResponse: '3-month persistent dry cough with early morning throat constriction & exertional breathlessness',
      reason: 'Potential urgent symptom detected during case-taking: Unresolved Pranavaha Srotas obstruction',
      time: '09:30 AM (5 mins ago)',
      status: 'Review Required'
    }
  ]);

  const fetchPatients = async () => {
    setLoading(true);
    const data = await apiService.getPatients();
    setPatients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    await apiService.updatePatientStatus(id, newStatus);
    setPatients(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, tokenStatus: newStatus };
      }
      return p;
    }));
  };

  const handleValidatePriority = async (patientId, alertId = null) => {
    await apiService.updatePatientPriority(patientId, 'Priority Validated');
    setPatients(prev => {
      const idx = prev.findIndex(p => p.id === patientId);
      if (idx !== -1) {
        const copy = [...prev];
        const [promoted] = copy.splice(idx, 1);
        promoted.priority = 'Priority Validated';
        promoted.queuePosition = 1;
        return [promoted, ...copy];
      }
      return prev;
    });

    if (alertId) {
      setRedFlagAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Priority Validated' } : a));
    } else {
      setRedFlagAlerts(prev => prev.map(a => a.patientId === patientId ? { ...a, status: 'Priority Validated' } : a));
    }

    setReviewPatient(null);
  };

  const handleSetNormalPriority = async (patientId, alertId = null) => {
    await apiService.updatePatientPriority(patientId, 'Normal');
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, priority: 'Normal' };
      }
      return p;
    }));

    if (alertId) {
      setRedFlagAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Normal Queue' } : a));
    } else {
      setRedFlagAlerts(prev => prev.map(a => a.patientId === patientId ? { ...a, status: 'Normal Queue' } : a));
    }

    setReviewPatient(null);
  };

  const handleAnnounceToken = (token) => {
    setCallingToken(token);
    setTimeout(() => setCallingToken(null), 3500);
  };

  const getLanguageLabel = (code) => {
    const found = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return found ? `${found.nativeName} (${code.toUpperCase()})` : code?.toUpperCase() || 'EN';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'registered':
        return <Badge variant="secondary" size="sm">Registered</Badge>;
      case 'case_taking':
        return <Badge variant="vata" size="sm" dot>Case Taking</Badge>;
      case 'assessment':
        return <Badge variant="primary" size="sm">Assessment</Badge>;
      case 'waiting':
        return <Badge variant="waiting" size="sm" dot>Waiting</Badge>;
      case 'in_consultation':
        return <Badge variant="inProgress" size="sm" dot>With Doctor</Badge>;
      case 'completed':
        return <Badge variant="completed" size="sm">Completed</Badge>;
      case 'follow_up':
        return <Badge variant="success" size="sm">Follow-up</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
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
        return <Badge variant="secondary" size="sm">Normal Queue</Badge>;
    }
  };

  const filteredPatients = patients.filter(p => {
    if (roomFilter !== 'all' && p.assignedRoom !== roomFilter) return false;
    if (priorityFilter !== 'all') {
      if (priorityFilter === 'review' && p.priority !== 'Potential Red Flag — Review Required') return false;
      if (priorityFilter === 'validated' && p.priority !== 'Priority Validated') return false;
      if (priorityFilter === 'normal' && p.priority !== 'Normal' && p.priority !== 'Normal Queue') return false;
    }
    return true;
  });

  // Table Columns explicitly matching: Token, Patient, Status, Priority, Language, Action
  const columns = [
    {
      header: 'Token',
      key: 'tokenNumber',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-black text-slate-900 text-sm bg-slate-100 px-2 py-1 rounded-lg border border-slate-300">
            {val || 'A-024'}
          </span>
          {row.queuePosition > 0 && (
            <span className="text-[10px] text-slate-400 font-mono">Pos {row.queuePosition.toString().padStart(2, '0')}</span>
          )}
        </div>
      )
    },
    {
      header: 'Patient',
      key: 'name',
      render: (val, row) => (
        <div className="space-y-0.5">
          <strong className="text-slate-900 block text-xs font-bold">{val}</strong>
          <span className="text-[11px] text-slate-500 font-mono block">
            {row.gender}, {row.age}y • UHID: <span className="font-semibold text-slate-700">{row.uhid}</span>
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'tokenStatus',
      render: (val, row) => (
        <div className="space-y-1">
          {getStatusBadge(val)}
          <span className="text-[10px] text-slate-400 block font-mono">
            {row.assignedRoom || 'OPD-102'}
          </span>
        </div>
      )
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (val, row) => (
        <div className="space-y-1">
          {getPriorityBadge(val || 'Normal')}
          {val === 'Potential Red Flag — Review Required' && (
            <span className="text-[10px] text-amber-700 block font-medium">
              Staff Clinical Check Needed
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Language',
      key: 'preferredLanguage',
      render: (val) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
          {getLanguageLabel(val)}
        </span>
      )
    },
    {
      header: 'Action',
      key: 'actions',
      render: (val, row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Announce Button */}
          <Button
            size="sm"
            variant="outline"
            icon={Volume2}
            onClick={() => handleAnnounceToken(row.tokenNumber)}
            title="Announce token over PA chime"
            className="text-xs"
          >
            Call
          </Button>

          {/* Review & Validate Priority Button */}
          {row.priority === 'Potential Red Flag — Review Required' && (
            <button
              type="button"
              onClick={() => setReviewPatient(row)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
              title="Review safety intake flags and validate triage priority"
            >
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>Review Priority</span>
            </button>
          )}

          {/* Status Progression Controls */}
          {row.tokenStatus !== 'in_consultation' && row.tokenStatus !== 'completed' && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, 'in_consultation')}
              className="px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-semibold transition-colors"
            >
              With Doctor
            </button>
          )}

          {row.tokenStatus !== 'completed' && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, 'completed')}
              className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-semibold transition-colors"
            >
              ✓ Done
            </button>
          )}
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
            <span>Staff OPD Queue & Triage Manager</span>
            <Badge variant="warning" size="sm">Staff Desk Controller</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            Control room assignments, PA chime announcements, and clinical priority validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchPatients} isLoading={loading}>
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Staff Principle Motto Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-slate-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-semibold text-xs border border-amber-400">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-slate-950 shrink-0" />
          <span>
            CLINICAL TRIAGE RULE: <strong className="font-extrabold">&ldquo;AI flags — clinical staff decides.&rdquo;</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-900 bg-amber-200/80 px-2.5 py-1 rounded-lg border border-amber-300">
          Staff Counter Verification Required Before Priority Promotion
        </span>
      </div>

      <AiDisclaimerBanner compact />

      {/* Audio Announcement Simulation Banner */}
      {callingToken && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-md animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 animate-bounce" />
            <span>🔔 LOUDSPEAKER ANNOUNCEMENT: &quot;Token number {callingToken}, please proceed to Room OPD-102&quot;</span>
          </div>
          <Badge variant="primary" size="sm">Audio Chime Active</Badge>
        </div>
      )}

      {/* Dedicated Section: Potential Red Flag Alerts */}
      <Card className="border-2 border-amber-300 shadow-sm">
        <CardHeader className="pb-3 bg-amber-50/50 rounded-t-2xl">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <CardTitle className="text-sm text-slate-900">
                  Potential Red Flag Alerts (Live Triage Panel)
                </CardTitle>
                <CardDescription className="text-xs">
                  Review symptom intake signals and allocate priority triage or routine queue flow
                </CardDescription>
              </div>
            </div>
            <Badge variant="warning" size="sm" dot>
              {redFlagAlerts.filter(a => a.status === 'Review Required').length} Pending Validation
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="divide-y divide-slate-100">
            {redFlagAlerts.map((alert) => {
              const isPending = alert.status === 'Review Required';
              const isValidated = alert.status === 'Priority Validated';
              const isNormal = alert.status === 'Normal Queue';

              return (
                <div key={alert.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-sm bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                        {alert.token}
                      </span>
                      <div>
                        <strong className="text-slate-900 text-sm">{alert.patientName}</strong>
                        <span className="text-xs text-slate-500 font-mono ml-2">
                          {alert.gender}, {alert.age}y • UHID: {alert.uhid} • Room: {alert.room}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">{alert.time}</span>
                      {isValidated && (
                        <Badge variant="urgent" size="sm" dot>
                          Priority Validated
                        </Badge>
                      )}
                      {isNormal && (
                        <Badge variant="secondary" size="sm">
                          Normal Queue
                        </Badge>
                      )}
                      {isPending && (
                        <Badge variant="warning" size="sm" dot className="bg-amber-100 text-amber-900 border-amber-300">
                          Review Required
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Triggering Patient Response:
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        &quot;{alert.triggeringResponse}&quot;
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
                        Reason for Alert:
                      </span>
                      <p className="text-amber-950 font-semibold leading-relaxed">
                        {alert.reason}
                      </p>
                    </div>
                  </div>

                  {/* 3 Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => {
                        const found = patients.find(p => p.id === alert.patientId) || {
                          id: alert.patientId,
                          tokenNumber: alert.token,
                          name: alert.patientName,
                          gender: alert.gender,
                          age: alert.age,
                          uhid: alert.uhid,
                          chiefComplaint: alert.triggeringResponse,
                          redFlags: [{ id: 'rf-alert', title: alert.reason, desc: alert.triggeringResponse, action: 'Staff triage review' }]
                        };
                        setReviewPatient(found);
                      }}
                    >
                      Open Patient Case
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetNormalPriority(alert.patientId, alert.id)}
                      disabled={isNormal}
                      className={isNormal ? 'opacity-50' : ''}
                    >
                      Keep Normal Queue
                    </Button>

                    <Button
                      variant="amber"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => handleValidatePriority(alert.patientId, alert.id)}
                      disabled={isValidated}
                      className={isValidated ? 'opacity-50' : ''}
                    >
                      Validate Priority
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filter Selector Bar */}
      <Card className="p-4 bg-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
          {/* Suite Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Suite:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['all', 'OPD-102', 'OPD-104', 'OPD-106'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoomFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    roomFilter === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === 'all' ? 'All Rooms' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Priority Filter:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'all', label: 'All' },
                { id: 'review', label: '⚠ Review Needed' },
                { id: 'validated', label: 'Validated' },
                { id: 'normal', label: 'Normal' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriorityFilter(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    priorityFilter === p.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Staff Queue Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle className="text-sm">Live OPD Consultation Roster</CardTitle>
              <CardDescription>
                Tokens, clinical statuses, language preferences, and staff-validated triage
              </CardDescription>
            </div>
            <Badge variant="primary">
              {filteredPatients.length} Active Patients
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Table
            columns={columns}
            data={filteredPatients}
            searchable
            searchPlaceholder="Search tokens, patients, language..."
          />
        </CardContent>
      </Card>

      {/* Review Clinical Red Flag & Validate Priority Modal */}
      {reviewPatient && (
        <Modal
          isOpen={Boolean(reviewPatient)}
          onClose={() => setReviewPatient(null)}
          title={`Clinical Safety Review: Token ${reviewPatient.tokenNumber}`}
          subtitle={`Patient: ${reviewPatient.name} (${reviewPatient.gender}, ${reviewPatient.age}y • UHID: ${reviewPatient.uhid})`}
          size="md"
        >
          <div className="space-y-4 text-xs py-2">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Preliminary AI Red-Flag Observation</span>
              </div>
              {reviewPatient.redFlags && reviewPatient.redFlags.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {reviewPatient.redFlags.map((rf) => (
                    <div key={rf.id} className="p-2.5 bg-white rounded-xl border border-amber-200">
                      <strong className="text-slate-900 block">{rf.title}</strong>
                      <p className="text-slate-600 text-[11px] mt-0.5">{rf.desc}</p>
                      <span className="text-[10px] text-amber-800 font-semibold block mt-1">Action: {rf.action}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-600">
                  Chief Complaint: {reviewPatient.chiefComplaint}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800 block mb-0.5">Staff Protocol Notice:</span>
              Priority is NOT assigned automatically by patient self-reports. Confirm patient symptoms at counter before validating priority triage.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetNormalPriority(reviewPatient.id)}
              >
                Keep Normal Queue
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => handleValidatePriority(reviewPatient.id)}
              >
                Validate Priority
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DeskQueueManager;
