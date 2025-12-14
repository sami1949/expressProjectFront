import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Navigation</h3>
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${isActive('/')}`}>
            <span className="nav-icon">🏠</span>
            <span>Accueil</span>
          </Link>
          
          <Link to="/amis" className={`nav-item ${isActive('/amis')}`}>
            <span className="nav-icon">👥</span>
            <span>Amis</span>
          </Link>
          
          <Link to="/messages" className={`nav-item ${isActive('/messages')}`}>
            <span className="nav-icon">💬</span>
            <span>Messages</span>
          </Link>
          
          <Link to="/profil" className={`nav-item ${isActive('/profil')}`}>
            <span className="nav-icon">👤</span>
            <span>Profil</span>
          </Link>
        </nav>
      </div>

      <div className="sidebar-section shortcuts-section">
        <h3 className="sidebar-title">Raccourcis</h3>
        <div className="sidebar-nav">
          <Link to="/groupes" className="shortcut-item">
            <div className="shortcut-icon">👨‍👩‍👦</div>
            <span className="shortcut-name">Groupes</span>
          </Link>
          
          <Link to="/evenements" className="shortcut-item">
            <div className="shortcut-icon">📅</div>
            <span className="shortcut-name">Événements</span>
          </Link>
          
          <Link to="/photos" className="shortcut-item">
            <div className="shortcut-icon">📸</div>
            <span className="shortcut-name">Photos</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;