import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { messageService } from '../services/messageService';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useTheme } from '../contexts/ThemeContext';
import './Messages.css';

const Messages = () => {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showConversationsList, setShowConversationsList] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = authService.getCurrentUser();
  const [searchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');
  
  // Refs pour le polling et l'enregistrement audio
  const pollingIntervalRef = useRef(null);
  const conversationsPollingRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  
  const navigate = useNavigate();

  // Gérer la taille de l'écran
  const [isMobile, setIsMobile] = useState(() => {
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      
      // Sur desktop, toujours afficher la liste des conversations
      if (!newIsMobile) {
        setShowConversationsList(true);
      }
      
      // Forcer le recalcul du layout
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    // Écouter les changements d'orientation aussi
    const handleOrientationChange = () => {
      setTimeout(handleResize, 300);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Appel initial
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Charger les conversations
  useEffect(() => {
    loadConversations();
    
    // Polling pour les nouvelles conversations
    conversationsPollingRef.current = setInterval(() => {
      loadConversations();
    }, 10000);
    
    return () => {
      if (conversationsPollingRef.current) {
        clearInterval(conversationsPollingRef.current);
      }
      // Nettoyer le stream média
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Gérer l'URL avec userId
  useEffect(() => {
    if (userIdFromUrl) {
      const existingConv = conversations.find(
        conv => conv.autreUtilisateur?._id === userIdFromUrl
      );
      
      if (existingConv) {
        handleSelectConversation(existingConv.autreUtilisateur);
      } else {
        loadUserAndStartConversation(userIdFromUrl);
      }
    }
  }, [userIdFromUrl, conversations]);

  // Gérer la sélection automatique de la première conversation sur mobile
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation && !userIdFromUrl && isMobile) {
      // Sur mobile, afficher d'abord la liste
      setShowConversationsList(true);
    } else if (conversations.length > 0 && !selectedConversation && !isMobile) {
      // Sur desktop, sélectionner la première conversation
      handleSelectConversation(conversations[0].autreUtilisateur);
    }
  }, [conversations, selectedConversation, isMobile]);

  const loadUserAndStartConversation = async (userId) => {
    try {
      const response = await userService.getUserById(userId);
      if (response.success) {
        handleSelectConversation(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      toast.error(t('errorLoadingUser'));
    }
  };

  const handleSelectConversation = (user) => {
    setSelectedConversation(user);
    setShowConversationsList(false); // Fermer la liste sur mobile
    loadMessages(user._id);
  };

  // Charger les messages de la conversation
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
      
      // Polling pour les nouveaux messages
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Réduire la fréquence de polling sur mobile pour économiser la batterie
      const pollingInterval = isMobile ? 5000 : 3000;
      pollingIntervalRef.current = setInterval(() => {
        loadMessages(selectedConversation._id);
      }, pollingInterval);
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedConversation, isMobile]);

  // Scroller vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        // Pour mobile, utiliser un scroll instantané pour éviter les glitches
        if (isMobile) {
          messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
        } else {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, isMobile ? 50 : 100);
  };

  const loadConversations = useCallback(async () => {
    try {
      const response = await messageService.getConversations();
      
      if (response.success) {
        const transformedConversations = response.data.map(conv => ({
          _id: conv.userId,
          autreUtilisateur: {
            _id: conv.userId,
            nom: conv.user.nom,
            prenom: conv.user.prenom,
            photo: conv.user.photo,
            fullName: `${conv.user.prenom} ${conv.user.nom}`,
            bio: conv.user.bio || ''
          },
          dernierMessage: {
            contenu: conv.lastMessage?.contenu || '',
            image: conv.lastMessage?.image,
            audio: conv.lastMessage?.audio,
            date_envoi: conv.lastMessage?.date_envoi || new Date().toISOString(),
            lu: conv.lastMessage?.lu || false
          },
          messagesNonLus: conv.unreadCount || 0
        }));
        
        setConversations(transformedConversations);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      if (loading) {
        toast.error(t('errorLoadingConversations'));
      }
    } finally {
      setLoading(false);
    }
  }, [loading, t]);

  const loadMessages = async (userId) => {
    try {
      const response = await messageService.getConversationMessages(userId);
      
      if (response.success) {
        setMessages(response.data);
        
        // Marquer les messages comme lus
        response.data.forEach(msg => {
          const currentUserId = currentUser.id || currentUser._id;
          if (!msg.lu && msg.id_destinataire === currentUserId) {
            messageService.markAsRead(msg._id).catch(err => 
              console.error('Erreur marquage lu:', err)
            );
          }
        });
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      if (messages.length === 0) {
        toast.error(t('errorLoadingMessages'));
      }
    }
  };

  // Gestion des fichiers image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast.error(t('selectValidImage'));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('imageSizeLimit'));
        return;
      }
      
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestion des fichiers audio
  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('audio.*')) {
        toast.error(t('selectValidAudio'));
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('audioSizeLimit'));
        return;
      }
      
      setAudioFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAudioPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enregistrement audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      mediaStreamRef.current = stream;
      
      // Déterminer le type MIME supporté
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      }
      
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: mimeType });
          
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            setAudioPreview(base64data);
            setAudioFile(base64data);
            toast.success(t('audioRecordedSuccessfully'));
          };
          reader.readAsDataURL(audioBlob);
        }
        
        // Arrêter toutes les pistes
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
      };
      
      mediaRecorderRef.current = recorder;
      
      // Démarrer l'enregistrement
      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Démarrer le minuteur
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.info(t('recordingInProgress'), { autoClose: 1000 });
      
    } catch (error) {
      console.error('Erreur enregistrement audio:', error);
      if (error.name === 'NotAllowedError') {
        toast.error(t('microphonePermissionDenied'));
      } else {
        toast.error(t('cannotAccessMicrophone'));
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (recordingTime < 1) {
        toast.warning(t('recordingTooShort'));
        return;
      }
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioPreview(null);
      setAudioFile(null);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      toast.info(t('recordingCancelled'));
    }
  };

  // Supprimer les prévisualisations
  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAudio = () => {
    setAudioPreview(null);
    setAudioFile(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !imageFile && !audioFile) || !selectedConversation) return;

    try {
      setSending(true);
      
      let imageData = null;
      if (imageFile) {
        const reader = new FileReader();
        imageData = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(imageFile);
        });
      }
      
      let audioData = null;
      if (audioFile && !isRecording) {
        if (typeof audioFile === 'string' && audioFile.startsWith('data:audio')) {
          audioData = audioFile;
        } else {
          const reader = new FileReader();
          audioData = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(audioFile);
          });
        }
      }
      
      let response;
      if (imageFile && audioFile) {
        response = await messageService.sendMessageWithMedia(
          selectedConversation._id,
          messageText.trim(),
          imageData,
          audioData
        );
      } else if (imageFile) {
        response = await messageService.sendMessageWithImage(
          selectedConversation._id,
          messageText.trim(),
          imageData
        );
      } else if (audioFile) {
        response = await messageService.sendMessageWithAudio(
          selectedConversation._id,
          messageText.trim(),
          audioData
        );
      } else {
        response = await messageService.sendMessage(
          selectedConversation._id,
          messageText.trim()
        );
      }
      
      if (response.success) {
        setMessages([...messages, response.data]);
        setMessageText('');
        removeImage();
        removeAudio();
        loadConversations();
        toast.success(t('messageSent'));
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error(error.response?.data?.message || t('errorSendingMessage'));
    } finally {
      setSending(false);
    }
  };

  // Formater l'heure
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return t('minutesAgo').replace('{minutes}', minutes);
    if (hours < 24) return t('hoursAgo').replace('{hours}', hours);
    if (days < 7) return t('daysAgo').replace('{days}', days);
    return date.toLocaleDateString('fr-FR');
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Naviguer vers le profil
  const goToProfile = (userId) => {
    if (userId && userId !== currentUser?.id) {
      navigate(`/profil/${userId}`);
    } else if (userId === currentUser?.id) {
      navigate('/profil');
    }
  };

  return (
    <div className="messages-page">
      <Navbar />
      
      <div className="messages-container">
        {/* Header mobile */}
        {isMobile && (
          <div className="mobile-header">
            <h1>{t('messages')}</h1>
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setShowConversationsList(true)}
              aria-label={t('showConversationsList')}
            >
              ≡
            </button>
          </div>
        )}
        
        {/* Sidebar desktop */}
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>
        
        <main className="messages-content">
          <div className="messages-wrapper">
            {/* Liste des conversations */}
            <div className={`conversations-list ${showConversationsList || !isMobile ? 'active' : ''}`}>
              {isMobile && (
                <div className="conversations-header">
                  <h2>{t('messages')}</h2>
                  <button 
                    className="close-conversations" 
                    onClick={() => setShowConversationsList(false)}
                    aria-label={t('closeConversationsList')}
                  >
                    ×
                  </button>
                </div>
              )}
              
              {!isMobile && (
                <h2 className="conversations-title">{t('messages')}</h2>
              )}
              
              {loading ? (
                <p className="loading-text">{t('loading')}</p>
              ) : conversations.length === 0 ? (
                <p className="no-conversations">{t('noConversations')}</p>
              ) : (
                <div className="conversations">
                  {conversations.map(conv => {
                    const otherUser = conv.autreUtilisateur;
                    if (!otherUser) return null;
                    
                    return (
                      <div
                        key={conv._id || otherUser._id}
                        className={`conversation-item ${
                          selectedConversation?._id === otherUser._id ? 'active' : ''
                        }`}
                        onClick={() => handleSelectConversation(otherUser)}
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
                            {conv.dernierMessage?.audio ? (
                              '🎵 ' + t('voiceMessage')
                            ) : conv.dernierMessage?.image ? (
                              '📷 ' + t('photo')
                            ) : (
                              conv.dernierMessage?.contenu || t('noMessage')
                            )}
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

            {/* Zone des messages */}
            <div className="messages-area">
              {!selectedConversation ? (
                <div className="no-conversation-selected">
                  <p>{isMobile ? t('selectConversationToStart') : t('selectConversationDesktop')}</p>
                </div>
              ) : (
                <>
                  {/* En-tête de la conversation */}
                  <div className="conversation-header">
                    {isMobile && (
                      <button 
                        className="mobile-back-button" 
                        onClick={() => {
                          setSelectedConversation(null);
                          setShowConversationsList(true);
                        }}
                        aria-label={t('backToConversations')}
                      >
                        ←
                      </button>
                    )}
                    <img
                      src={selectedConversation.photo || 'https://via.placeholder.com/48?text=User'}
                      alt={selectedConversation.fullName || `${selectedConversation.prenom} ${selectedConversation.nom}`}
                      className="header-avatar"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48?text=User';
                      }}
                      onClick={() => goToProfile(selectedConversation._id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="header-info">
                      <h3 
                        className="header-name"
                        onClick={() => goToProfile(selectedConversation._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {selectedConversation.prenom} {selectedConversation.nom}
                      </h3>
                      {selectedConversation.bio && (
                        <p className="header-bio">{selectedConversation.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Liste des messages */}
                  <div className="messages-list">
                    {messages.length === 0 ? (
                      <div className="no-messages">
                        <p>{t('noMessagesStartConversation')}</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const currentUserId = currentUser.id || currentUser._id;
                        const isSent = msg.id_expediteur === currentUserId || msg.id_expediteur?._id === currentUserId;
                        
                        return (
                          <div
                            key={msg._id}
                            className={`message-item ${isSent ? 'sent' : 'received'}`}
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
                              {msg.image && (
                                <div className="message-image">
                                  <img src={msg.image} alt="Message attachment" />
                                </div>
                              )}
                              {msg.audio && (
                                <div className="message-audio">
                                  <audio controls preload="metadata">
                                    <source src={msg.audio} type="audio/webm" />
                                    <source src={msg.audio} type="audio/ogg" />
                                    <source src={msg.audio} type="audio/mp4" />
                                    <source src={msg.audio} type="audio/mpeg" />
                                    {t('browserDoesNotSupportAudio')}
                                  </audio>
                                </div>
                              )}
                              {msg.contenu && (
                                <p className="message-text">{msg.contenu}</p>
                              )}
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

                  {/* Formulaire d'envoi */}
                  <form onSubmit={handleSendMessage} className="message-input-form">
                    {/* Prévisualisation des médias */}
                    {(imagePreview || audioPreview) && (
                      <div className="media-preview-container">
                        {imagePreview && (
                          <div className="image-preview-container">
                            <img src={imagePreview} alt="Preview" className="image-preview" />
                            <button 
                              type="button" 
                              className="remove-media-preview"
                              onClick={removeImage}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        {audioPreview && !isRecording && (
                          <div className="audio-preview-container">
                            <audio controls>
                              <source src={audioPreview} type="audio/webm" />
                              <source src={audioPreview} type="audio/ogg" />
                              <source src={audioPreview} type="audio/mp4" />
                              <source src={audioPreview} type="audio/mpeg" />
                              {t('browserDoesNotSupportAudio')}
                            </audio>
                            <button 
                              type="button" 
                              className="remove-media-preview"
                              onClick={removeAudio}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Indicateur d'enregistrement */}
                    {isRecording && (
                      <div className="recording-indicator">
                        <div className="recording-dot"></div>
                        <span className="recording-text">{t('voiceRecordingInProgress')}</span>
                        <span className="recording-timer">{formatRecordingTime(recordingTime)}</span>
                        <button 
                          type="button" 
                          className="cancel-recording-btn"
                          onClick={cancelRecording}
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    )}
                    
                    {/* Contrôles d'envoi */}
                    <div className="message-input-container">
                      <input
                        type="text"
                        placeholder={t('writeAMessage')}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="message-input"
                        disabled={isRecording}
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="image-input"
                        hidden
                      />
                      <input
                        type="file"
                        ref={audioInputRef}
                        accept="audio/*"
                        onChange={handleAudioChange}
                        className="audio-input"
                        hidden
                      />
                      <button
                        type="button"
                        className="attach-button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isRecording}
                        title={t('attachImage')}
                      >
                        📷
                      </button>
                      <button
                        type="button"
                        className={`attach-button audio-button ${isRecording ? 'recording' : ''}`}
                        onClick={isRecording ? stopRecording : startRecording}
                        title={isRecording ? t('stopRecording') : t('recordVoiceMessage')}
                      >
                        {isRecording ? '🛑' : '🎤'}
                      </button>
                      <button
                        type="submit"
                        disabled={sending || (!messageText.trim() && !imageFile && !audioFile) || isRecording}
                        className="send-btn"
                        title={t('sendMessage')}
                      >
                        {sending ? '⏳' : '➤'}
                      </button>
                    </div>
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