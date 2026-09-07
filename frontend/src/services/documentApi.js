import apiClient from './apiClient';

export const documentApi = {
  async uploadDocument(formData) {
    // Axios automatically sets multipart/form-data boundary when passing FormData
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getPatientDocuments(patientId) {
    const response = await apiClient.get(`/documents/patient/${patientId}`);
    return response.data;
  },

  async getDocument(documentId) {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  },

  async deleteDocument(documentId) {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },

  async processDocument(documentId) {
    const response = await apiClient.post(`/document-processing/${documentId}/process`);
    return response.data;
  },

  async getExtractedData(documentId) {
    const response = await apiClient.get(`/document-processing/${documentId}/extracted`);
    return response.data;
  },

  async reviewExtractedData(documentId, reviewData) {
    const response = await apiClient.patch(`/document-processing/${documentId}/review`, reviewData);
    return response.data;
  },
};

export default documentApi;
