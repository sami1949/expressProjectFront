// MobileMenuToggle.jsx
import React from 'react';
import './MobileMenuToggle.css';

const MobileMenuToggle = ({ isOpen, onToggle }) => {
  return (
    <button 
      className={`mobile-menu-toggle ${isOpen ? 'active' : ''}`}
      onClick={onToggle}
      aria-label="Toggle menu"
      type="button"
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  );
};

export default MobileMenuToggle;