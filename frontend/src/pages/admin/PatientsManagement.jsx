import React, { useState, useEffect } from 'react';
import {
  Users,
  Download,
  Search,
  Filter,
  Activity,
  FileCheck,
  Languages,
  Clock,
  Sparkles
} from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const PatientsManagement = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  useEffect(() => {
    const fetchAll = async () => {
      const data = await apiService.getPatients();
      setPatients(data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const getLanguageMeta = (code) => {
    const l = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return l ? `${l.nativeName} (${l.code.toUpperCase()})` : code?.toUpperCase() || 'EN';
  };

  const filteredPatients = patients.filter(p => {
    if (selectedLanguage === 'all') return true;
    return p.preferredLanguage === selectedLanguage;
  });

  const columns = [
    {
      header: 'UHID',
      key: 'uhid',
      render: (val) => <span className="font-mono font-bold text-slate-800 text-xs">{val}</span>
    },
    {
      header: 'Patient Demographics',
      key: 'name',
      render: (val, row) => (
        <div>
          <strong className="text-slate-900 block text-xs">{val}</strong>
          <span className="text-[10px] text-slate-400">
            {row.gender}, {row.age}y • {row.phone}
          </span>
        </div>
      )
    },
    {
      header: 'Patient Preferred Language',
      key: 'preferredLanguage',
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="vata" size="sm">
            {getLanguageMeta(val)}
          </Badge>
        </div>
      )
    },
    {
      header: 'Prakriti Baseline',
      key: 'prakriti',
      render: (val) => (
        <Badge variant={val?.primary?.includes('Pitta') ? 'pitta' : val?.primary?.includes('Kapha') ? 'kapha' : 'vata'}>
          {val?.primary || 'Pitta-Vata'}
        </Badge>
      )
    },
    {
      header: 'Current Intake Status',
      key: 'tokenStatus',
      render: (val) => (
        <Badge variant={val === 'completed' ? 'completed' : val === 'in_consultation' ? 'inProgress' : 'waiting'} dot>
          {val.replace('_', ' ')}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Hospital Master Patient Index</span>
            <Badge variant="primary" size="sm">{patients.length} Master Records</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            Longitudinal demographic registry with native mother-tongue tracking across all 6 Indian languages
          </p>
        </div>

        <Button variant="outline" size="sm" icon={Download} onClick={() => alert('Exporting Master Patient Index CSV...')}>
          Export Master CSV
        </Button>
      </div>

      <AiDisclaimerBanner compact />

      {/* Language Filter Bar */}
      <Card className="p-4 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-700">Filter by Patient Mother Tongue:</span>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedLanguage('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedLanguage === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Languages ({patients.length})
            </button>
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setSelectedLanguage(l.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedLanguage === l.code ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l.nativeName} ({l.code.toUpperCase()})
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Table
            columns={columns}
            data={filteredPatients}
            searchable
            searchPlaceholder="Search master index by UHID, patient name, phone, language..."
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsManagement;
