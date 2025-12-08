import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    authService.logout();
    navigate('/connexion');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-text">Mini-Facebook</span>
          </Link>
        </div>

        <div className="navbar-user">
          <Link to="/profil" className="user-link">
            Mon profil
          </Link>
          <button onClick={handleLogout} className="logout-link">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;