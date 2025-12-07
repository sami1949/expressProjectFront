import React, { useState } from 'react';
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
      setError('Erreur de connexion'+err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Mini-Facebook</h1>
          <p className="login-subtitle">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          {error && <div className="alert error">{error}</div>}
          
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

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              {...register('password')}
              placeholder="Votre mot de passe"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="login-links">
            <Link to="/mot-de-passe-oublie" className="link">
              Mot de passe oublié ?
            </Link>
            <span className="separator">•</span>
            <Link to="/inscription" className="link">
              Créer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Connexion;