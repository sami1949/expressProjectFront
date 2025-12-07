import axios from 'axios';
import api from './api';

// Create a separate instance for file uploads
const apiUpload = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add interceptor for file upload requests
apiUpload.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for file uploads - let browser set it with boundary
    delete config.headers['Content-Type'];
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add interceptor for responses
apiUpload.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

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