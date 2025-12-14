import api from './api';

const getNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  try {
    const response = await api.get('/notifications', {
      params: { page, limit, unread: unreadOnly }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
};

const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
    throw error;
  }
};

const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error);
    throw error;
  }
};

const markAllAsRead = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications:', error);
    throw error;
  }
};

const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    throw error;
  }
};

const deleteAllRead = async () => {
  try {
    const response = await api.delete('/notifications/read/all');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression des notifications lues:', error);
    throw error;
  }
};

export const notificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead
};