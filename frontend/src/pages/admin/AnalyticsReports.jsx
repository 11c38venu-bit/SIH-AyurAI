import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  Activity,
  FileText,
  Clock,
  Languages,
  Users,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/I18nContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { AiDisclaimerBanner } from '../../components/common/Alert';

export const AnalyticsReports = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const data = await apiService.getAnalytics();
      setAnalytics(data);
    };
    fetchAnalytics();
  }, []);

  // 1. Language Usage Breakdown (Core requirement!)
  const languageUsageData = [
    { language: 'தமிழ் (Tamil)', code: 'TA', patients: 542, pct: '32.3%', color: '#0D9488' },
    { language: 'English', code: 'EN', patients: 388, pct: '23.1%', color: '#6366F1' },
    { language: 'हिन्दी (Hindi)', code: 'HI', patients: 294, pct: '17.5%', color: '#E11D48' },
    { language: 'ಕನ್ನಡ (Kannada)', code: 'KN', patients: 216, pct: '12.9%', color: '#F59E0B' },
    { language: 'മലയാളം (Malayalam)', code: 'ML', patients: 142, pct: '8.5%', color: '#16A34A' },
    { language: 'తెలుగు (Telugu)', code: 'TE', patients: 98, pct: '5.8%', color: '#8B5CF6' },
  ];

  // 2. Registrations vs Completed Consultations
  const registrationTrendData = [
    { week: 'Week 1', registered: 320, consulted: 310 },
    { week: 'Week 2', registered: 390, consulted: 375 },
    { week: 'Week 3', registered: 440, consulted: 420 },
    { week: 'Week 4', registered: 530, consulted: 505 },
  ];

  // 3. Average Wait Times by Department
  const waitTimesByDept = [
    { dept: 'Kayachikitsa (General)', avgWait: 14, standardTarget: 15 },
    { dept: 'Panchakarma (Detox)', avgWait: 18, standardTarget: 20 },
    { dept: 'Shalya (Gut/Surgical)', avgWait: 12, standardTarget: 15 },
    { dept: 'Prasuti & Stri Roga', avgWait: 16, standardTarget: 15 },
  ];

  // 4. Age & Gender Demographics
  const demographicData = [
    { ageGroup: '18-30 yrs', male: 110, female: 160 },
    { ageGroup: '31-45 yrs', male: 240, female: 320 },
    { ageGroup: '46-60 yrs', male: 280, female: 310 },
    { ageGroup: '60+ yrs', male: 130, female: 130 },
  ];

  // 5. Follow-Up Completion & Adherence
  const followUpCompletionData = [
    { name: 'Completed on Schedule', value: 68, color: '#16A34A' },
    { name: 'Rescheduled / Active', value: 24, color: '#F59E0B' },
    { name: 'Missed / Pending Call', value: 8, color: '#E11D48' },
  ];

  // 6. Classical Herbal Formulations Dispensed
  const formulationUsageData = [
    { name: 'Avipattikar Churna', count: 184, category: 'Pitta Shamaka' },
    { name: 'Maharasnadi Kashayam', count: 162, category: 'Vata Shamaka' },
    { name: 'Triphala Churna', count: 210, category: 'Tridoshahara' },
    { name: 'Yogaraj Guggulu', count: 135, category: 'Vata-Kapha' },
    { name: 'Praval Pishti', count: 98, category: 'Dahashamaka' },
    { name: 'Ashwagandharishta', count: 92, category: 'Balya & Medhya' },
  ];

  if (!analytics) return <div className="p-8 text-center text-slate-400">Loading Clinical Analytics...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Clinical, Operational & Multilingual Analytics</span>
            <Badge variant="primary" size="sm">AYUSH Insights</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            Epidemiological trends, 6-language patient adoption, OPD turnaround times, and classical drug utilization
          </p>
        </div>

        <Button variant="outline" size="sm" icon={Download} onClick={() => alert('Generating Comprehensive Hospital PDF Report...')}>
          Export PDF Intelligence Report
        </Button>
      </div>

      <AiDisclaimerBanner compact />

      {/* Grid: 6 Interactive Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Multilingual Patient Language Distribution (EXPLICIT REQUIREMENT) */}
        <Card className="border-t-4 border-t-ayur-600">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm">
                <Languages className="w-4 h-4 text-ayur-700" />
                <span>Multilingual Patient Adoption (6 Indian Languages)</span>
              </CardTitle>
              <Badge variant="vata">1,680 Patients</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languageUsageData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="code" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val, name, item) => [`${val} Patients (${item.payload.pct})`, item.payload.language]} />
                <Bar dataKey="patients" radius={[4, 4, 0, 0]}>
                  {languageUsageData.map((e, idx) => (
                    <Cell key={idx} fill={e.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Registrations vs Completed Consultations */}
        <Card className="border-t-4 border-t-indigo-600">
          <CardHeader>
            <CardTitle className="text-sm">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Weekly Registrations vs Completed Consultations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="registered" stroke="#0D9488" fill="#0D9488" fillOpacity={0.2} name="Intakes Registered" />
                <Area type="monotone" dataKey="consulted" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} name="Consultations Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Average Wait Times by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Average Patient Waiting Time by OPD Department (Minutes)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitTimesByDept} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="dept" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="avgWait" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Actual Avg Wait (mins)" />
                <Bar dataKey="standardTarget" fill="#94A3B8" radius={[4, 4, 0, 0]} name="NABH Target Max (mins)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Follow-Up Adherence & Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Follow-Up Adherence & Treatment Completion Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={followUpCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                >
                  {followUpCompletionData.map((e, idx) => (
                    <Cell key={idx} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5. Patient Demographics (Age & Gender) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <Users className="w-4 h-4 text-slate-700" />
              <span>Patient Age Spectrum & Gender Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographicData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="ageGroup" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="female" stackId="a" fill="#E11D48" name="Female Patients" />
                <Bar dataKey="male" stackId="a" fill="#6366F1" radius={[4, 4, 0, 0]} name="Male Patients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6. Classical Formulation Utilization Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              <Activity className="w-4 h-4 text-ayur-700" />
              <span>Classical Ayurvedic Formulations Dispensed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formulationUsageData} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, width: 110 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0F766E" radius={[0, 4, 4, 0]} name="Prescriptions Dispensed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsReports;
