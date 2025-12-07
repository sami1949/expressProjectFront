import React, { useState } from 'react';
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

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const { confirmPassword, ...registerData } = data;
      const result = await authService.register(registerData);
      
      if (result.success) {
        toast.success('Inscription réussie ! Bienvenue sur Mini-Facebook');
        navigate('/');
      } else {
        setError(result.message || 'Erreur lors de l\'inscription');
        toast.error(result.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur de connexion au serveur';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inscription-page">
      <div className="inscription-container">
        <div className="inscription-header">
          <h1 className="inscription-title">Mini-Facebook</h1>
          <p className="inscription-subtitle">Créez votre compte gratuitement</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="inscription-form">
          {error && <div className="alert error">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prenom">Prénom</label>
              <input
                id="prenom"
                type="text"
                {...register('prenom')}
                placeholder="Votre prénom"
                className={errors.prenom ? 'input-error' : ''}
              />
              {errors.prenom && <span className="error-message">{errors.prenom.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="nom">Nom</label>
              <input
                id="nom"
                type="text"
                {...register('nom')}
                placeholder="Votre nom"
                className={errors.nom ? 'input-error' : ''}
              />
              {errors.nom && <span className="error-message">{errors.nom.message}</span>}
            </div>
          </div>

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

          <button type="submit" className="inscription-btn" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>

          <div className="inscription-links">
            <span>Vous avez déjà un compte ?</span>
            <Link to="/connexion" className="link">
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inscription;