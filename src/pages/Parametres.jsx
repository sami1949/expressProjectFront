import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { authService } from '../services/authService';
import { postService } from '../services/postService';
import { toast } from 'react-toastify';
import DarkModeToggle from '../components/common/DarkModeToggle';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import PublicationCard from '../components/posts/PublicationCard';
import './Parametres.css';

const Parametres = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showUserPosts, setShowUserPosts] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch complete user profile from backend
    const fetchUserProfile = async () => {
      try {
        const profile = await authService.getProfile();
        if (profile.success) {
          setUser(profile.data);
        } else {
          // Fallback to local storage data
          const localUser = authService.getCurrentUser();
          setUser(localUser);
        }
      } catch (error) {
        // Fallback to local storage data
        const localUser = authService.getCurrentUser();
        setUser(localUser);
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch user posts
  const fetchUserPosts = async () => {
    if (showUserPosts) return; // Already loaded
    
    setLoadingPosts(true);
    try {
      // Fetch user posts from the backend
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Utilisateur non identifié');
      }
      
      const response = await postService.getUserPosts(currentUser._id || currentUser.id, 1, 50);
      
      if (response.success) {
        setUserPosts(response.data);
        setShowUserPosts(true);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des posts');
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast.error(error.message || 'Erreur lors du chargement des posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordLoading) return;
    
    // Clear previous errors
    setPasswordErrors({});
    
    // Validation
    let errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Veuillez entrer votre mot de passe actuel';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'Veuillez entrer un nouveau mot de passe';
    }
    if (!passwordData.confirmNewPassword) {
      errors.confirmNewPassword = 'Veuillez confirmer le nouveau mot de passe';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordErrors({ newPassword: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordErrors({ confirmNewPassword: 'Les nouveaux mots de passe ne correspondent pas' });
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const result = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        toast.success('Mot de passe modifié avec succès !');
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        setShowPasswordForm(false);
      } else {
        // Handle specific error cases
        if (result.message.includes('actuel incorrect')) {
          setPasswordErrors({ currentPassword: 'Mot de passe actuel incorrect' });
        } else {
          toast.error(result.message || 'Erreur lors du changement de mot de passe');
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur de connexion au serveur';
      // Handle specific error cases
      if (errorMsg.includes('actuel incorrect')) {
        setPasswordErrors({ currentPassword: 'Mot de passe actuel incorrect' });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle post deletion
  const handlePostDelete = (postId) => {
    setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    toast.success('Post supprimé avec succès');
  };

  return (
    <div className="accueil-page">
      <Navbar />
      
      <div className="accueil-container">
        <Sidebar />
        
        <main className="main-content">
          <div className="settings-page">
            <div className="container">
              <div className="settings-header">
                <h1>{t('settingsTitle')}</h1>
                <p>{t('settingsSubtitle')}</p>
              </div>

              <div className="settings-content">
                {/* User Information Section */}
                <div className="settings-section user-info-section">
                  <h2>Informations du compte</h2>
                  {!showUserInfo ? (
                    <div className="user-info-hidden">
                      <h3>Voir vos informations personnelles</h3>
                      <p>Cliquez sur le bouton pour afficher vos informations de compte</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowUserInfo(true)}
                      >
                        Voir informations
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="user-info-detail">
                        <div className="user-info-row">
                          <span className="user-info-label">Nom complet:</span>
                          <span className="user-info-value">
                            {loading ? 'Chargement...' : (user ? `${user.prenom} ${user.nom}` : 'Non disponible')}
                          </span>
                        </div>
                        
                        <div className="user-info-row">
                          <span className="user-info-label">Email:</span>
                          <span className="user-info-value">
                            {loading ? 'Chargement...' : (user ? user.email : 'Non disponible')}
                          </span>
                        </div>
                        
                        <div className="user-info-row">
                          <span className="user-info-label">Date de création:</span>
                          <span className="user-info-value">
                            {loading ? 'Chargement...' : 
                             (user ? formatDate(user.date_inscription || user.createdAt) : 'Non disponible')}
                          </span>
                        </div>
                        
                        <div className="user-info-row">
                          <span className="user-info-label">ID du compte:</span>
                          <span className="user-info-value">
                            {loading ? 'Chargement...' : 
                             (user ? (user._id || user.id) : 'Non disponible')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="user-info-actions">
                        <button 
                          className="btn btn-secondary btn-block"
                          onClick={() => setShowUserInfo(false)}
                        >
                          Masquer les informations
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* User Posts Section */}
                <div className="settings-section">
                  <h2>Vos publications</h2>
                  {!showUserPosts ? (
                    <div className="setting-item">
                      <div className="setting-info">
                        <h3>Voir toutes vos publications</h3>
                        <p>Consultez l'historique de toutes vos publications</p>
                      </div>
                      <div className="setting-control">
                        <button 
                          className="btn btn-primary btn-small"
                          onClick={fetchUserPosts}
                          disabled={loadingPosts}
                        >
                          {loadingPosts ? 'Chargement...' : 'Voir tous les posts'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="user-posts-container">
                      <div className="user-posts-header">
                        <h3>Vos publications récentes</h3>
                        <button 
                          className="btn btn-secondary btn-small"
                          onClick={() => setShowUserPosts(false)}
                        >
                          Masquer
                        </button>
                      </div>
                      
                      {userPosts.length === 0 ? (
                        <div className="no-posts-message">
                          <p>Vous n'avez pas encore publié de posts.</p>
                        </div>
                      ) : (
                        <div className="posts-list">
                          {userPosts.map(post => (
                            <PublicationCard 
                              key={post._id} 
                              post={post} 
                              onPostDelete={handlePostDelete}
                              singlePostMode={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="settings-section">
                  <h2>{t('appearance')}</h2>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('darkMode')}</h3>
                      <p>{t('darkModeDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <DarkModeToggle />
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h2>{t('language')}</h2>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('language')}</h3>
                      <p>{t('languageDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <div className="language-selector">
                        <button 
                          className={`language-btn ${language === 'fr' ? 'active' : ''}`}
                          onClick={() => handleLanguageChange('fr')}
                        >
                          {t('french')}
                        </button>
                        <button 
                          className={`language-btn ${language === 'en' ? 'active' : ''}`}
                          onClick={() => handleLanguageChange('en')}
                        >
                          {t('english')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="settings-section">
                  <h2>Sécurité</h2>
                  {!showPasswordForm ? (
                    <div className="setting-item">
                      <div className="setting-info">
                        <h3>Changer le mot de passe</h3>
                        <p>Modifier votre mot de passe actuel</p>
                      </div>
                      <div className="setting-control">
                        <button 
                          className="btn btn-primary btn-small"
                          onClick={() => setShowPasswordForm(true)}
                        >
                          Changer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="setting-item password-change-form-container">
                      <h3>Changer le mot de passe</h3>
                      <form onSubmit={submitPasswordChange} className="password-change-form">
                        <div className="form-group">
                          <label htmlFor="currentPassword">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className={passwordErrors.currentPassword ? 'input-error' : ''}
                          />
                          {passwordErrors.currentPassword && (
                            <div className="error-message">
                              {passwordErrors.currentPassword}
                            </div>
                          )}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="newPassword">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={passwordErrors.newPassword ? 'input-error' : ''}
                          />
                          {passwordErrors.newPassword && (
                            <div className="error-message">
                              {passwordErrors.newPassword}
                            </div>
                          )}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="confirmNewPassword">
                            Confirmer le nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            value={passwordData.confirmNewPassword}
                            onChange={handlePasswordChange}
                            className={passwordErrors.confirmNewPassword ? 'input-error' : ''}
                          />
                          {passwordErrors.confirmNewPassword && (
                            <div className="error-message">
                              {passwordErrors.confirmNewPassword}
                            </div>
                          )}
                        </div>
                        
                        <div className="form-actions">
                          <button 
                            type="submit"
                            disabled={passwordLoading}
                            className="btn-submit"
                          >
                            {passwordLoading ? 'Changement en cours...' : 'Changer le mot de passe'}
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmNewPassword: ''
                              });
                              setPasswordErrors({});
                            }}
                            className="btn-cancel"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                <div className="settings-section">
                  <h2>{t('settingsNotifications')}</h2>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('pushNotifications')}</h3>
                      <p>{t('pushNotificationsDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('emailNotifications')}</h3>
                      <p>{t('emailNotificationsDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h2>{t('privacy')}</h2>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('publicProfile')}</h3>
                      <p>{t('publicProfileDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>{t('emailSearch')}</h3>
                      <p>{t('emailSearchDesc')}</p>
                    </div>
                    <div className="setting-control">
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Parametres;