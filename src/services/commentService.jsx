import api from './api';

export const commentService = {
  // Create a comment on a post
  async createComment(postId, contenu) {
    const response = await api.post(`/comments/post/${postId}`, { contenu });
    return response.data;
  },

  // Get comments for a specific post
  async getPostComments(postId, page = 1, limit = 20) {
    const response = await api.get(`/comments/post/${postId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Update a comment
  async updateComment(commentId, contenu) {
    const response = await api.put(`/comments/${commentId}`, { contenu });
    return response.data;
  },

  // Delete a comment
  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};
