import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">{t('navigation')}</h3>
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${isActive('/')}`}>
            <span className="nav-icon">🏠</span>
            <span>{t('home')}</span>
          </Link>
          
          <Link to="/amis" className={`nav-item ${isActive('/amis')}`}>
            <span className="nav-icon">👥</span>
            <span>{t('friends')}</span>
          </Link>
          
          <Link to="/messages" className={`nav-item ${isActive('/messages')}`}>
            <span className="nav-icon">💬</span>
            <span>{t('messages')}</span>
          </Link>
          
          <Link to="/notifications" className={`nav-item ${isActive('/notifications')}`}>
            <span className="nav-icon">🔔</span>
            <span>{t('notifications')}</span>
          </Link>
          
          <Link to="/profil" className={`nav-item ${isActive('/profil')}`}>
            <span className="nav-icon">👤</span>
            <span>{t('profile')}</span>
          </Link>
        </nav>
      </div>

      <div className="sidebar-section shortcuts-section">
        <h3 className="sidebar-title">{t('shortcuts')}</h3>
        <div className="sidebar-nav">
          <Link to="/groupes" className="shortcut-item">
            <div className="shortcut-icon">👨‍👩‍👦</div>
            <span className="shortcut-name">{t('groups')}</span>
          </Link>
          
          <Link to="/evenements" className="shortcut-item">
            <div className="shortcut-icon">📅</div>
            <span className="shortcut-name">{t('events')}</span>
          </Link>
          
          <Link to="/photos" className="shortcut-item">
            <div className="shortcut-icon">📸</div>
            <span className="shortcut-name">{t('photos')}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;