import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import './Inscription.css';

const schema = yup.object({
  nom: yup.string().required('Nom requis').min(2, 'Minimum 2 caractères'),
  prenom: yup.string().required('Prénom requis').min(2, 'Minimum 2 caractères'),
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().min(6, 'Minimum 6 caractères').required('Mot de passe requis'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Les mots de passe doivent correspondre')
    .required('Confirmation requise'),
});

const Inscription = () => {
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

  // Auto-clear error after 10 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const { confirmPassword, ...registerData } = data;
      
      // Initiate registration with email verificat ion
      const result = await authService.initiateRegistration(registerData);
      
      if (result.success) {
        // Store email in localStorage for the verification page
        localStorage.setItem('registrationEmail', data.email);
        toast.success(result.message);
        // Navigate to verification page
        navigate('/verification-email');
      } else {
        setError(result.message || 'Erreur lors de l\'initiation de l\'inscription');
        toast.error(result.message || 'Erreur lors de l\'initiation de l\'inscription');
      }
    } catch (err) {
      // Handle specific error messages for email validation
      let errorMsg = 'Erreur de connexion au serveur';
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMsg = 'Veuillez vérifier vos informations';
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscription-page">
      {/* Left Section - Animated Background */}
      <div className="inscription-left">
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
          <h1 className="brand-logo">Rejoignez-nous</h1>
          <p className="brand-tagline">
            Créez votre compte et commencez à connecter<br />
            avec vos amis et votre famille dès aujourd'hui
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">👥</div>
              <div className="feature-text">
                <h4>Réseau Social</h4>
                <p>Connectez-vous avec des millions de personnes</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <div className="feature-text">
                <h4>Personnalisation</h4>
                <p>Personnalisez votre profil et vos préférences</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚀</div>
              <div className="feature-text">
                <h4>Démarrage Rapide</h4>
                <p>Inscription simple et rapide en quelques minutes</p>
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
              <span className="stat-label">Satisfaction</span>
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
            onClick={() => navigate('/connexion')}
          >
            J'ai déjà un compte
          </button>
        </div>
      </div>

      {/* Right Section - Form with Animations */}
      <div className="inscription-right">
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
                    <span className="logo-letter">+</span>
                  </div>
                  <div className="logo-glow"></div>
                </div>
                <div className="logo-text">
                  <h2 className="form-title">Créer un compte</h2>
                  <p className="form-subtitle">
                    Rejoignez notre communauté
                  </p>
                </div>
              </div>
            </div>
            
            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="inscription-form-fixed">
              {/* Error Message */}
              {error && (
                <div className="error-container-fixed">
                  <div className="error-icon-fixed">!</div>
                  <div className="error-text-fixed">
                    <h4>Erreur d'inscription</h4>
                    <p>{error}</p>
                  </div>
                  <button 
                    type="button" 
                    className="error-close-fixed"
                    onClick={() => setError('')}
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* Name Fields Row */}
              <div className="name-fields-row">
                {/* First Name Field */}
                <div className="input-group-fixed half-width">
                  <div className="input-wrapper">
                    <div className="input-border-animated"></div>
                    <div className="input-glow-effect"></div>
                    <input
                      id="prenom"
                      type="text"
                      {...register('prenom')}
                      placeholder=" "
                      className={`form-input-fixed ${errors.prenom ? 'input-error-fixed' : ''}`}
                    />
                    <label htmlFor="prenom" className="input-label-fixed">
                      <span className="label-icon">👤</span>
                      <span className="label-text">Prénom</span>
                    </label>
                    <div className="input-underline-fixed"></div>
                  </div>
                  {errors.prenom && (
                    <div className="error-message-fixed">
                      <span className="error-icon-small">!</span>
                      <span>{errors.prenom.message}</span>
                    </div>
                  )}
                </div>
                
                {/* Last Name Field */}
                <div className="input-group-fixed half-width">
                  <div className="input-wrapper">
                    <div className="input-border-animated"></div>
                    <div className="input-glow-effect"></div>
                    <input
                      id="nom"
                      type="text"
                      {...register('nom')}
                      placeholder=" "
                      className={`form-input-fixed ${errors.nom ? 'input-error-fixed' : ''}`}
                    />
                    <label htmlFor="nom" className="input-label-fixed">
                      <span className="label-icon">👥</span>
                      <span className="label-text">Nom</span>
                    </label>
                    <div className="input-underline-fixed"></div>
                  </div>
                  {errors.nom && (
                    <div className="error-message-fixed">
                      <span className="error-icon-small">!</span>
                      <span>{errors.nom.message}</span>
                    </div>
                  )}
                </div>
              </div>
              
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
                <div className="password-hint">
                  Minimum 6 caractères
                </div>
              </div>
              
              {/* Confirm Password Field */}
              <div className="input-group-fixed">
                <div className="input-wrapper">
                  <div className="input-border-animated"></div>
                  <div className="input-glow-effect"></div>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    placeholder=" "
                    className={`form-input-fixed ${errors.confirmPassword ? 'input-error-fixed' : ''}`}
                  />
                  <label htmlFor="confirmPassword" className="input-label-fixed">
                    <span className="label-icon">✓</span>
                    <span className="label-text">Confirmer le mot de passe</span>
                  </label>
                  <div className="input-underline-fixed"></div>
                </div>
                {errors.confirmPassword && (
                  <div className="error-message-fixed">
                    <span className="error-icon-small">!</span>
                    <span>{errors.confirmPassword.message}</span>
                  </div>
                )}
              </div>
              
              {/* Terms Agreement */}
              <div className="terms-agreement-fixed">
                <label className="checkbox-container-fixed">
                  <input type="checkbox" className="checkbox-input-fixed" required />
                  <span className="checkbox-custom-fixed">
                    <span className="checkbox-check"></span>
                  </span>
                  <span className="checkbox-text">
                    J'accepte les <button type="button" className="terms-link">conditions d'utilisation</button> 
                    et la <button type="button" className="terms-link">politique de confidentialité</button>
                  </span>
                </label>
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                className={`submit-btn-fixed ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-text">Création du compte</span>
                    <div className="btn-loader-fixed">
                      <div className="loader-dot"></div>
                      <div className="loader-dot"></div>
                      <div className="loader-dot"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="btn-text">S'inscrire gratuitement</span>
                    <span className="btn-icon">→</span>
                  </>
                )}
                <span className="btn-shine-fixed"></span>
              </button>
              
              {/* Divider */}
              <div className="divider-fixed">
                <span className="divider-text">Déjà membre ?</span>
              </div>
              
              {/* Sign In Link */}
              <div className="signin-link-fixed">
                <Link to="/connexion" className="signin-btn-fixed">
                  <span className="signin-icon">←</span>
                  <span className="signin-text">Se connecter</span>
                </Link>
              </div>
              
              {/* Social Sign Up */}
              <div className="social-signup-fixed">
                <p className="social-text">Ou inscrivez-vous avec</p>
                <div className="social-buttons">
                  <button type="button" className="social-btn-fixed google-btn">
                    <span className="social-icon">G</span>
                    <span className="social-text-btn">Google</span>
                  </button>
                  <button type="button" className="social-btn-fixed facebook-btn">
                    <span className="social-icon">f</span>
                    <span className="social-text-btn">Facebook</span>
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

export default Inscription;