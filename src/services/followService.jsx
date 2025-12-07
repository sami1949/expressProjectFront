import api from './api';

export const followService = {
  // Follow/Unfollow a user
  async toggleFollow(userId) {
    const response = await api.post(`/follow/${userId}`);
    return response.data;
  },

  // Get user's followers
  async getFollowers(userId, page = 1, limit = 20) {
    const response = await api.get(`/follow/${userId}/followers?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get users that the user is following
  async getFollowing(userId, page = 1, limit = 20) {
    const response = await api.get(`/follow/${userId}/following?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Check follow status
  async checkFollowStatus(userId) {
    const response = await api.get(`/follow/${userId}/check`);
    return response.data;
  }
};
