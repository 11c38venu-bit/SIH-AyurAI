import apiClient from './apiClient';
import authApi from './authApi';
import patientApi from './patientApi';
import queueApi from './queueApi';
import caseApi from './caseApi';
import ayurvedicApi from './ayurvedicApi';
import medicalHistoryApi from './medicalHistoryApi';
import documentApi from './documentApi';
import aiApi from './aiApi';
import consultationApi from './consultationApi';
import prescriptionApi from './prescriptionApi';
import followUpApi from './followUpApi';
import progressApi from './progressApi';
import notificationApi from './notificationApi';
import analyticsApi from './analyticsApi';
import adminApi from './adminApi';
import demoStore from '../demo/demoStore';

// Re-export individual backend service modules for direct modular use / future production integration
export {
  apiClient,
  authApi,
  patientApi,
  queueApi,
  caseApi,
  ayurvedicApi,
  medicalHistoryApi,
  documentApi,
  aiApi,
  consultationApi,
  prescriptionApi,
  followUpApi,
  progressApi,
  notificationApi,
  analyticsApi,
  adminApi,
};

// Demo Mode is active by default for hackathon review, with automatic fallback if backend is unavailable
const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false';

/**
 * Unified apiService bridging component calls.
 * In Demo Mode (or when backend is unavailable), routes through demoStore with localStorage persistence.
 */
