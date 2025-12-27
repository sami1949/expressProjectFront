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
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      // If there's an error, ensure we clean up any partial auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Initier l'inscription avec vérification email
  async initiateRegistration(userData) {
    try {
      const response = await api.post('/auth/initiate-registration', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vérifier le code d'inscription
  async verifyRegistrationCode(email, verificationCode) {
    try {
      const response = await api.post('/auth/verify-registration-code', { email, verificationCode });
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      // If there's an error, ensure we clean up any partial auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Connexion
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      // If there's an error, ensure we clean up any partial auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/connexion';
  },

  // Mot de passe oublié
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Réinitialiser le mot de passe
  async resetPassword(resetToken, password) {
    try {
      const response = await api.put(`/auth/reset-password/${resetToken}`, { password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Changer le mot de passe
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/auth/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer profil
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Mettre à jour profil
  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    // Update user data in localStorage after successful update
    if (response.data.success) {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
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
  },
  
  // Refresh token
  async refreshToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        this.logout();
        return false;
      }
      
      // Call the refresh token endpoint
      const response = await api.post('/auth/refresh-token');
      
      if (response.data.success && response.data.data.token) {
        // Update the token in localStorage
        localStorage.setItem('token', response.data.data.token);
        return true;
      } else {
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  },
  
  // Check if token is expired
  isTokenExpired() {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return expiry <= now;
    } catch (error) {
      return true;
    }
  },
  
  // Google Authentication
  async googleAuth(credential) {
    try {
      const response = await api.post('/auth/google-auth', { credential });
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      // If there's an error, ensure we clean up any partial auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }
};