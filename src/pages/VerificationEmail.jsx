import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import './VerificationEmail.css';

const schema = yup.object({
  verificationCode: yup
    .string()
    .required('Code de vérification requis')
    .length(6, 'Le code doit contenir 6 chiffres')
    .matches(/^[0-9]+$/, 'Le code ne doit contenir que des chiffres')
});

const VerificationEmail = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  // Get email from localStorage (passed from registration page)
  const email = localStorage.getItem('registrationEmail') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const codeValue = watch('verificationCode');

  // Countdown for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, canResend]);

  // Auto-focus and auto-submit logic for OTP
  useEffect(() => {
    if (codeValue && codeValue.length === 6) {
      const timer = setTimeout(() => {
        handleSubmit(onSubmit)();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [codeValue]);

  // Handle OTP input changes
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setValue('verificationCode', value);
    
    // Auto focus next input in OTP
    if (value.length === 6) {
      const inputs = document.querySelectorAll('.otp-input');
      if (inputs[5]) inputs[5].blur();
    }
  };

  const onSubmit = async (data) => {
    if (!data.verificationCode || data.verificationCode.length !== 6) {
      setError('Veuillez entrer un code de 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await authService.verifyRegistrationCode(email, data.verificationCode);
      
      if (result.success) {
        setSuccess('Vérification réussie !');
        toast.success('Inscription réussie ! Bienvenue sur FaceConnect');
        
        // Remove email from localStorage
        localStorage.removeItem('registrationEmail');
        
        // Navigate to home page after delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.message || 'Code invalide');
        toast.error(result.message || 'Code invalide');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur de connexion au serveur';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await authService.resendVerificationCode(email);
      
      if (result.success) {
        toast.success('Code renvoyé avec succès !');
        setSuccess('Un nouveau code a été envoyé à votre email');
        
        // Reset countdown
        setCountdown(60);
        setCanResend(false);
      } else {
        setError(result.message || 'Erreur lors du renvoi du code');
        toast.error(result.message || 'Erreur lors du renvoi du code');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur de connexion au serveur';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setResendLoading(false);
    }
  };

  // Generate OTP inputs
  const renderOTPInputs = () => {
    const inputs = [];
    for (let i = 0; i < 6; i++) {
      inputs.push(
        <div key={i} className="otp-cell">
          <input
            type="text"
            maxLength="1"
            className={`otp-input ${errors.verificationCode ? 'input-error-fixed' : ''}`}
            value={codeValue ? (codeValue[i] || '') : ''}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value) {
                const newCode = (codeValue || '').split('');
                newCode[i] = value;
                setValue('verificationCode', newCode.join(''));
                
                // Auto focus next input
                if (i < 5) {
                  const nextInput = document.querySelector(`.otp-input:nth-child(${i + 2})`);
                  if (nextInput) nextInput.focus();
                }
              }
            }}
            onKeyDown={(e) => {
              // Handle backspace
              if (e.key === 'Backspace' && !codeValue?.[i] && i > 0) {
                const prevInput = document.querySelector(`.otp-input:nth-child(${i})`);
                if (prevInput) prevInput.focus();
              }
            }}
            onPaste={(e) => {
              const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
              if (paste.length === 6) {
                setValue('verificationCode', paste);
                e.preventDefault();
              }
            }}
          />
          {i < 5 && <div className="otp-separator"></div>}
        </div>
      );
    }
    return inputs;
  };

  return (
    <div className="verification-page">
      {/* Left Section - Animated Background */}
      <div className="verification-left">
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
          <h1 className="brand-logo">Vérification</h1>
          <p className="brand-tagline">
            Sécurisez votre compte avec<br />
            la vérification en deux étapes
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">🔐</div>
              <div className="feature-text">
                <h4>Sécurité Renforcée</h4>
                <p>Protection contre les accès non autorisés</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-text">
                <h4>Validation Rapide</h4>
                <p>Code à usage unique envoyé instantanément</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📧</div>
              <div className="feature-text">
                <h4>Simple & Efficace</h4>
                <p>Entrez le code reçu par email</p>
              </div>
            </div>
          </div>
          
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">99.9%</span>
              <span className="stat-label">Sécurité</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">60s</span>
              <span className="stat-label">Délai</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Fiabilité</span>
            </div>
          </div>
        </div>
        
        {/* Floating CTA Button */}
        <div className="floating-cta">
          <button 
            className="cta-button"
            onClick={() => navigate('/connexion')}
          >
            Se connecter
          </button>
        </div>
      </div>

      {/* Right Section - Form with Animations */}
      <div className="verification-right">
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
                    <span className="logo-letter">✓</span>
                  </div>
                  <div className="logo-glow"></div>
                </div>
                <div className="logo-text">
                  <h2 className="form-title">Vérification Email</h2>
                  <p className="form-subtitle">
                    Finalisez votre inscription
                  </p>
                </div>
              </div>
            </div>
            
            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="verification-form-fixed">
              {/* Success Message */}
              {success && (
                <div className="success-container-fixed">
                  <div className="success-icon-fixed">✓</div>
                  <div className="success-text-fixed">
                    <h4>Succès !</h4>
                    <p>{success}</p>
                  </div>
                  <div className="success-loading">
                    <div className="loading-spinner"></div>
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="error-container-fixed">
                  <div className="error-icon-fixed">!</div>
                  <div className="error-text-fixed">
                    <h4>Erreur de vérification</h4>
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
              
              {/* Email Display */}
              <div className="email-display-fixed">
                <div className="email-icon">✉️</div>
                <div className="email-content">
                  <p className="email-label">Code envoyé à :</p>
                  <p className="email-address">{email}</p>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="instructions-fixed">
                <p className="instructions-text">
                  Entrez le code de vérification à 6 chiffres que nous avons envoyé à votre adresse email.
                </p>
              </div>
              
              {/* OTP Input */}
              <div className="otp-container-fixed">
                <label className="otp-label">Code de vérification</label>
                <div className="otp-inputs-container">
                  {renderOTPInputs()}
                </div>
                <input
                  type="hidden"
                  {...register('verificationCode')}
                />
                {errors.verificationCode && (
                  <div className="error-message-fixed">
                    <span className="error-icon-small">!</span>
                    <span>{errors.verificationCode.message}</span>
                  </div>
                )}
              </div>
              
              {/* Auto-verify Notice */}
              <div className="auto-verify-notice">
                <div className="notice-icon">⚡</div>
                <div className="notice-text">
                  La vérification sera automatique lorsque les 6 chiffres seront saisis
                </div>
              </div>
              
              {/* Countdown Timer */}
              <div className="countdown-timer-fixed">
                <div className="timer-content">
                  <div className="timer-icon">⏱️</div>
                  <div className="timer-text">
                    <span className="timer-label">Prochain code disponible dans :</span>
                    <span className="timer-value">
                      {countdown > 0 ? (
                        <span className="countdown-active">{countdown}s</span>
                      ) : (
                        <span className="countdown-ready">Prêt !</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                className={`verify-btn-fixed ${loading ? 'loading' : ''}`}
                disabled={loading || !codeValue || codeValue.length !== 6}
              >
                {loading ? (
                  <>
                    <span className="btn-text">Vérification en cours</span>
                    <div className="btn-loader-fixed">
                      <div className="loader-dot"></div>
                      <div className="loader-dot"></div>
                      <div className="loader-dot"></div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="btn-text">Vérifier le code</span>
                    <span className="btn-icon">→</span>
                  </>
                )}
                <span className="btn-shine-fixed"></span>
              </button>
              
              {/* Action Buttons */}
              <div className="verification-actions-fixed">
                <button 
                  type="button" 
                  className={`resend-btn-fixed ${!canResend ? 'disabled' : ''}`}
                  onClick={handleResendCode}
                  disabled={!canResend || resendLoading}
                >
                  {resendLoading ? (
                    <>
                      <span className="btn-text">Envoi en cours</span>
                      <div className="btn-loader-small">
                        <div className="loader-dot"></div>
                        <div className="loader-dot"></div>
                        <div className="loader-dot"></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="btn-text">Renvoyer le code</span>
                      <span className="btn-icon">↻</span>
                    </>
                  )}
                </button>
                
                <Link to="/inscription" className="edit-email-btn-fixed">
                  <span className="btn-text">Modifier l'email</span>
                  <span className="btn-icon">✎</span>
                </Link>
              </div>
              
              {/* Need Help */}
              <div className="help-section-fixed">
                <div className="help-icon">❓</div>
                <div className="help-content">
                  <p className="help-text">Vous ne recevez pas le code ?</p>
                  <ul className="help-suggestions">
                    <li className="suggestion-item">Vérifiez votre dossier spam/courrier indésirable</li>
                    <li className="suggestion-item">Assurez-vous que l'adresse email est correcte</li>
                    <li className="suggestion-item">Patientez quelques minutes</li>
                  </ul>
                </div>
              </div>
              
              {/* Back to Sign Up */}
              <div className="back-link-fixed">
                <Link to="/inscription" className="back-link">
                  <span className="link-icon">←</span>
                  <span className="link-text">Retour à l'inscription</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationEmail;