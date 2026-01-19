import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authService } from './services/authService';

// Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import VerificationEmail from './pages/VerificationEmail';
import MotDePasseOublie from './pages/MotDePasseOublie';
import ReinitialiserMotDePasse from './pages/ReinitialiserMotDePasse';
import Accueil from './pages/Accueil';
import Profil from './pages/Profil';
import Messages from './pages/Messages';
import Amis from './pages/Amis';
import Notifications from './pages/Notifications';
import Parametres from './pages/Parametres';
import AdminTemplate from './admin/AdminTemplate';

// Composant de route protégée
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
};

// Composant de route protégée pour les administrateurs
const AdminRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/connexion" replace />;
  }
  
  const currentUser = authService.getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Routes>
        {/* Routes publiques */}
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/verification-email" element={<VerificationEmail />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
        <Route path="/reinitialiser-mot-de-passe/:resetToken" element={<ReinitialiserMotDePasse />} />
        
        {/* Routes protégées */}
        <Route path="/" element={
          <ProtectedRoute>
            <Accueil />
          </ProtectedRoute>
        } />
                

        
        <Route path="/profil" element={
          <ProtectedRoute>
            <Profil />
          </ProtectedRoute>
        } />
        
        <Route path="/profil/:userId" element={
          <ProtectedRoute>
            <Profil />
          </ProtectedRoute>
        } />
        
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        
        <Route path="/messages/:userId" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        
        <Route path="/amis" element={
          <ProtectedRoute>
            <Amis />
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        
        <Route path="/parametres" element={
          <ProtectedRoute>
            <Parametres />
          </ProtectedRoute>
        } />
        
        <Route path="/posts/:postId" element={
          <ProtectedRoute>
            <Accueil />
          </ProtectedRoute>
        } />
        
        {/* Route admin protégée */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminTemplate />
          </AdminRoute>
        } />
      </Routes>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </GoogleOAuthProvider>
  );
}

export default App;