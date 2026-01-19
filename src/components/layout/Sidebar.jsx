// Sidebar.jsx - VERSION COMPLÈTE RESPONSIVE
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import './Sidebar.css';

const Sidebar = ({ isMobileOpen, onClose }) => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Ferme la sidebar lors du changement de route (mobile)
  useEffect(() => {
    if (isMobileOpen && onClose) {
      onClose();
    }
  }, [location.pathname, isMobileOpen, onClose]);

  // Empêche le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Overlay pour mobile */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'active' : ''}`}>
        {/* Bouton de fermeture pour mobile */}
        {onClose && (
          <button 
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
        
        <div className="sidebar-section">
          <h3 className="sidebar-title">{t('navigation')}</h3>
          <nav className="sidebar-nav">
            <Link to="/" className={`nav-item ${isActive('/')}`} onClick={onClose}>
              <span className="nav-icon">🏠</span>
              <span>{t('home')}</span>
            </Link>
            
            <Link to="/amis" className={`nav-item ${isActive('/amis')}`} onClick={onClose}>
              <span className="nav-icon">👥</span>
              <span>{t('friends')}</span>
            </Link>
            
            <Link to="/messages" className={`nav-item ${isActive('/messages')}`} onClick={onClose}>
              <span className="nav-icon">💬</span>
              <span>{t('messages')}</span>
            </Link>
            
            <Link to="/notifications" className={`nav-item ${isActive('/notifications')}`} onClick={onClose}>
              <span className="nav-icon">🔔</span>
              <span>{t('notifications')}</span>
            </Link>
            
            <Link to="/profil" className={`nav-item ${isActive('/profil')}`} onClick={onClose}>
              <span className="nav-icon">👤</span>
              <span>{t('profile')}</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-section shortcuts-section">
          <h3 className="sidebar-title">{t('shortcuts')}</h3>
          <div className="sidebar-nav">
            <Link to="/groupes" className="shortcut-item" onClick={onClose}>
              <div className="shortcut-icon">👨‍👩‍👦</div>
              <span className="shortcut-name">{t('groups')}</span>
            </Link>
            
            <Link to="/evenements" className="shortcut-item" onClick={onClose}>
              <div className="shortcut-icon">📅</div>
              <span className="shortcut-name">{t('events')}</span>
            </Link>
            
            <Link to="/photos" className="shortcut-item" onClick={onClose}>
              <div className="shortcut-icon">📸</div>
              <span className="shortcut-name">{t('photos')}</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;