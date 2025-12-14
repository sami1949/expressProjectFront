import React, { useState } from 'react';
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
    setMessage('');
    
    try {
      const result = await authService.forgotPassword(data.email);
      if (result.success) {
        setMessage(result.message);
        toast.success(result.message);
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
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">Mini-Facebook</h1>
          <p className="forgot-password-subtitle">Réinitialisez votre mot de passe</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="forgot-password-form">
          {message && <div className="alert success">{message}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="votre@email.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <button type="submit" className="forgot-password-btn" disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Envoyer les instructions'}
          </button>

          <div className="forgot-password-links">
            <Link to="/connexion" className="link">
              ← Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MotDePasseOublie;