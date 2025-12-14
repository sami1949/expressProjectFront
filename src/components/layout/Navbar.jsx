import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = authService.getCurrentUser();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-text">Mini-Facebook</span>
          </Link>
        </div>

        <div className="navbar-search">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Rechercher sur Mini-Facebook..."
          />
        </div>

        <div className="navbar-user">
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
                  <span>Mon Profil</span>
                </Link>

                <Link to="/parametres" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="dropdown-item-icon">⚙️</span>
                  <span>Paramètres</span>
                </Link>

                <Link to="/amis" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="dropdown-item-icon">👥</span>
                  <span>Mes Amis</span>
                </Link>

                <div className="dropdown-divider"></div>

                <Link to="/notifications" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="dropdown-item-icon">🔔</span>
                  <span>Notifications</span>
                  <span className="notification-badge">3</span>
                </Link>

                <Link to="/messages" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="dropdown-item-icon">💬</span>
                  <span>Messages</span>
                </Link>

                <div className="dropdown-divider"></div>

                <Link to="/aide" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="dropdown-item-icon">❓</span>
                  <span>Aide & Support</span>
                </Link>

                <div className="dropdown-divider"></div>

                <button 
                  className="dropdown-item logout" 
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  <span className="dropdown-item-icon">🚪</span>
                  <span>Déconnexion</span>
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