export const apiService = {
  // ---------------- Patients & Queue ----------------
  async getPatients({ skip = 0, limit = 100, search = '' } = {}) {
    if (isDemoMode) {
      return await demoStore.getPatients({ skip, limit, search });
    }
    try {
      const backendPatients = await patientApi.getPatients({ skip, limit, search });
      const todayQueue = await queueApi.getTodayQueue().catch(() => []);

      return backendPatients.map((p, index) => {
        const token = todayQueue.find(
          (q) => q.patient_id === p.id || q.patient?.patient_id === p.patient_id
        );
        const age = p.date_of_birth
          ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()
          : 32;

        return {
          id: p.id,
          uhid: p.patient_id,
          name: p.full_name,
          dob: p.date_of_birth || '1992-01-01',
          age: age || 32,
          gender: p.gender || 'Female',
          phone: p.phone || '+91 90000 00000',
          email: p.email || '',
          preferredLanguage: p.preferred_language || 'en',
          tokenNumber: token ? token.token_number : `A-${String(index + 1).padStart(3, '0')}`,
          tokenStatus: token ? token.status.toLowerCase() : 'waiting',
          priority: token && token.priority === 'PRIORITY' ? 'Priority Validated' : 'Normal',
          assignedRoom: 'OPD-102',
          assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
          queuePosition: index + 1,
          estimatedWaitMins: (index + 1) * 8,
          chiefComplaint: 'General Ayurvedic Consultation & Assessment',
          duration: '1 month',
          vitals: { pulse: 74, bp: '120/80', weight: 64, height: 165, bmi: '23.5', temperature: '98.4 F' },
          prakriti: { primary: 'Pitta-Vata', vata: 45, pitta: 40, kapha: 15, vikriti: 'Pitta-Vata imbalance' },
          caseIntake: { primaryCategory: 'gastrointestinal', chiefComplaint: 'General Ayurvedic Consultation', duration: '1 month', appetite: 'Sama Agni', bowel: 'Madhyama Koshtha', sleep: 'Moderate' },
          medicalHistory: { pastIllnesses: 'None reported', allergies: 'No known drug allergies', currentMedicines: 'None' },
          documents: [],
        };
      });
    } catch (e) {
      console.warn('Backend unavailable, falling back to local demo dataset', e);
      return await demoStore.getPatients({ skip, limit, search });
    }
  },

  async getPatientById(id) {
    if (isDemoMode) {
      return await demoStore.getPatientById(id);
    }
    try {
      const patientIdParam = id && !isNaN(Number(id)) ? Number(id) : id;
      let patient = null;

      if (typeof patientIdParam === 'number' || (typeof patientIdParam === 'string' && patientIdParam.startsWith('PAT-'))) {
        patient = await patientApi.getPatientById(patientIdParam).catch(() => null);
      }

      if (!patient) {
        return await demoStore.getPatientById(id);
      }

      const queueList = await queueApi.getPatientQueue(patient.id).catch(() => []);
      const activeToken = queueList.find((q) => q.status === 'WAITING' || q.status === 'IN_CONSULTATION') || queueList[0];
      const age = patient.date_of_birth
        ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
        : 32;

      return {
        id: patient.id,
        uhid: patient.patient_id,
        name: patient.full_name,
        dob: patient.date_of_birth || '1992-01-01',
        age: age || 32,
        gender: patient.gender || 'Female',
        phone: patient.phone || '+91 90000 00000',
        email: patient.email || '',
        preferredLanguage: patient.preferred_language || 'en',
        tokenNumber: activeToken ? activeToken.token_number : 'A-001',
        tokenStatus: activeToken ? activeToken.status.toLowerCase() : 'waiting',
        priority: activeToken && activeToken.priority === 'PRIORITY' ? 'Priority Validated' : 'Normal',
        assignedRoom: 'OPD-102',
        assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
        queuePosition: 1,
        estimatedWaitMins: 10,
        chiefComplaint: 'General Ayurvedic Consultation',
        duration: '1 month',
        vitals: { pulse: 74, bp: '120/80', weight: 64, height: 165, bmi: '23.5', temperature: '98.4 F' },
        prakriti: { primary: 'Pitta-Vata', vata: 45, pitta: 40, kapha: 15, vikriti: 'Pitta-Vata imbalance' },
        caseIntake: { primaryCategory: 'gastrointestinal', chiefComplaint: 'General Ayurvedic Consultation', duration: '1 month', appetite: 'Sama Agni', bowel: 'Madhyama Koshtha', sleep: 'Moderate' },
        medicalHistory: { pastIllnesses: 'None reported', allergies: 'No known drug allergies', currentMedicines: 'None' },
        documents: [],
      };
    } catch (e) {
      console.warn('Backend unavailable, falling back to local demo patient', e);
      return await demoStore.getPatientById(id);
    }
  },

  async registerPatient(data) {
    if (isDemoMode) {
      return await demoStore.registerPatient(data);
    }
    try {
      const createdPatient = await patientApi.createPatient({
        full_name: data.name || data.full_name,
        date_of_birth: data.dob || data.date_of_birth || null,
        gender: data.gender || 'Female',
        phone: data.phone || null,
        email: data.email || null,
        preferred_language: data.preferredLanguage || data.preferred_language || 'en',
      });

      let token = null;
      try {
        token = await queueApi.createToken(createdPatient.id, 'NORMAL');
      } catch (e) {
        console.warn('Queue token creation skipped or duplicate', e);
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: createdPatient.id,
        uhid: createdPatient.patient_id,
        name: createdPatient.full_name,
        tokenNumber: token ? token.token_number : 'A-001',
        tokenStatus: 'waiting',
        assignedRoom: 'OPD-102',
        assignedDepartment: 'Kayachikitsa (Internal Medicine)',
        registrationTime: timeStr,
        estimatedWaitMins: 15,
        ...data,
      };
    } catch (e) {
      console.warn('Backend unavailable, registering patient in local demo store', e);
      return await demoStore.registerPatient(data);
    }
  },

  async updatePatientCase(id, updateFields) {
    return await demoStore.updatePatientCase(id, updateFields);
  },

  async updatePatientStatus(id, newStatus) {
    if (isDemoMode) {
      return await demoStore.updatePatientStatus(id, newStatus);
    }
    try {
      const todayQueue = await queueApi.getTodayQueue().catch(() => []);
      const token = todayQueue.find((q) => q.patient_id === id || q.id === id);
      if (token) {
        let statusUpper = newStatus.toUpperCase();
        if (statusUpper === 'IN_CONSULTATION' || statusUpper === 'WITH DOCTOR') statusUpper = 'IN_CONSULTATION';
        if (statusUpper === 'WAITING' || statusUpper === 'CASE READY') statusUpper = 'WAITING';
        if (statusUpper === 'COMPLETED') statusUpper = 'COMPLETED';
        return await queueApi.updateTokenStatus(token.id, statusUpper);
      }
    } catch (e) {
      console.warn('Backend unavailable, updating status in demo store', e);
    }
    return await demoStore.updatePatientStatus(id, newStatus);
  },

  async updatePatientPriority(patientId, newPriority) {
    if (isDemoMode) {
      return await demoStore.updatePatientPriority(patientId, newPriority);
    }
    try {
      const todayQueue = await queueApi.getTodayQueue().catch(() => []);
      const token = todayQueue.find((q) => q.patient_id === patientId || q.id === patientId);
      if (token) {
        const priorityUpper = newPriority.includes('Priority') ? 'PRIORITY' : 'NORMAL';
        return await queueApi.updateTokenPriority(token.id, priorityUpper);
      }
    } catch (e) {
      console.warn('Backend unavailable, updating priority in demo store', e);
    }
    return await demoStore.updatePatientPriority(patientId, newPriority);
  },

  async addDocument(patientId, docInfo) {
    return await demoStore.addDocument(patientId, docInfo);
  },

  async deleteDocument(patientId, docId) {
    if (!isDemoMode && typeof docId === 'number') {
      await documentApi.deleteDocument(docId).catch(() => null);
    }
    return await demoStore.deleteDocument(patientId, docId);
  },

  // ---------------- Doctors & OPD Queue ----------------
  async getDoctors() {
    if (isDemoMode) {
      return await demoStore.getDoctors();
    }
    try {
      const doctors = await adminApi.getDoctors();
      return doctors.map((d, idx) => ({
        id: `doc-${d.id}`,
        dbId: d.id,
        name: d.full_name,
        qualification: 'BAMS, MD (Kayachikitsa)',
        specialty: 'Kayachikitsa (Internal Medicine)',
        roomNo: `OPD-${102 + idx * 2}`,
        experience: '12+ Years',
        status: d.is_active ? 'On Duty' : 'Off Duty',
        consultationsToday: 14,
        avgTime: '12 min',
      }));
    } catch (e) {
      return await demoStore.getDoctors();
    }
  },

  async getStaff() {
    return await demoStore.getStaff();
  },

  async getQueue() {
    return await this.getPatients();
  },

  async callNextPatient(doctorId = 'doc-1') {
    if (isDemoMode) {
      return await demoStore.callNextPatient(doctorId);
    }
    try {
      const todayQueue = await queueApi.getTodayQueue();
      const nextWaiting = todayQueue.find((q) => q.status === 'WAITING' || q.status === 'CALLED');
      if (nextWaiting) {
        await queueApi.updateTokenStatus(nextWaiting.id, 'IN_CONSULTATION');
        return {
          id: nextWaiting.patient_id,
          tokenNumber: nextWaiting.token_number,
          tokenStatus: 'in_consultation',
        };
      }
    } catch (e) {
      console.warn('Backend unavailable, calling next patient from demo store', e);
    }
    return await demoStore.callNextPatient(doctorId);
  },

  // ---------------- Prescriptions & Formulations ----------------
  async getFormulations() {
    if (isDemoMode) {
      return await demoStore.getFormulations();
    }
    try {
      const medicines = await prescriptionApi.getMedicines({ limit: 100 });
      return medicines.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.form || m.category || 'Churna',
        indications: m.indications || m.description || 'Classical Ayurvedic formulation',
        standardDosage: m.standard_dosage || '3 to 5g with warm water',
        timing: 'Abhakta (Before meals)',
        anupana: 'Lukewarm water / Honey',
      }));
    } catch (e) {
      return await demoStore.getFormulations();
    }
  },

  async getPathyaGuidelines(dosha = 'pitta') {
    return await demoStore.getPathyaGuidelines(dosha);
  },

  async savePrescription(patientId, rxData) {
    if (isDemoMode) {
      return await demoStore.savePrescription(patientId, rxData);
    }
    try {
      await prescriptionApi.createPrescription({
        patient_id: Number(patientId),
        diagnosis: rxData.diagnosis || 'Ayurvedic Clinical Prescription',
        instructions: rxData.instructions || null,
        pathya_rules: rxData.pathyaRules || null,
        apathya_rules: rxData.apathyaRules || null,
        follow_up_date: rxData.followUpDate || null,
        items: (rxData.medicines || []).map((m) => ({
          medicine_name: m.drugName || m.name,
          form: m.form || m.type || 'Churna',
          dosage: m.dosage || m.dose || '1 dose',
          frequency: m.frequency || 'Twice daily',
          timing: m.timing || 'Before food',
          anupana: m.anupana || 'Lukewarm water',
          duration: m.duration || '15 Days',
          instructions: m.instructions || '',
        })),
      });
    } catch (e) {
      console.warn('Backend unavailable, saving prescription in demo store', e);
    }
    return await demoStore.savePrescription(patientId, rxData);
  },

  // ---------------- Analytics ----------------
  async getAnalytics() {
    if (isDemoMode) {
      return await demoStore.getAnalytics();
    }
    try {
      return await analyticsApi.getAdminDashboard();
    } catch (e) {
      return await demoStore.getAnalytics();
    }
  },

  // ---------------- Notifications ----------------
  async getNotifications() {
    return await demoStore.getNotifications();
  },

  async markNotificationRead(id) {
    return await demoStore.markNotificationRead(id);
  },
};

export default apiService;
