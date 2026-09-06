import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';

// Layout Shell
import AppShell from '../components/layout/AppShell';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientWelcome from '../pages/patient/PatientWelcome';
import PatientRegister from '../pages/patient/PatientRegister';
import TokenTracker from '../pages/patient/TokenTracker';
import CaseTakingWizard from '../pages/patient/CaseTakingWizard';
import PrakritiAssessment from '../pages/patient/PrakritiAssessment';
import MedicalHistory from '../pages/patient/MedicalHistory';
import DocumentsUpload from '../pages/patient/DocumentsUpload';
import CaseSummary from '../pages/patient/CaseSummary';
import RedFlagsReview from '../pages/patient/RedFlagsReview';
import PatientStatus from '../pages/patient/PatientStatus';
import FollowUpTracker from '../pages/patient/FollowUpTracker';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorQueue from '../pages/doctor/DoctorQueue';
import PatientList from '../pages/doctor/PatientList';
import PatientDetail from '../pages/doctor/PatientDetail';
import ConsultationRoom from '../pages/doctor/ConsultationRoom';
import PrescriptionBuilder from '../pages/doctor/PrescriptionBuilder';

// Staff Pages
import StaffDashboard from '../pages/staff/StaffDashboard';
import DeskRegistration from '../pages/staff/DeskRegistration';
import DeskQueueManager from '../pages/staff/DeskQueueManager';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import DoctorsManagement from '../pages/admin/DoctorsManagement';
import StaffManagement from '../pages/admin/StaffManagement';
import PatientsManagement from '../pages/admin/PatientsManagement';
import AnalyticsReports from '../pages/admin/AnalyticsReports';
import SettingsPage from '../pages/admin/SettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Patient Portal Routes */}
      <Route path="/patient" element={<AppShell />}>
        <Route index element={<PatientDashboard />} />
        <Route path="welcome" element={<PatientWelcome />} />
        <Route path="register" element={<PatientRegister />} />
        <Route path="token" element={<TokenTracker />} />
        <Route path="case-taking" element={<CaseTakingWizard />} />
        <Route path="assessment" element={<PrakritiAssessment />} />
        <Route path="medical-history" element={<MedicalHistory />} />
        <Route path="documents" element={<DocumentsUpload />} />
        <Route path="summary" element={<CaseSummary />} />
        <Route path="red-flags" element={<RedFlagsReview />} />
        <Route path="status" element={<PatientStatus />} />
        <Route path="follow-up" element={<FollowUpTracker />} />
      </Route>

      {/* Doctor Portal Routes */}
      <Route path="/doctor" element={<AppShell />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="queue" element={<DoctorQueue />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="patient/:id" element={<PatientDetail />} />
        <Route path="consultation/:id" element={<ConsultationRoom />} />
        <Route path="prescription/:id" element={<PrescriptionBuilder />} />
      </Route>

      {/* Staff Portal Routes */}
      <Route path="/staff" element={<AppShell />}>
        <Route index element={<StaffDashboard />} />
        <Route path="registration" element={<DeskRegistration />} />
        <Route path="queue" element={<DeskQueueManager />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route path="/admin" element={<AppShell />}>
        <Route index element={<AdminDashboard />} />
        <Route path="doctors" element={<DoctorsManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="patients" element={<PatientsManagement />} />
        <Route path="analytics" element={<AnalyticsReports />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
