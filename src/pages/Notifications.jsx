import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { notificationService } from '../services/notificationService';
import './Notifications.css';

const Notifications = () => {
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
      console.error('Erreur lors du chargement des notifications:', error);
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
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, lue: true }))
      );
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleDeleteAllRead = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer toutes les notifications lues ?')) {
      return;
    }
    
    try {
      await notificationService.deleteAllRead();
      setNotifications(prev => prev.filter(notif => !notif.lue));
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications lues:', error);
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

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    
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
              <h1>Notifications</h1>
              <div className="notifications-actions">
                <button 
                  onClick={handleMarkAllAsRead}
                  className="btn-secondary"
                  disabled={unreadCount === 0}
                >
                  Tout marquer comme lu
                </button>
                <button 
                  onClick={handleDeleteAllRead}
                  className="btn-danger"
                >
                  Supprimer les lues
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
                Toutes
              </button>
              <button 
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => {
                  setFilter('unread');
                  setPage(1);
                }}
              >
                Non lues ({unreadCount})
              </button>
            </div>

            <div className="notifications-list">
              {loading && page === 1 ? (
                <div className="loading">Chargement...</div>
              ) : notifications.length === 0 ? (
                <div className="no-notifications">
                  <span className="no-notif-icon">🔔</span>
                  <p>Aucune notification</p>
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
                      {loading ? 'Chargement...' : 'Charger plus'}
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