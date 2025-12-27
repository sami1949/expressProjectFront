import api from './api';

export const blockService = {
  // Toggle block status for a user
  toggleBlock: async (userId) => {
    try {
      const response = await api.post(`/blocks/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error toggling block:', error);
      throw error;
    }
  },

  // Check if a user is blocked
  checkBlockStatus: async (userId) => {
    try {
      const response = await api.get(`/blocks/${userId}/check`);
      return response.data;
    } catch (error) {
      console.error('Error checking block status:', error);
      throw error;
    }
  },

  // Get list of blocked users
  getBlockedUsers: async () => {
    try {
      const response = await api.get('/blocks/blocked');
      return response.data;
    } catch (error) {
      console.error('Error getting blocked users:', error);
      throw error;
    }
  }
};