import api from './api';

export const authService = {
  // Inscription
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Connexion
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Récupérer profil
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Mettre à jour profil
  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Vérifier si connecté
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Récupérer user courant
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};