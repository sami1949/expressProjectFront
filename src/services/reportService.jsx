import api from './api';

const reportService = {
  // Create a new report
  async createReport(reportData) {
    try {
      const response = await api.post('/reports', reportData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get reports for admin (if needed)
  async getReports() {
    try {
      const response = await api.get('/reports');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update report status (admin only)
  async updateReportStatus(reportId, status) {
    try {
      const response = await api.put(`/reports/${reportId}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get reports by user (if needed)
  async getUserReports(userId) {
    try {
      const response = await api.get(`/reports/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export { reportService };