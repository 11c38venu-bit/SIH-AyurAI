import apiClient from './apiClient';

export const prescriptionApi = {
  async getMedicines(params = {}) {
    const response = await apiClient.get('/medicines/', { params });
    return response.data;
  },

  async getMedicine(medicineId) {
    const response = await apiClient.get(`/medicines/${medicineId}`);
    return response.data;
  },

  async createPrescription(prescriptionData) {
    const response = await apiClient.post('/prescriptions/', prescriptionData);
    return response.data;
  },

  async getPrescription(prescriptionId) {
    const response = await apiClient.get(`/prescriptions/${prescriptionId}`);
    return response.data;
  },

  async getPatientPrescriptions(patientId) {
    const response = await apiClient.get(`/prescriptions/patient/${patientId}`);
    return response.data;
  },

  async updatePrescription(prescriptionId, updateData) {
    const response = await apiClient.patch(`/prescriptions/${prescriptionId}`, updateData);
    return response.data;
  },

  async finalizePrescription(prescriptionId) {
    const response = await apiClient.post(`/prescriptions/${prescriptionId}/finalize`);
    return response.data;
  },

  async cancelPrescription(prescriptionId, cancellationReason) {
    const response = await apiClient.post(`/prescriptions/${prescriptionId}/cancel`, {
      cancellation_reason: cancellationReason,
    });
    return response.data;
  },
};

export default prescriptionApi;
