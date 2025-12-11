import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../services/authService';
import './Connexion.css';

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().min(6, 'Minimum 6 caractères').required('Mot de passe requis'),
});

const Connexion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Auto-clear error message after 60 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
        console.log('Error message cleared after 60 seconds');
      }, 60000); // 60 seconds
      
      // Cleanup timer if component unmounts or error changes
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.login(data);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      // Show a polite message for incorrect password
      if (err.response?.status === 401) {
        setError('Veuillez entrer le bon mot de passe.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Section - Professional Animated Background */}
      <div className="login-left">
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
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        
        {/* Main Content */}
        <div className="left-content">
          <h1 className="brand-logo">FaceConnect Pro</h1>
          <p className="brand-tagline">
            La plateforme sociale nouvelle génération<br />
            Conçue pour connecter, inspirer et grandir ensemble
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">✨</div>
              <div className="feature-text">
                <h4>Expérience Premium</h4>
                <p>Interface optimisée pour une navigation fluide</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div className="feature-text">
                <h4>Sécurité Maximale</h4>
                <p>Protection avancée de vos données personnelles</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚀</div>
              <div className="feature-text">
                <h4>Performance Ultime</h4>
                <p>Chargement instantané, expérience sans latence</p>
              </div>
            </div>
          </div>
          
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">50M+</span>
              <span className="stat-label">Utilisateurs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">99.9%</span>
              <span className="stat-label">Disponibilité</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>
        
        {/* Floating CTA Button */}
        <div className="floating-cta">
          <button 
            className="cta-button"
            onClick={() => navigate('/inscription')}
          >
            Commencer Gratuitement
          </button>
        </div>
      </div>

      {/* Right Section - Fixed 3D Login Form with Animations */}
      <div className="login-right">
        {/* Floating Orbs */}
        <div className="floating-orbs">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
          <div className="floating-orb orb-4"></div>
          <div className="floating-orb orb-5"></div>
          <div className="floating-orb orb-6"></div>
        </div>
        
        {/* Animated Rings */}
        <div className="animated-rings">
          <div className="animated-ring ring-1"></div>
          <div className="animated-ring ring-2"></div>
          <div className="animated-ring ring-3"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="floating-particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle-float"></div>
          ))}
        </div>
        
        {/* Pulsing Dots */}
        <div className="pulsing-dots">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="pulse-dot"></div>
          ))}
        </div>
        
        {/* Fixed 3D Form Container */}
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
            <div className="decorative-element decor-4"></div>
            
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
                    <span className="logo-letter">F</span>
                  </div>
                  <div className="logo-glow"></div>
                </div>
                <div className="logo-text">
                  <h2 className="form-title">Connexion</h2>
                  <p className="form-subtitle">Accédez à votre espace personnel</p>
                </div>
              </div>
            </div>
            
            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="fixed-login-form">
              {/* Error Message */}
              {error && (
                <div className="error-container-fixed">
                  <div className="error-icon-fixed">!</div>
                  <div className="error-text-fixed">{error}</div>
                  <button 
                    type="button" 
                    className="error-close-fixed"
                    onClick={() => setError('')}
                  >
                    ×
                  </button>
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
              
              {/* Password Field */}
              <div className="input-group-fixed">
                <div className="input-wrapper">
                  <div className="input-border-animated"></div>
                  <div className="input-glow-effect"></div>
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder=" "
                    className={`form-input-fixed ${errors.password ? 'input-error-fixed' : ''}`}
                  />
                  <label htmlFor="password" className="input-label-fixed">
                    <span className="label-icon">🔒</span>
                    <span className="label-text">Mot de passe</span>
                  </label>
                  <div className="input-underline-fixed"></div>
                </div>
                {errors.password && (
                  <div className="error-message-fixed">
                    <span className="error-icon-small">!</span>
                    <span>{errors.password.message}</span>
                  </div>
                )}
              </div>
              
              {/* Remember Me & Forgot Password */}
              <div className="form-options-fixed">
                <label className="checkbox-container-fixed">
                  <input type="checkbox" className="checkbox-input-fixed" />
                  <span className="checkbox-custom-fixed">
                    <span className="checkbox-check"></span>
                  </span>
                  <span className="checkbox-text">Se souvenir de moi</span>
                </label>
                <Link to="/mot-de-passe-oublie" className="forgot-password-link">
                  Mot de passe oublié ?
                </Link>
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                className={`submit-btn-fixed ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-text">Connexion en cours</span>
                    <div className="btn-loader-fixed">
                      <div className="loader-dot"></div>
                      <div className="loader-dot"></div>
                      <div className="loader-dot"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="btn-text">Se connecter</span>
                    <span className="btn-icon">→</span>
                  </>
                )}
                <span className="btn-shine-fixed"></span>
              </button>
              
              {/* Divider */}
              <div className="divider-fixed">
                <span className="divider-text">ou</span>
              </div>
              
              {/* Social Login */}
              <div className="social-login-fixed">
                <button type="button" className="social-btn-fixed google-btn">
                  <span className="social-icon">G</span>
                  <span className="social-text">Continuer avec Google</span>
                </button>
                <button type="button" className="social-btn-fixed facebook-btn">
                  <span className="social-icon">f</span>
                  <span className="social-text">Continuer avec Facebook</span>
                </button>
              </div>
              
              {/* Sign Up Link */}
              <div className="signup-link-fixed">
                <span className="signup-text">Pas encore de compte ?</span>
                <Link to="/inscription" className="signup-link">
                  S'inscrire maintenant
                  <span className="link-arrow">↗</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion;