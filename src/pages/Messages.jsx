import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { messageService } from '../services/messageService';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = authService.getCurrentUser();
  const [searchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');
  const pollingIntervalRef = useRef(null);
  const conversationsPollingRef = useRef(null);

  useEffect(() => {
    loadConversations();
    
    // Poll conversations every 10 seconds
    conversationsPollingRef.current = setInterval(() => {
      loadConversations();
    }, 10000); // 10 seconds
    
    return () => {
      if (conversationsPollingRef.current) {
        clearInterval(conversationsPollingRef.current);
      }
    };
  }, []);

  // Auto-select conversation if userId in URL
  useEffect(() => {
    if (userIdFromUrl && conversations.length === 0) {
      // If no existing conversations, load the user directly
      loadUserAndStartConversation(userIdFromUrl);
    } else if (userIdFromUrl && conversations.length > 0) {
      // Find conversation with this user
      const existingConv = conversations.find(
        conv => conv.autreUtilisateur?._id === userIdFromUrl
      );
      if (existingConv) {
        setSelectedConversation(existingConv.autreUtilisateur);
      } else {
        loadUserAndStartConversation(userIdFromUrl);
      }
    }
  }, [userIdFromUrl, conversations]);

  const loadUserAndStartConversation = async (userId) => {
    try {
      const response = await userService.getUserById(userId);
      if (response.success) {
        setSelectedConversation(response.data);
        // Try to load existing messages
        loadMessages(userId);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      toast.error('Impossible de charger l\'utilisateur');
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
      
      // Clear any existing polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Poll messages every 3 seconds when conversation is selected
      pollingIntervalRef.current = setInterval(() => {
        loadMessages(selectedConversation._id);
      }, 3000); // 3 seconds
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      if (!loading) {
        // Silent reload (don't show loading state)
        const response = await messageService.getConversations();
        
        if (response.success) {
          const transformedConversations = response.data.map(conv => ({
            _id: conv.userId,
            autreUtilisateur: {
              _id: conv.userId,
              nom: conv.user.nom,
              prenom: conv.user.prenom,
              photo: conv.user.photo,
              fullName: `${conv.user.prenom} ${conv.user.nom}`
            },
            dernierMessage: {
              contenu: conv.lastMessage.contenu,
              date_envoi: conv.lastMessage.date_envoi,
              lu: conv.lastMessage.lu
            },
            messagesNonLus: conv.unreadCount || 0
          }));
          
          setConversations(transformedConversations);
        }
      } else {
        // First load
        setLoading(true);
        console.log('Loading conversations...');
        const response = await messageService.getConversations();
        console.log('Conversations response:', response);
        
        if (response.success) {
          const transformedConversations = response.data.map(conv => ({
            _id: conv.userId,
            autreUtilisateur: {
              _id: conv.userId,
              nom: conv.user.nom,
              prenom: conv.user.prenom,
              photo: conv.user.photo,
              fullName: `${conv.user.prenom} ${conv.user.nom}`
            },
            dernierMessage: {
              contenu: conv.lastMessage.contenu,
              date_envoi: conv.lastMessage.date_envoi,
              lu: conv.lastMessage.lu
            },
            messagesNonLus: conv.unreadCount || 0
          }));
          
          console.log('Transformed conversations:', transformedConversations);
          setConversations(transformedConversations);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      console.error('Error details:', error.response?.data);
      if (loading) {
        toast.error('Erreur lors du chargement des conversations');
        setLoading(false);
      }
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await messageService.getConversationMessages(userId);
      
      if (response.success) {
        // Only update if messages changed (avoid unnecessary re-renders)
        const newMessagesJson = JSON.stringify(response.data.map(m => m._id));
        const currentMessagesJson = JSON.stringify(messages.map(m => m._id));
        
        if (newMessagesJson !== currentMessagesJson) {
          console.log('New messages detected, updating...');
          setMessages(response.data);
          
          // Mark messages as read
          response.data.forEach(msg => {
            const currentUserId = currentUser.id || currentUser._id;
            if (!msg.lu && msg.id_destinataire === currentUserId) {
              messageService.markAsRead(msg._id).catch(err => 
                console.error('Erreur marquage lu:', err)
              );
            }
          });
        }
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      console.error('Error details:', error.response?.data);
      // Don't show error if it's a new conversation with no messages yet
      if (error.response?.status !== 404) {
        // Only show error on first load, not on polling
        if (messages.length === 0) {
          toast.error('Erreur lors du chargement des messages');
        }
      }
      // For new conversations, just set empty messages
      if (messages.length === 0) {
        setMessages([]);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      console.log('Sending message to:', selectedConversation._id);
      console.log('Message content:', messageText.trim());
      
      const response = await messageService.sendMessage(
        selectedConversation._id,
        messageText.trim()
      );
      
      console.log('Send message response:', response);
      
      if (response.success) {
        setMessages([...messages, response.data]);
        setMessageText('');
        // Reload conversations immediately to update last message
        loadConversations();
        // Force reload messages to get the latest
        setTimeout(() => {
          loadMessages(selectedConversation._id);
        }, 500);
        toast.success('Message envoyé !');
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'A l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="messages-page">
      <Navbar />
      
      <div className="messages-container">
        <Sidebar />
        
        <main className="messages-content">
          <div className="messages-wrapper">
            {/* Conversations List */}
            <div className="conversations-list">
              <h2 className="conversations-title">Messages</h2>
              
              {loading ? (
                <p className="loading-text">Chargement...</p>
              ) : conversations.length === 0 ? (
                <p className="no-conversations">Aucune conversation</p>
              ) : (
                <div className="conversations">
                  {conversations.map(conv => {
                    const otherUser = conv.autreUtilisateur;
                    if (!otherUser) {
                      console.warn('Missing autreUtilisateur in conversation:', conv);
                      return null;
                    }
                    return (
                      <div
                        key={conv._id || otherUser._id}
                        className={`conversation-item ${
                          selectedConversation?._id === otherUser._id ? 'active' : ''
                        }`}
                        onClick={() => setSelectedConversation(otherUser)}
                      >
                        <img
                          src={otherUser.photo || 'https://via.placeholder.com/48?text=User'}
                          alt={otherUser.fullName || `${otherUser.prenom} ${otherUser.nom}`}
                          className="conversation-avatar"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/48?text=User';
                          }}
                        />
                        <div className="conversation-info">
                          <h4 className="conversation-name">
                            {otherUser.prenom} {otherUser.nom}
                          </h4>
                          <p className="conversation-last-message">
                            {conv.dernierMessage?.contenu || 'Aucun message'}
                          </p>
                        </div>
                        {conv.messagesNonLus > 0 && (
                          <span className="unread-badge">{conv.messagesNonLus}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="messages-area">
              {!selectedConversation ? (
                <div className="no-conversation-selected">
                  <p>Sélectionnez une conversation pour commencer</p>
                </div>
              ) : (
                <>
                  {/* Conversation Header */}
                  <div className="conversation-header">
                    <img
                      src={selectedConversation.photo || 'https://via.placeholder.com/48?text=User'}
                      alt={selectedConversation.fullName || `${selectedConversation.prenom} ${selectedConversation.nom}`}
                      className="header-avatar"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48?text=User';
                      }}
                    />
                    <div className="header-info">
                      <h3 className="header-name">
                        {selectedConversation.prenom} {selectedConversation.nom}
                      </h3>
                      {selectedConversation.bio && (
                        <p className="header-bio">{selectedConversation.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Messages List */}
                  <div className="messages-list">
                    {messages.length === 0 ? (
                      <div className="no-messages">
                        <p>Aucun message. Commencez la conversation!</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const currentUserId = currentUser.id || currentUser._id;
                        const isSent = msg.id_expediteur === currentUserId || msg.id_expediteur?._id === currentUserId;
                        return (
                          <div
                            key={msg._id}
                            className={`message-item ${
                              isSent ? 'sent' : 'received'
                            }`}
                          >
                            {!isSent && (
                              <img
                                src={selectedConversation.photo || 'https://via.placeholder.com/32?text=User'}
                                alt="Avatar"
                                className="message-avatar"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/32?text=User';
                                }}
                              />
                            )}
                            <div className="message-bubble">
                              <p className="message-text">{msg.contenu}</p>
                              <span className="message-time">
                                {formatTime(msg.date_envoi)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="message-input-form">
                    <input
                      type="text"
                      placeholder="Écrivez un message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="message-input"
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="send-btn"
                    >
                      {sending ? '⏳' : '➤'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;