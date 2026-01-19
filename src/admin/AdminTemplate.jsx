import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import UsersManagement from './UsersManagement';
import { authService } from '../services/authService';
import './AdminTemplate.css';

const AdminTemplate = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user info
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavClick = (page) => {
    setActivePage(page);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/connexion');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : 'admin-sidebar--closed'}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__brand">
            <span className="admin-sidebar__brand-icon">📋</span>
            <span className="admin-sidebar__brand-text">Admin Panel</span>
          </div>
          <button 
            className="admin-sidebar__toggle-btn" 
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        </div>

        <div className="admin-sidebar__nav-container">
          <nav className="admin-sidebar__nav">
            <ul className="admin-nav">
              <li className="admin-nav__item">
                <button
                  className={`admin-nav__link ${activePage === 'dashboard' ? 'admin-nav__link--active' : ''}`}
                  onClick={() => handleNavClick('dashboard')}
                  aria-current={activePage === 'dashboard' ? 'page' : undefined}
                >
                  <span className="admin-nav__icon">📊</span>
                  <span className="admin-nav__text">Dashboard</span>
                </button>
              </li>

              <li className="admin-nav__item">
                <button
                  className={`admin-nav__link ${activePage === 'users' ? 'admin-nav__link--active' : ''}`}
                  onClick={() => handleNavClick('users')}
                  aria-current={activePage === 'users' ? 'page' : undefined}
                >
                  <span className="admin-nav__icon">👥</span>
                  <span className="admin-nav__text">Utilisateurs</span>
                </button>
              </li>

              <li className="admin-nav__item">
                <button
                  className={`admin-nav__link ${activePage === 'posts' ? 'admin-nav__link--active' : ''}`}
                  onClick={() => handleNavClick('posts')}
                  aria-current={activePage === 'posts' ? 'page' : undefined}
                >
                  <span className="admin-nav__icon">📝</span>
                  <span className="admin-nav__text">Publications</span>
                </button>
              </li>

              <li className="admin-nav__item">
                <button
                  className={`admin-nav__link ${activePage === 'reports' ? 'admin-nav__link--active' : ''}`}
                  onClick={() => handleNavClick('reports')}
                  aria-current={activePage === 'reports' ? 'page' : undefined}
                >
                  <span className="admin-nav__icon">📈</span>
                  <span className="admin-nav__text">Rapports</span>
                </button>
              </li>

              <li className="admin-nav__item">
                <button
                  className={`admin-nav__link ${activePage === 'settings' ? 'admin-nav__link--active' : ''}`}
                  onClick={() => handleNavClick('settings')}
                  aria-current={activePage === 'settings' ? 'page' : undefined}
                >
                  <span className="admin-nav__icon">⚙️</span>
                  <span className="admin-nav__text">Paramètres</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <span className="admin-sidebar__user-avatar">👤</span>
            <div className="admin-sidebar__user-info">
              <span className="admin-sidebar__user-name">{currentUser?.prenom} {currentUser?.nom}</span>
              <span className="admin-sidebar__user-role">Admin</span>
            </div>
          </div>
          
          <button 
            className="admin-sidebar__logout-btn"
            onClick={handleLogout}
            aria-label="Se déconnecter"
          >
            <span className="admin-sidebar__logout-icon">🚪</span>
            <span className="admin-sidebar__logout-text">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${!sidebarOpen ? 'admin-main--sidebar-closed' : ''}`}>
        {/* Navbar */}
        <nav className="admin-navbar">
          <div className="admin-navbar__container">
            <div className="admin-breadcrumb">
              <span className="admin-breadcrumb__current">
                {activePage === 'dashboard' && 'Dashboard'}
                {activePage === 'users' && 'Utilisateurs'}
                {activePage === 'posts' && 'Publications'}
                {activePage === 'reports' && 'Rapports'}
                {activePage === 'settings' && 'Paramètres'}
              </span>
              <h6 className="admin-page__title">
                {activePage === 'dashboard' && 'Tableau de bord'}
                {activePage === 'users' && 'Gestion des utilisateurs'}
                {activePage === 'posts' && 'Modération des publications'}
                {activePage === 'reports' && 'Rapports et statistiques'}
                {activePage === 'settings' && 'Paramètres système'}
              </h6>
            </div>

            <div className="admin-navbar__controls">
              <div className="admin-search">
                <input
                  type="text"
                  className="admin-search__input"
                  placeholder="Rechercher..."
                  aria-label="Rechercher"
                />
                <span className="admin-search__icon">🔍</span>
              </div>

              <div className="admin-icons">
                <button 
                  className="admin-icon-btn" 
                  onClick={toggleSidebar}
                  aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
                >
                  {sidebarOpen ? "◀" : "▶"}
                </button>
                <button className="admin-icon-btn" aria-label="Paramètres">
                  ⚙️
                </button>
                <button className="admin-icon-btn" aria-label="Notifications">
                  🔔
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="admin-content">
          {activePage === 'dashboard' && <AdminDashboard />}
          {activePage === 'users' && <UsersManagement />}
          {activePage === 'posts' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h5 className="admin-card__title">📝 Modération des publications</h5>
              </div>
              <div className="admin-card__body">
                <p className="admin-card__placeholder">
                  Interface de modération des publications en cours de développement...
                </p>
              </div>
            </div>
          )}
          {activePage === 'reports' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h5 className="admin-card__title">📊 Rapports et statistiques</h5>
              </div>
              <div className="admin-card__body">
                <p className="admin-card__placeholder">
                  Interface des rapports en cours de développement...
                </p>
              </div>
            </div>
          )}
          {activePage === 'settings' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h5 className="admin-card__title">⚙️ Paramètres système</h5>
              </div>
              <div className="admin-card__body">
                <p className="admin-card__placeholder">
                  Interface des paramètres en cours de développement...
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTemplate;