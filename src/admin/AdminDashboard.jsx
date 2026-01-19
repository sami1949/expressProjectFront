import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';
import './AdminDashboard.css';
import Statistics from './Statistics';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // Charger les activités récentes
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      console.log('Chargement des activités récentes...');
      // Appeler l'API pour obtenir les vraies activités récentes
      const response = await api.get('/auth/recent-activity');
      console.log('Réponse de l\'API:', response.data);
      
      if (response.data.success && response.data.data) {
        console.log('Activités reçues:', response.data.data);
        setRecentActivity(response.data.data);
      } else {
        // Données par défaut si la réponse est vide
        console.log('Aucune activité reçue, utilisant données par défaut');
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité:', error);
      console.error('Détails de l\'erreur:', error.response?.data || error.message);
      
      // Afficher un message d'erreur plus détaillé
      let errorMessage = 'Erreur de chargement des activités';
      if (error.response?.status === 403) {
        errorMessage = 'Accès refusé : vous devez être administrateur';
      } else if (error.response?.status === 401) {
        errorMessage = 'Non autorisé : veuillez vous reconnecter';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur : veuillez réessayer plus tard';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Problème de connexion réseau';
      }
      
      setError(errorMessage);
      
      // Utiliser des données de démonstration en cas d'erreur serveur
      if (error.response?.status === 500) {
        console.log('Utilisation de données de démonstration...');
        setRecentActivity([
          {
            id: 'demo-1',
            type: 'user',
            message: 'Nouvel utilisateur enregistré',
            user: 'Jean Dupont',
            time: new Date().toLocaleString('fr-FR'),
            timestamp: new Date()
          },
          {
            id: 'demo-2',
            type: 'post',
            message: 'Nouvelle publication créée',
            user: 'Marie Curie',
            time: new Date(Date.now() - 3600000).toLocaleString('fr-FR'),
            timestamp: new Date(Date.now() - 3600000)
          },
          {
            id: 'demo-3',
            type: 'comment',
            message: 'Nouveau commentaire ajouté',
            user: 'Pierre Martin',
            time: new Date(Date.now() - 7200000).toLocaleString('fr-FR'),
            timestamp: new Date(Date.now() - 7200000)
          },
          {
            id: 'demo-4',
            type: 'like',
            message: 'Nouveau like ajouté',
            user: 'Sophie Laurent',
            time: new Date(Date.now() - 10800000).toLocaleString('fr-FR'),
            timestamp: new Date(Date.now() - 10800000)
          },
          {
            id: 'demo-5',
            type: 'follow',
            message: 'Nouveau suivi effectué',
            user: 'Thomas Bernard',
            time: new Date(Date.now() - 14400000).toLocaleString('fr-FR'),
            timestamp: new Date(Date.now() - 14400000)
          }
        ]);
      } else {
        setRecentActivity([]);
      }
    } finally {
      setLoading(false);
      console.log('Fin du chargement, loading = false');
    }
  };

  const refreshData = async () => {
    console.log('Actualisation des données...');
    setLoading(true);
    setError(null);
    await loadRecentActivity();
  };

  // Fonction pour obtenir l'icône en fonction du type d'activité
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return '👤';
      case 'post': return '📝';
      case 'comment': return '💬';
      case 'report': return '⚠️';
      case 'like': return '👍';
      case 'share': return '🔄';
      case 'follow': return '👥';
      default: return 'ℹ️';
    }
  };

  // Fonction pour obtenir la couleur en fonction du type d'activité
  const getActivityColor = (type) => {
    switch (type) {
      case 'user': return 'activity-item--user';
      case 'post': return 'activity-item--post';
      case 'comment': return 'activity-item--comment';
      case 'report': return 'activity-item--report';
      case 'like': return 'activity-item--like';
      case 'share': return 'activity-item--share';
      case 'follow': return 'activity-item--follow';
      default: return '';
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
          <button 
            className="admin-refresh-btn"
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? '🔄 Chargement...' : '🔄 Actualiser'}
          </button>
          {error && (
            <div className="admin-error-message">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Section des statistiques (dans un composant séparé) */}
      <div className="admin-dashboard__statistics">
        <Statistics />
      </div>

      <div className="admin-dashboard__main">
        <div className="admin-dashboard__activity">
          <div className="admin-card">
            <div className="admin-card__header">
              <h5 className="admin-card__title">📊 Activité récente</h5>
            </div>
            <div className="admin-card__body">
              {loading ? (
                <div className="activity-loading">Chargement de l'activité...</div>
              ) : error ? (
                <div className="activity-error">
                  <p>Impossible de charger les activités récentes</p>
                  <button 
                    className="activity-retry-btn"
                    onClick={refreshData}
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <div className="activity-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map(activity => (
                      <div 
                        key={activity.id || activity._id} 
                        className={`activity-item ${getActivityColor(activity.type)}`}
                      >
                        <div className="activity-item__icon">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-item__content">
                          <p className="activity-item__message">{activity.message || activity.description}</p>
                          <p className="activity-item__user">{activity.user || activity.username || 'System'}</p>
                        </div>
                        <div className="activity-item__time">
                          {activity.time || activity.createdAt || activity.timestamp || 'Récemment'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="activity-empty">Aucune activité récente</div>
                  )}
                </div>
              )}
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
                <button 
                  className="admin-quick-btn admin-quick-btn--primary"
                  onClick={refreshData}
                >
                  Actualiser les données
                </button>
                <button className="admin-quick-btn admin-quick-btn--secondary">
                  Gérer les utilisateurs
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