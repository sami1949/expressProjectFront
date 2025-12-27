import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { messageService } from '../services/messageService';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import './Messages.css';

const Messages = () => {
  const { t } = useLanguage();
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
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const messagesEndRef = useRef(null);
  const currentUser = authService.getCurrentUser();
  const [searchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');
  const pollingIntervalRef = useRef(null);
  const conversationsPollingRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
    
    conversationsPollingRef.current = setInterval(() => {
      loadConversations();
    }, 10000);
    
    return () => {
      if (conversationsPollingRef.current) {
        clearInterval(conversationsPollingRef.current);
      }
      // Cleanup media stream on unmount
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (userIdFromUrl && conversations.length === 0) {
      loadUserAndStartConversation(userIdFromUrl);
    } else if (userIdFromUrl && conversations.length > 0) {
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
        loadMessages(userId);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      toast.error(t('errorLoadingUser'));
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      pollingIntervalRef.current = setInterval(() => {
        loadMessages(selectedConversation._id);
      }, 3000);
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
              image: conv.lastMessage.image,
              audio: conv.lastMessage.audio,
              date_envoi: conv.lastMessage.date_envoi,
              lu: conv.lastMessage.lu
            },
            messagesNonLus: conv.unreadCount || 0
          }));
          
          setConversations(transformedConversations);
        }
      } else {
        setLoading(true);
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
              image: conv.lastMessage.image,
              audio: conv.lastMessage.audio,
              date_envoi: conv.lastMessage.date_envoi,
              lu: conv.lastMessage.lu
            },
            messagesNonLus: conv.unreadCount || 0
          }));
          
          setConversations(transformedConversations);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      if (loading) {
        toast.error(t('errorLoadingConversations'));
        setLoading(false);
      }
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await messageService.getConversationMessages(userId);
      
      if (response.success) {
        const newMessagesJson = JSON.stringify(response.data.map(m => m._id));
        const currentMessagesJson = JSON.stringify(messages.map(m => m._id));
        
        if (newMessagesJson !== currentMessagesJson) {
          setMessages(response.data);
          
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
      if (error.response?.status !== 404) {
        if (messages.length === 0) {
          toast.error(t('errorLoadingMessages'));
        }
      }
      if (messages.length === 0) {
        setMessages([]);
      }
    }
  };

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

  const startRecording = async () => {
    try {
      console.log('Demande d\'accès au microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      mediaStreamRef.current = stream;
      console.log('Accès au microphone accordé');
      
      // Check browser compatibility for audio formats
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }
      
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log('Total chunks:', chunks.length);
        }
      };
      
      recorder.onstop = async () => {
        console.log('Enregistrement arrêté, chunks:', chunks.length);
        
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: mimeType });
          console.log('Blob audio créé:', audioBlob.size, 'bytes', 'type:', audioBlob.type);
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result;
            console.log('Base64 length:', base64data.length);
            setAudioPreview(base64data);
            setAudioFile(base64data);
            toast.success(t('audioRecordedSuccessfully'));
          };
          reader.onerror = () => {
            console.error('Erreur FileReader');
            toast.error(t('errorConvertingAudio'));
          };
          reader.readAsDataURL(audioBlob);
        } else {
          console.log('Aucune donnée audio enregistrée');
          toast.error(t('noAudioDataRecorded'));
        }
        
        // Stop all tracks
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
      };
      
      setMediaRecorder(recorder);
      setAudioChunks([]);
      
      // Start recording with timeslice for better data collection
      recorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      console.log('Enregistrement démarré avec timeslice de 100ms');
      toast.info(t('recordingInProgress'), { autoClose: 1000 });
      
    } catch (error) {
      console.error('Erreur enregistrement audio:', error);
      if (error.name === 'NotAllowedError') {
        toast.error(t('microphonePermissionDenied'));
      } else if (error.name === 'NotFoundError') {
        toast.error(t('noMicrophoneDetected'));
      } else {
        toast.error(t('cannotAccessMicrophone'));
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      // Vérifier la durée minimale (1 seconde)
      if (recordingTime < 1) {
        toast.warning(t('recordingTooShort'));
        return;
      }
      
      console.log('Arrêt de l\'enregistrement...', recordingTime, 'secondes');
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      console.log('Annulation de l\'enregistrement...');
      mediaRecorder.stop();
      setIsRecording(false);
      setAudioChunks([]);
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !imageFile && !audioFile) || !selectedConversation) return;

    try {
      setSending(true);
      console.log('=== ENVOI MESSAGE ===');
      console.log('Destinataire:', selectedConversation._id);
      console.log('Texte:', messageText.trim() || '(vide)');
      console.log('Image:', imageFile ? 'OUI' : 'NON');
      console.log('Audio:', audioFile ? 'OUI' : 'NON');
      
      let imageData = null;
      if (imageFile) {
        console.log('Conversion image en base64...');
        const reader = new FileReader();
        imageData = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(imageFile);
        });
        console.log('Image convertie, taille:', imageData.length);
      }
      
      let audioData = null;
      if (audioFile && !isRecording) {
        if (typeof audioFile === 'string' && audioFile.startsWith('data:audio')) {
          console.log('Audio déjà en base64, taille:', audioFile.length);
          audioData = audioFile;
        } else {
          console.log('Conversion audio en base64...');
          const reader = new FileReader();
          audioData = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(audioFile);
          });
          console.log('Audio converti, taille:', audioData.length);
        }
      }
      
      console.log('=== DONNÉES À ENVOYER ===');
      console.log('audioData présent:', audioData ? 'OUI' : 'NON');
      console.log('audioData length:', audioData ? audioData.length : 0);
      
      let response;
      if (imageFile && audioFile) {
        console.log('Envoi avec image ET audio');
        response = await messageService.sendMessageWithMedia(
          selectedConversation._id,
          messageText.trim(),
          imageData,
          audioData
        );
      } else if (imageFile) {
        console.log('Envoi avec image seulement');
        response = await messageService.sendMessageWithImage(
          selectedConversation._id,
          messageText.trim(),
          imageData
        );
      } else if (audioFile) {
        console.log('Envoi avec audio seulement');
        console.log('Audio data à envoyer:', audioData.substring(0, 100) + '...');
        response = await messageService.sendMessageWithAudio(
          selectedConversation._id,
          messageText.trim(),
          audioData
        );
      } else {
        console.log('Envoi texte seulement');
        response = await messageService.sendMessage(
          selectedConversation._id,
          messageText.trim()
        );
      }
      
      console.log('Réponse serveur:', response);
      
      if (response.success) {
        setMessages([...messages, response.data]);
        setMessageText('');
        removeImage();
        removeAudio();
        loadConversations();
        setTimeout(() => {
          loadMessages(selectedConversation._id);
        }, 500);
        toast.success(t('messageSent'));
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      console.error('Détails erreur:', error.response?.data);
      toast.error(error.response?.data?.message || t('errorSendingMessage'));
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

  return (
    <div className="messages-page">
      <Navbar />
      
      <div className="messages-container">
        <Sidebar />
        
        <main className="messages-content">
          <div className="messages-wrapper">
            {/* Conversations List */}
            <div className="conversations-list">
              <h2 className="conversations-title">{t('messages')}</h2>
              
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

            {/* Messages Area */}
            <div className="messages-area">
              {!selectedConversation ? (
                <div className="no-conversation-selected">
                  <p>{t('selectConversationToStart')}</p>
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
                      onClick={() => {
                        // Navigate to user's profile when clicking on avatar
                        const userId = selectedConversation._id;
                        if (userId && userId !== currentUser?.id) {
                          navigate(`/profil/${userId}`);
                        } else if (userId === currentUser?.id) {
                          navigate('/profil');
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="header-info">
                      <h3 
                        className="header-name"
                        onClick={() => {
                          // Navigate to user's profile when clicking on name
                          const userId = selectedConversation._id;
                          if (userId && userId !== currentUser?.id) {
                            navigate(`/profil/${userId}`);
                          } else if (userId === currentUser?.id) {
                            navigate('/profil');
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
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
                                  <audio controls>
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

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="message-input-form">
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
                    
                    {/* Recording indicator */}
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