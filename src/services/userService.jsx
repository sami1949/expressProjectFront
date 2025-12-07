import api from './api';

export const userService = {
  // Get all users (admin only)
  async getAllUsers(page = 1, limit = 20) {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search users
  async searchUsers(query, role = '') {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (role) params.append('role', role);
    
    const response = await api.get(`/users/search?${params.toString()}`);
    return response.data;
  },

  // Get user by ID
  async getUserById(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user
  async updateUser(userId, userData) {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user (admin only)
  async deleteUser(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
};
