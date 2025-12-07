import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Navigation</h3>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span>Accueil</span>
          </Link>
          
          <Link to="/amis" className="nav-item">
            <span className="nav-icon">👥</span>
            <span>Amis</span>
          </Link>
          
          <Link to="/messages" className="nav-item">
            <span className="nav-icon">💬</span>
            <span>Messages</span>
          </Link>
          
          <Link to="/profil" className="nav-item">
            <span className="nav-icon">👤</span>
            <span>Profil</span>
          </Link>
        </nav>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">En ligne</h3>
        <div className="online-users">
          <div className="user-item">
            <div className="user-avatar online"></div>
            <span>Jean Dupont</span>
          </div>
          <div className="user-item">
            <div className="user-avatar online"></div>
            <span>Marie Curie</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;