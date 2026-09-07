/**
 * AYURAI — DEMO STATE STORE
 * Stateful repository with localStorage persistence for Hackathon Interactive Demonstration.
 * Operates 100% offline without FastAPI, PostgreSQL, Supabase, or external APIs.
 */

import {
  DEMO_PATIENTS,
  DEMO_DOCTORS,
  DEMO_STAFF,
  DEMO_FORMULATIONS,
  DEMO_PATHYA_APATHYA,
  DEMO_NOTIFICATIONS,
  DEMO_ANALYTICS,
} from './demoData';

const STORAGE_KEY = 'ayurai_demo_store_v1';

class DemoStore {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse demo store from localStorage, using initial dataset', e);
    }

    const initialState = {
      patients: JSON.parse(JSON.stringify(DEMO_PATIENTS)),
      doctors: JSON.parse(JSON.stringify(DEMO_DOCTORS)),
      staff: JSON.parse(JSON.stringify(DEMO_STAFF)),
      formulations: JSON.parse(JSON.stringify(DEMO_FORMULATIONS)),
      pathyaApathya: JSON.parse(JSON.stringify(DEMO_PATHYA_APATHYA)),
      notifications: JSON.parse(JSON.stringify(DEMO_NOTIFICATIONS)),
      lastTokenIndex: 28,
    };
    this.saveState(initialState);
    return initialState;
  }

  saveState(stateToSave = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save demo store to localStorage', e);
    }
  }

  resetDemoData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
    this.state = {
      patients: JSON.parse(JSON.stringify(DEMO_PATIENTS)),
      doctors: JSON.parse(JSON.stringify(DEMO_DOCTORS)),
      staff: JSON.parse(JSON.stringify(DEMO_STAFF)),
      formulations: JSON.parse(JSON.stringify(DEMO_FORMULATIONS)),
      pathyaApathya: JSON.parse(JSON.stringify(DEMO_PATHYA_APATHYA)),
      notifications: JSON.parse(JSON.stringify(DEMO_NOTIFICATIONS)),
      lastTokenIndex: 28,
    };
    this.saveState(this.state);
    return this.state;
  }

  // ----------------------------------------------------
  // PATIENTS & QUEUE
  // ----------------------------------------------------
  async getPatients({ search = '', skip = 0, limit = 100 } = {}) {
    let result = [...this.state.patients];
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.uhid?.toLowerCase().includes(term) ||
          p.tokenNumber?.toLowerCase().includes(term) ||
          p.chiefComplaint?.toLowerCase().includes(term)
      );
    }
    return result.slice(skip, skip + limit);
  }

  async getPatientById(id) {
    if (!id) return this.state.patients[0] || null;
    const strId = String(id);
    const found = this.state.patients.find(
      (p) =>
        String(p.id) === strId ||
        p.uhid === strId ||
        p.tokenNumber === strId ||
        String(p.id).toLowerCase() === strId.toLowerCase()
    );
    if (found) return found;

    // Numerical ID fallback (e.g. 1 -> pat-101)
    if (!isNaN(Number(id))) {
      const numIdx = Number(id);
      if (numIdx >= 1 && numIdx <= this.state.patients.length) {
        return this.state.patients[numIdx - 1];
      }
    }
    return this.state.patients[0] || null;
  }

  async registerPatient(formData) {
    this.state.lastTokenIndex += 1;
    const tokenNumber = `A-${String(this.state.lastTokenIndex).padStart(3, '0')}`;
    const newId = `pat-${100 + this.state.patients.length + 1}`;
    const uhid = `AYUR-2026-${String(890 + this.state.patients.length + 1).padStart(4, '0')}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newPatient = {
      id: newId,
      uhid,
      name: formData.name || formData.full_name || 'Demo Patient',
      dob: formData.dob || formData.date_of_birth || '1990-01-01',
      age: formData.age ? Number(formData.age) : 34,
      gender: formData.gender || 'Female',
      phone: formData.phone || '+91 98000 00000',
      email: formData.email || '',
      address: formData.address || 'Bengaluru, Karnataka',
      emergencyContact: formData.emergencyContact || '',
      occupation: formData.occupation || 'Professional',
      preferredLanguage: formData.preferredLanguage || formData.preferred_language || 'en',
      tokenNumber,
      tokenStatus: 'waiting',
      queuePosition: this.state.patients.filter((p) => p.tokenStatus === 'waiting').length + 1,
      estimatedWaitMins: (this.state.patients.filter((p) => p.tokenStatus === 'waiting').length + 1) * 10,
      priority: 'Normal',
      registrationTime: timeStr,
      assignedDoctorId: 'doc-1',
      assignedDoctorName: 'Vaidya Dr. K. Rajesh Sharma',
      assignedDepartment: 'Kayachikitsa (Internal Medicine)',
      assignedRoom: 'OPD-102',
      chiefComplaint: formData.chiefComplaint || 'General Ayurvedic Consultation',
      duration: formData.duration || '1 month',
      vitals: {
        pulse: formData.pulse ? Number(formData.pulse) : 76,
        bp: formData.bp || '120/80',
        weight: formData.weight ? Number(formData.weight) : 65,
        height: formData.height ? Number(formData.height) : 165,
        bmi: formData.bmi || '23.8',
        temperature: formData.temperature || '98.4 F',
      },
      prakriti: {
        primary: 'Pitta-Vata',
        vata: 40,
        pitta: 45,
        kapha: 15,
        vikriti: 'Pitta Shamana in progress',
      },
      caseIntake: {
        primaryCategory: 'gastrointestinal',
        chiefComplaint: formData.chiefComplaint || 'General Ayurvedic Consultation',
        duration: formData.duration || '1 month',
        severity: 5,
        appetite: 'Sama Agni',
        bowel: 'Madhyama Koshtha',
        sleep: 'Moderate',
      },
      medicalHistory: {
        pastIllnesses: 'None reported',
        surgeries: 'None',
        allergies: 'No known drug allergies',
        currentMedicines: 'None',
        familyHistory: 'Non-contributory',
        habits: 'Non-smoker',
      },
      ashtavidhaAssessment: {
        nadi: 'Manduka Gati (76 bpm)',
        jihwa: 'Niramata (Clear)',
        mutra: 'Prakruta',
        mala: 'Prakruta',
        shabda: 'Spashta',
        sparsha: 'Sama Ushna',
        drik: 'Prakruta',
        akriti: 'Madhyama',
      },
      documents: [],
      redFlags: [],
      prescriptions: [],
    };

    this.state.patients.unshift(newPatient);
    this.saveState();
    return newPatient;
  }

  async updatePatientCase(id, updateFields) {
    const patient = await this.getPatientById(id);
    if (patient) {
      Object.assign(patient, updateFields);
      if (updateFields.caseIntake) {
        patient.caseIntake = { ...patient.caseIntake, ...updateFields.caseIntake };
      }
      if (updateFields.prakriti) {
        patient.prakriti = { ...patient.prakriti, ...updateFields.prakriti };
      }
      this.saveState();
      return patient;
    }
    return { id, ...updateFields };
  }

  async updatePatientStatus(patientId, newStatus) {
    const patient = await this.getPatientById(patientId);
    if (patient) {
      let statusKey = newStatus.toLowerCase();
      if (statusKey === 'with doctor') statusKey = 'in_consultation';
      if (statusKey === 'case ready') statusKey = 'waiting';
      patient.tokenStatus = statusKey;
      this.saveState();
      return patient;
    }
    return null;
  }

  async updatePatientPriority(patientId, newPriority) {
    const patient = await this.getPatientById(patientId);
    if (patient) {
      patient.priority = newPriority;
      this.saveState();
      return patient;
    }
    return null;
  }

  async callNextPatient(doctorId = 'doc-1') {
    const nextPatient = this.state.patients.find(
      (p) => p.tokenStatus === 'waiting' || p.tokenStatus === 'assessment'
    );
    if (nextPatient) {
      // Move any current in_consultation patient to completed
      this.state.patients.forEach((p) => {
        if (p.tokenStatus === 'in_consultation') {
          p.tokenStatus = 'completed';
        }
      });
      nextPatient.tokenStatus = 'in_consultation';
      nextPatient.assignedDoctorId = doctorId;
      this.saveState();
      return nextPatient;
    }
    return null;
  }

  // ----------------------------------------------------
  // DOCUMENTS & OCR
  // ----------------------------------------------------
  async addDocument(patientId, docInfo) {
    const patient = await this.getPatientById(patientId);
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: docInfo.name || 'Clinical_Document.pdf',
      type: docInfo.type || 'labReport',
      date: new Date().toISOString().split('T')[0],
      size: docInfo.size || '1.4 MB',
      status: 'Indexed & Processed',
      extractedData: docInfo.extractedData || 'Demo OCR result: Parameters verified within normal clinical range.',
    };
    if (patient) {
      if (!patient.documents) patient.documents = [];
      patient.documents.unshift(newDoc);
      this.saveState();
    }
    return newDoc;
  }

  async deleteDocument(patientId, docId) {
    const patient = await this.getPatientById(patientId);
    if (patient && patient.documents) {
      patient.documents = patient.documents.filter((d) => d.id !== docId && String(d.id) !== String(docId));
      this.saveState();
      return true;
    }
    return true;
  }

  // ----------------------------------------------------
  // DOCTORS & STAFF
  // ----------------------------------------------------
  async getDoctors() {
    return [...this.state.doctors];
  }

  async toggleDoctorStatus(docId) {
    const doctor = this.state.doctors.find((d) => d.id === docId);
    if (doctor) {
      doctor.status = doctor.status === 'On Duty' ? 'On Break' : 'On Duty';
      this.saveState();
      return doctor;
    }
    return null;
  }

  async getStaff() {
    return [...this.state.staff];
  }

  async toggleStaffStatus(staffId) {
    const member = this.state.staff.find((s) => s.id === staffId);
    if (member) {
      member.status = member.status === 'Active' ? 'On Leave' : 'Active';
      this.saveState();
      return member;
    }
    return null;
  }

  // ----------------------------------------------------
  // PRESCRIPTIONS & FORMULATIONS
  // ----------------------------------------------------
  async getFormulations() {
    return [...this.state.formulations];
  }

  async getPathyaGuidelines(dosha = 'pitta') {
    const key = dosha.toLowerCase();
    return this.state.pathyaApathya[key] || this.state.pathyaApathya.pitta;
  }

  async savePrescription(patientId, rxData) {
    const patient = await this.getPatientById(patientId);
    const newRx = {
      id: `rx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Finalized',
      diagnosis: rxData.diagnosis || patient?.chiefComplaint || 'Classical Ayurvedic Prescription',
      instructions: rxData.instructions || rxData.viharaAdvice || null,
      pathya_rules: rxData.pathyaRules || rxData.pathya_rules || null,
      apathya_rules: rxData.apathyaRules || rxData.apathya_rules || null,
      follow_up_date: rxData.followUpDate || rxData.follow_up_date || '2026-09-21',
      issuedBy: rxData.issuedBy || 'Vaidya Dr. K. Rajesh Sharma',
      items: (rxData.medicines || rxData.items || []).map((m) => ({
        medicine_name: m.drugName || m.name || m.medicine_name,
        form: m.form || m.type || 'Churna',
        dosage: m.dosage || m.dose || '3g',
        frequency: m.frequency || 'Twice daily (BD)',
        timing: m.timing || 'Abhakta (Before food)',
        anupana: m.anupana || 'Lukewarm water',
        duration: m.duration || '15 Days',
        instructions: m.instructions || '',
      })),
    };

    if (patient) {
      if (!patient.prescriptions) patient.prescriptions = [];
      patient.prescriptions.unshift(newRx);
      patient.tokenStatus = 'completed';
      if (rxData.followUpDate) {
        patient.followUp = {
          nextDate: rxData.followUpDate,
          timeSlot: '10:30 AM',
          interval: '14 Days',
          status: 'Scheduled',
          reason: 'Review treatment response and evaluate symptom resolution.',
        };
      }
      this.saveState();
    }
    return newRx;
  }

  // ----------------------------------------------------
  // FOLLOW-UPS & NOTIFICATIONS
  // ----------------------------------------------------
  async getNotifications() {
    return [...this.state.notifications];
  }

  async markNotificationRead(id) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveState();
      return notif;
    }
    return null;
  }

  // ----------------------------------------------------
  // ANALYTICS
  // ----------------------------------------------------
  async getAnalytics() {
    const totalPatients = this.state.patients.length;
    const waitingPatients = this.state.patients.filter((p) => p.tokenStatus === 'waiting').length;
    const inConsultation = this.state.patients.filter((p) => p.tokenStatus === 'in_consultation').length;
    const completed = this.state.patients.filter((p) => p.tokenStatus === 'completed').length;
    const redFlags = this.state.patients.filter(
      (p) => p.priority === 'Potential Red Flag — Review Required' || p.priority === 'Priority Validated'
    ).length;

    return {
      todayFootfall: totalPatients + 16,
      totalPatients: totalPatients + 120,
      activeInQueue: waitingPatients + inConsultation,
      waitingPatients,
      inConsultation,
      completedConsultations: completed + 16,
      redFlagsCount: redFlags,
      avgConsultationMinutes: 13.4,
      avgWaitMinutes: 17.2,
      patientSatisfaction: '96.4%',
      doshaDistribution: DEMO_ANALYTICS.doshaDistribution,
      topConditions: DEMO_ANALYTICS.topConditions,
      hourlyFlow: DEMO_ANALYTICS.hourlyFlow,
    };
  }
}

export const demoStore = new DemoStore();
export default demoStore;
