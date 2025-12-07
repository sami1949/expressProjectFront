import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
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
          <Link to="/connexion" className="logout-link">
            Déconnexion
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;