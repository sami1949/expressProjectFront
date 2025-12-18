import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { notificationService } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageContext';
import './Notifications.css';

const Notifications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' ou 'unread'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === 'unread';
      const response = await notificationService.getNotifications(page, 20, unreadOnly);
      
      if (response.success) {
        if (page === 1) {
          setNotifications(response.data);
        } else {
          setNotifications(prev => [...prev, ...response.data]);
        }
        setHasMore(response.pagination.page < response.pagination.pages);
      }
    } catch (error) {
      console.error(t('errorLoadingNotifications'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, lue: true } : notif
        )
      );
    } catch (error) {
      console.error(t('errorMarkingAsRead'), error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, lue: true }))
      );
    } catch (error) {
      console.error(t('errorMarkingAllAsRead'), error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error(t('errorDeletingNotification'), error);
    }
  };

  const handleDeleteAllRead = async () => {
    if (!window.confirm(t('confirmDeleteReadNotifications'))) {
      return;
    }
    
    try {
      await notificationService.deleteAllRead();
      setNotifications(prev => prev.filter(notif => !notif.lue));
    } catch (error) {
      console.error(t('errorDeletingReadNotifications'), error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Marquer comme lue si non lue
    if (!notification.lue) {
      handleMarkAsRead(notification._id);
    }

    // Rediriger selon le type de notification
    switch (notification.type) {
      case 'message':
        // Redirection vers la conversation avec l'utilisateur
        navigate(`/messages?user=${notification.id_declencheur}`);
        break;
        
      case 'demande_ami':
      case 'ami_accepte':
        // Redirection vers le profil de l'utilisateur
        navigate(`/profil/${notification.id_declencheur}`);
        break;
        
      case 'jaime':
        // Redirection vers le post qui a été aimé
        if (notification.reference_id) {
          navigate(`/posts/${notification.reference_id}`);
        } else {
          navigate('/');
        }
        break;
        
      case 'commentaire':
        // Redirection vers le post avec le commentaire
        if (notification.reference_id) {
          navigate(`/posts/${notification.reference_id}`);
        } else {
          navigate('/');
        }
        break;
        
      case 'partage':
        // Redirection vers le post partagé
        if (notification.reference_id) {
          navigate(`/posts/${notification.reference_id}`);
        } else {
          navigate('/');
        }
        break;
        
      case 'mention':
        // Redirection vers le post où l'utilisateur est mentionné
        if (notification.reference_id) {
          navigate(`/posts/${notification.reference_id}`);
        } else {
          navigate('/');
        }
        break;
        
      default:
        // Par défaut, rediriger vers le profil de l'utilisateur déclencheur
        navigate(`/profil/${notification.id_declencheur}`);
        break;
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      demande_ami: '👥',
      ami_accepte: '✅',
      commentaire: '💬',
      jaime: '❤️',
      mention: '@',
      message: '✉️',
      partage: '🔄'
    };
    return icons[type] || '🔔';
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);

    if (diffInSeconds < 60) return t('justNow');
    if (diffInSeconds < 3600) return t('minutesAgoShort').replace('{minutes}', Math.floor(diffInSeconds / 60));
    if (diffInSeconds < 86400) return t('hoursAgoShort').replace('{hours}', Math.floor(diffInSeconds / 3600));
    if (diffInSeconds < 604800) return t('daysAgoShort').replace('{days}', Math.floor(diffInSeconds / 86400));
    
    return notifDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const unreadCount = notifications.filter(n => !n.lue).length;

  return (
    <div className="app-layout">
      <Navbar />
      
      <div className="accueil-container">
        <Sidebar />
        
        <main className="main-content">
          <div className="notifications-container">
            <div className="notifications-header">
              <h1>{t('notifications')}</h1>
              <div className="notifications-actions">
                <button 
                  onClick={handleMarkAllAsRead}
                  className="btn-secondary"
                  disabled={unreadCount === 0}
                >
                  {t('markAllAsRead')}
                </button>
                <button 
                  onClick={handleDeleteAllRead}
                  className="btn-danger"
                >
                  {t('deleteRead')}
                </button>
              </div>
            </div>

            <div className="notifications-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setFilter('all');
                  setPage(1);
                }}
              >
                {t('all')}
              </button>
              <button 
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => {
                  setFilter('unread');
                  setPage(1);
                }}
              >
                {t('unread')} ({unreadCount})
              </button>
            </div>

            <div className="notifications-list">
              {loading && page === 1 ? (
                <div className="loading">{t('loading')}</div>
              ) : notifications.length === 0 ? (
                <div className="no-notifications">
                  <span className="no-notif-icon">🔔</span>
                  <p>{t('noNotifications')}</p>
                </div>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <div 
                      key={notification._id}
                      className={`notification-item ${!notification.lue ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-avatar">
                        <img 
                          src={notification.declencheur?.photo || '/default-avatar.jpg'} 
                          alt={notification.declencheur?.prenom}
                        />
                      </div>
                      <div className="notification-content">
                        <p className="notification-text">
                          <strong>
                            {notification.declencheur?.prenom} {notification.declencheur?.nom}
                          </strong>
                          {' '}
                          {notification.contenu}
                        </p>
                        <span className="notification-time">
                          {formatDate(notification.date_creation)}
                        </span>
                      </div>
                      <button 
                        className="notification-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification._id);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {hasMore && (
                    <button 
                      className="load-more-btn"
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={loading}
                    >
                      {loading ? t('loading') : t('loadMore')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;