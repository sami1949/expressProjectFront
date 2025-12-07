import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authService } from './services/authService';

// Pages
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Accueil from './pages/Accueil';
import Profil from './pages/Profil';
import Messages from './pages/Messages';
import Amis from './pages/Amis';

// Composant de route protégée
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/connexion" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Routes>
        {/* Routes publiques */}
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        
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
        
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        
        <Route path="/amis" element={
          <ProtectedRoute>
            <Amis />
          </ProtectedRoute>
        } />
        
        {/* Route 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;