import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import './MotDePasseOublie.css';

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
});

const MotDePasseOublie = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Auto-clear message after 10 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await authService.forgotPassword(data.email);
      if (result.success) {
        setMessage(result.message);
        setEmailSent(true);
        toast.success('Instructions envoyées avec succès !');
      } else {
        toast.error(result.message || 'Erreur lors de la réinitialisation');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur de connexion au serveur';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      {/* Left Section - Animated Background */}
      <div className="forgot-left">
        {/* Glitch Effect */}
        <div className="glitch-effect"></div>
        
        {/* Dynamic Grid Lines */}
        <div className="grid-lines">
          {[...Array(10)].map((_, i) => (
            <div key={`h${i}`} className="grid-line horizontal" style={{ top: `${i * 10}%` }}></div>
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={`v${i}`} className="grid-line vertical" style={{ left: `${i * 10}%` }}></div>
          ))}
        </div>
        
        {/* Geometric Shapes */}
        <div className="geometric-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        {/* Light Orbs */}
        <div className="light-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        
        {/* Particle System */}
        <div className="particles-container">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        
        {/* Main Content */}
        <div className="left-content">
          <h1 className="brand-logo">Réinitialisation</h1>
          <p className="brand-tagline">
            Réinitialisez votre mot de passe en toute sécurité<br />
            et retrouvez l'accès à votre compte
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">🔐</div>
              <div className="feature-text">
                <h4>Sécurisé</h4>
                <p>Protection de vos données personnelles</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">
                <h4>Rapide</h4>
                <p>Instructions envoyées instantanément</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📧</div>
              <div className="feature-text">
                <h4>Simple</h4>
                <p>Suivez les étapes par email</p>
              </div>
            </div>
          </div>
          
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">99%</span>
              <span className="stat-label">Succès</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5min</span>
              <span className="stat-label">Délai</span>
            </div>
          </div>
        </div>
        
        {/* Floating CTA Button */}
        <div className="floating-cta">
          <button 
            className="cta-button"
            onClick={() => navigate('/connexion')}
          >
            Retour à la connexion
          </button>
        </div>
      </div>

      {/* Right Section - Form with Animations */}
      <div className="forgot-right">
        {/* Floating Orbs */}
        <div className="floating-orbs">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
        </div>
        
        {/* Animated Rings */}
        <div className="animated-rings">
          <div className="animated-ring ring-1"></div>
          <div className="animated-ring ring-2"></div>
          <div className="animated-ring ring-3"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="floating-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="particle-float"></div>
          ))}
        </div>
        
        {/* Pulsing Dots */}
        <div className="pulsing-dots">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="pulse-dot"></div>
          ))}
        </div>
        
        {/* Fixed Form Container */}
        <div className="form-container-fixed">
          {/* Card Glow Effect */}
          <div className="card-glow-effect"></div>
          
          {/* Card Shadow */}
          <div className="card-shadow"></div>
          
          {/* Fixed Form Card */}
          <div className="fixed-form-card">
            {/* Decorative Elements */}
            <div className="decorative-element decor-1"></div>
            <div className="decorative-element decor-2"></div>
            <div className="decorative-element decor-3"></div>
            
            {/* Corner Accents */}
            <div className="corner-accent corner-tl"></div>
            <div className="corner-accent corner-tr"></div>
            <div className="corner-accent corner-bl"></div>
            <div className="corner-accent corner-br"></div>
            
            {/* Header Section */}
            <div className="form-header-fixed">
              <div className="logo-container">
                <div className="animated-logo">
                  <div className="logo-inner">
                    <span className="logo-letter">🔑</span>
                  </div>
                  <div className="logo-glow"></div>
                </div>
                <div className="logo-text">
                  <h2 className="form-title">Mot de passe oublié</h2>
                  <p className="form-subtitle">
                    {emailSent 
                      ? 'Vérifiez votre boîte email' 
                      : 'Entrez votre email pour réinitialiser'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="forgot-password-form">
              {/* Success Message */}
              {message && (
                <div className="success-container-fixed">
                  <div className="success-icon-fixed">✓</div>
                  <div className="success-text-fixed">
                    <h4>Email envoyé avec succès !</h4>
                    <p>{message}</p>
                  </div>
                  <div className="success-close-fixed" onClick={() => setMessage('')}>×</div>
                </div>
              )}
              
              {/* Email Field */}
              <div className="input-group-fixed">
                <div className="input-wrapper">
                  <div className="input-border-animated"></div>
                  <div className="input-glow-effect"></div>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder=" "
                    className={`form-input-fixed ${errors.email ? 'input-error-fixed' : ''}`}
                    disabled={emailSent}
                  />
                  <label htmlFor="email" className="input-label-fixed">
                    <span className="label-icon">✉️</span>
                    <span className="label-text">Adresse email</span>
                  </label>
                  <div className="input-underline-fixed"></div>
                </div>
                {errors.email && (
                  <div className="error-message-fixed">
                    <span className="error-icon-small">!</span>
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>
              
              {/* Info Message */}
              {!emailSent && (
                <div className="info-message-fixed">
                  <div className="info-icon">💡</div>
                  <div className="info-text">
                    Entrez l'adresse email associée à votre compte. 
                    Nous vous enverrons un lien de réinitialisation.
                  </div>
                </div>
              )}
              
              {/* Email Sent Instructions */}
              {emailSent && (
                <div className="instructions-container-fixed">
                  <div className="instructions-header">
                    <div className="instructions-icon">📋</div>
                    <h4 className="instructions-title">Instructions envoyées</h4>
                  </div>
                  <ul className="instructions-list">
                    <li className="instruction-item">
                      <span className="item-icon">1</span>
                      <span className="item-text">Vérifiez votre boîte de réception</span>
                    </li>
                    <li className="instruction-item">
                      <span className="item-icon">2</span>
                      <span className="item-text">Cliquez sur le lien de réinitialisation</span>
                    </li>
                    <li className="instruction-item">
                      <span className="item-icon">3</span>
                      <span className="item-text">Créez votre nouveau mot de passe</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {/* Submit Button */}
              {!emailSent ? (
                <button 
                  type="submit" 
                  className={`submit-btn-fixed ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-text">Envoi en cours</span>
                      <div className="btn-loader-fixed">
                        <div className="loader-dot"></div>
                        <div className="loader-dot"></div>
                        <div className="loader-dot"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="btn-text">Envoyer les instructions</span>
                      <span className="btn-icon">→</span>
                    </>
                  )}
                  <span className="btn-shine-fixed"></span>
                </button>
              ) : (
                <div className="action-buttons-fixed">
                  <button 
                    type="button" 
                    className="resend-btn-fixed"
                    onClick={() => {
                      setEmailSent(false);
                      setMessage('');
                    }}
                  >
                    <span className="btn-text">Renvoyer l'email</span>
                    <span className="btn-icon">↻</span>
                  </button>
                  <button 
                    type="button" 
                    className="check-email-btn-fixed"
                    onClick={() => window.open('https://mail.google.com', '_blank')}
                  >
                    <span className="btn-text">Vérifier Gmail</span>
                    <span className="btn-icon">↗</span>
                  </button>
                </div>
              )}
              
              {/* Links */}
              <div className="forgot-links-fixed">
                <Link to="/connexion" className="back-link-fixed">
                  <span className="link-icon">←</span>
                  <span className="link-text">Retour à la connexion</span>
                </Link>
                <div className="support-link-fixed">
                  <span className="link-text">Besoin d'aide ?</span>
                  <button 
                    type="button" 
                    className="contact-support-btn"
                    onClick={() => navigate('/contact')}
                  >
                    Contactez le support
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotDePasseOublie;