import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';
import './Statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    activeUsers: 0,
    totalReactions: 0,
    totalLikes: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    newUsersToday: 0,
    newPostsToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appeler l'API pour obtenir les vraies statistiques
      const response = await api.get('/auth/admin-stats');
      
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      } else {
        // Données par défaut si la réponse est vide
        setStats({
          totalUsers: 0,
          totalPosts: 0,
          totalComments: 0,
          activeUsers: 0,
          totalReactions: 0,
          totalLikes: 0,
          totalFollowers: 0,
          totalFollowing: 0,
          newUsersToday: 0,
          newPostsToday: 0
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError('Erreur de chargement des statistiques');
      
      // Données par défaut en cas d'erreur
      setStats({
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        activeUsers: 0,
        totalReactions: 0,
        totalLikes: 0,
        totalFollowers: 0,
        totalFollowing: 0,
        newUsersToday: 0,
        newPostsToday: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater les nombres
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="statistics">
      {error && (
        <div className="statistics__error">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="statistics__loading">
          Chargement des statistiques...
        </div>
      ) : (
        <div className="statistics__grid">
          <div className="stat-card stat-card--users">
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Utilisateurs</p>
                <h5 className="stat-card__value">{formatNumber(stats.totalUsers)}</h5>
                <p className="stat-card__change">+{formatNumber(stats.newUsersToday)} aujourd'hui</p>
              </div>
              <div className="stat-card__icon">👥</div>
            </div>
          </div>

          <div className="stat-card stat-card--posts">
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Publications</p>
                <h5 className="stat-card__value">{formatNumber(stats.totalPosts)}</h5>
                <p className="stat-card__change">+{formatNumber(stats.newPostsToday)} aujourd'hui</p>
              </div>
              <div className="stat-card__icon">📝</div>
            </div>
          </div>

          <div className="stat-card stat-card--comments">
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Commentaires</p>
                <h5 className="stat-card__value">{formatNumber(stats.totalComments)}</h5>
                <p className="stat-card__change">+{formatNumber(stats.totalReactions || 0)} réactions</p>
              </div>
              <div className="stat-card__icon">💬</div>
            </div>
          </div>

          <div className="stat-card stat-card--active">
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Actifs (24h)</p>
                <h5 className="stat-card__value">{formatNumber(stats.activeUsers)}</h5>
                <p className="stat-card__change">en ligne maintenant</p>
              </div>
              <div className="stat-card__icon">⚡</div>
            </div>
          </div>

          <div className="stat-card stat-card--likes">
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">J'aime</p>
                <h5 className="stat-card__value">{formatNumber(stats.totalLikes)}</h5>
                <p className="stat-card__change">total</p>
              </div>
              <div className="stat-card__icon">👍</div>
            </div>
          </div>

          <div className="stat-card stat-card--followers">
            <div className="stat-card__content">
              <div className="stat-card__info">
                <p className="stat-card__label">Abonnés</p>
                <h5 className="stat-card__value">{formatNumber(stats.totalFollowers)}</h5>
                <p className="stat-card__change">total</p>
              </div>
              <div className="stat-card__icon">👥</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;