import apiClient from './apiClient';

export const patientApi = {
  async getPatients({ skip = 0, limit = 50, search = '' } = {}) {
    const params = { skip, limit };
    if (search) params.search = search;
    const response = await apiClient.get('/patients/', { params });
    return response.data;
  },

  async getPatientById(id) {
    const response = await apiClient.get(`/patients/${id}`);
    return response.data;
  },

  async createPatient(patientData) {
    const payload = {
      full_name: patientData.full_name || patientData.name || 'Anonymous Patient',
      date_of_birth: patientData.date_of_birth || patientData.dob || null,
      gender: patientData.gender || 'Other',
      phone: patientData.phone || patientData.contact_number || null,
      email: patientData.email && patientData.email.includes('@') ? patientData.email : null,
      preferred_language: patientData.preferred_language || patientData.preferredLanguage || 'en',
    };
    const response = await apiClient.post('/patients/', payload);
    return response.data;
  },

  async updatePatient(id, patientData) {
    const response = await apiClient.put(`/patients/${id}`, patientData);
    return response.data;
  },
};

export default patientApi;
