import api from './api';

export const postService = {
  // Créer un post
  async createPost(postData) {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Récupérer tous les posts
  async getAllPosts(page = 1, limit = 10) {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Récupérer posts d'un utilisateur
  async getUserPosts(userId, page = 1, limit = 10) {
    const response = await api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Récupérer un post spécifique
  async getPostById(postId) {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  // Mettre à jour un post
  async updatePost(postId, postData) {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },

  // Supprimer un post
  async deletePost(postId) {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // Like/Unlike un post
  async toggleLike(postId) {
    const response = await api.post(`/likes/post/${postId}`);
    return response.data;
  },

  // Vérifier si liké
  async checkLike(postId) {
    const response = await api.get(`/likes/post/${postId}/check`);
    return response.data;
  }
};