import api from './api';

export const messageService = {
  // Send a message
  async sendMessage(receiverId, contenu) {
    const response = await api.post('/messages', {
      id_destinataire: receiverId,
      contenu
    });
    return response.data;
  },

  // Get all conversations
  async getConversations() {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // Get messages in a conversation
  async getConversationMessages(userId, page = 1, limit = 50) {
    const response = await api.get(`/messages/conversation/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Mark message as read
  async markAsRead(messageId) {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  // Delete a message
  async deleteMessage(messageId) {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  // Get unread message count
  async getUnreadCount() {
    const response = await api.get('/messages/unread/count');
    return response.data;
  }
};
