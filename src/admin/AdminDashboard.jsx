import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    activeUsers: 0
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // Charger les statistiques admin
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const response = await api.get('/auth/admin-only');
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      } else {
        // Données par défaut si la réponse est vide
        setStats({
          totalUsers: 0,
          totalPosts: 0,
          totalComments: 0,
          activeUsers: 0
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Données par défaut en cas d'erreur
      setStats({
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        activeUsers: 0
      });
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div className="admin-welcome-card">
          <h2 className="admin-welcome-card__title">
            👋 Bienvenue, {user?.prenom} {user?.nom}!
          </h2>
          <p className="admin-welcome-card__subtitle">
            Panel d'administration - Gestion complète de la plateforme
          </p>
        </div>
      </div>

      <div className="admin-dashboard__stats">
        <div className="admin-stat-card admin-stat-card--users">
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__info">
              <p className="admin-stat-card__label">Utilisateurs</p>
              <h5 className="admin-stat-card__value">{stats.totalUsers}</h5>
            </div>
            <div className="admin-stat-card__icon">👥</div>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-card--posts">
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__info">
              <p className="admin-stat-card__label">Publications</p>
              <h5 className="admin-stat-card__value">{stats.totalPosts}</h5>
            </div>
            <div className="admin-stat-card__icon">📝</div>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-card--comments">
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__info">
              <p className="admin-stat-card__label">Commentaires</p>
              <h5 className="admin-stat-card__value">{stats.totalComments}</h5>
            </div>
            <div className="admin-stat-card__icon">💬</div>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-card--active">
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__info">
              <p className="admin-stat-card__label">Actifs (24h)</p>
              <h5 className="admin-stat-card__value">{stats.activeUsers}</h5>
            </div>
            <div className="admin-stat-card__icon">⚡</div>
          </div>
        </div>
      </div>

      <div className="admin-dashboard__main">
        <div className="admin-dashboard__activity">
          <div className="admin-card">
            <div className="admin-card__header">
              <h5 className="admin-card__title">📊 Activité récente</h5>
            </div>
            <div className="admin-card__body">
              <p className="admin-card__placeholder">
                Graphique d'activité en cours de développement...
              </p>
            </div>
          </div>
        </div>

        <div className="admin-dashboard__actions">
          <div className="admin-card">
            <div className="admin-card__header">
              <h5 className="admin-card__title">⚡ Actions rapides</h5>
            </div>
            <div className="admin-card__body">
              <div className="admin-quick-actions">
                <button className="admin-quick-btn admin-quick-btn--primary">
                  Gérer les utilisateurs
                </button>
                <button className="admin-quick-btn admin-quick-btn--secondary">
                  Modérer les publications
                </button>
                <button className="admin-quick-btn admin-quick-btn--info">
                  Voir les rapports
                </button>
                <button className="admin-quick-btn admin-quick-btn--warning">
                  Paramètres système
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;