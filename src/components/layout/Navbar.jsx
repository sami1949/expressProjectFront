import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import DarkModeToggle from '../common/DarkModeToggle';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const dropdownRef = useRef(null);
  const user = authService.getCurrentUser();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Récupérer le nombre de notifications non lues
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        if (response.success) {
          setNotificationCount(response.count);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre de notifications:', error);
      }
    };

    if (user) {
      fetchNotificationCount();
      
      // Actualiser le compteur toutes les 30 secondes
      const interval = setInterval(fetchNotificationCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = () => {
    authService.logout();
    navigate('/connexion');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleNotificationClick = () => {
    setDropdownOpen(false);
    navigate('/notifications');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img 
              src="/Images/logoFcb.png" 
              alt="Mini-Facebook Logo" 
              className="navbar-logo-img"
            />
          </Link>
        </div>

        <div className="navbar-search">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
          />
        </div>

        <div className="navbar-user">
          <DarkModeToggle />
          <div className="user-profile-wrapper" ref={dropdownRef}>
            <button 
              className="user-avatar-btn"
              onClick={toggleDropdown}
              aria-label="Menu utilisateur"
            >
              <img 
                src={user?.photo || '/default-avatar.jpg'} 
                alt={`${user?.prenom} ${user?.nom}`}
              />
            </button>

            <div className={`user-dropdown ${dropdownOpen ? 'active' : ''}`}>
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <img 
                    src={user?.photo || '/default-avatar.jpg'} 
                    alt="Avatar"
                    className="dropdown-avatar"
                  />
                  <div className="dropdown-user-details">
                    <h3>{user?.prenom} {user?.nom}</h3>
                    <p>{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="dropdown-menu">
                <Link to="/profil" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="dropdown-item-icon">👤</span>
                  <span>{t('myProfile')}</span>
                </Link>

                <Link to="/parametres" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="dropdown-item-icon">⚙️</span>
                  <span>{t('settings')}</span>
                </Link>

                <Link to="/amis" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="dropdown-item-icon">👥</span>
                  <span>{t('friends')}</span>
                </Link>

                <div className="dropdown-divider"></div>

                <button 
                  className="dropdown-item" 
                  onClick={handleNotificationClick}
                  style={{ 
                    border: 'none', 
                    background: 'none', 
                    width: '100%', 
                    textAlign: 'left' 
                  }}
                >
                  <span className="dropdown-item-icon">🔔</span>
                  <span>{t('notifications')}</span>
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                  )}
                </button>

                <Link to="/messages" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="dropdown-item-icon">💬</span>
                  <span>{t('messages')}</span>
                </Link>

                <div className="dropdown-divider"></div>

                <Link to="/aide" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="dropdown-item-icon">❓</span>
                  <span>{t('helpSupport')}</span>
                </Link>

                <div className="dropdown-divider"></div>

                <button 
                  className="dropdown-item logout styled-logout" 
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  <span className="dropdown-item-icon">🚪</span>
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;