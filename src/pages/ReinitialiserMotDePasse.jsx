import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import './ReinitialiserMotDePasse.css';

const schema = yup.object({
  password: yup.string().min(6, 'Minimum 6 caractères').required('Mot de passe requis'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Les mots de passe doivent correspondre')
    .required('Confirmation requise'),
});

const ReinitialiserMotDePasse = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const result = await authService.resetPassword(resetToken, data.password);
      if (result.success) {
        setSuccess(true);
        toast.success('Mot de passe réinitialisé avec succès!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/connexion');
        }, 3000);
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

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-header">
            <h1 className="reset-password-title">Mini-Facebook</h1>
            <p className="reset-password-subtitle">Mot de passe réinitialisé!</p>
          </div>
          
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>Votre mot de passe a été réinitialisé avec succès.</p>
            <p>Vous allez être redirigé vers la page de connexion...</p>
          </div>
          
          <div className="reset-password-links">
            <Link to="/connexion" className="link">
              Aller à la connexion maintenant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <h1 className="reset-password-title">Mini-Facebook</h1>
          <p className="reset-password-subtitle">Réinitialisez votre mot de passe</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Minimum 6 caractères"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="Retapez votre mot de passe"
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="reset-password-btn" disabled={loading}>
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>

          <div className="reset-password-links">
            <Link to="/connexion" className="link">
              ← Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReinitialiserMotDePasse;