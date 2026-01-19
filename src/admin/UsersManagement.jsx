import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import './UsersManagement.css';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // Toggle between 'active' and 'inactive' (keep 'pending' as is)
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await userService.updateUser(userId, { status: newStatus });
      if (response.success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, status: newStatus } 
              : user
          )
        );
        
        // If deactivating, show a confirmation message
        if (newStatus === 'inactive') {
          alert(`Le compte de l'utilisateur a été désactivé. L'utilisateur ne pourra plus se connecter.`);
        } else {
          alert(`Le compte de l'utilisateur a été réactivé.`);
        }
      } else {
        setError(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const openUserProfile = (user) => {
    setSelectedUser(user);
    setShowProfilePopup(true);
  };

  const closeUserProfile = () => {
    setShowProfilePopup(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="users-management">
        <div className="users-management__loading">
          <div className="users-management__loading-spinner"></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-management">
        <div className="users-management__error">
          <p className="users-management__error-message">{error}</p>
          <button 
            className="users-management__retry-btn"
            onClick={loadUsers}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-management">
      <div className="users-management__header">
        <h2 className="users-management__title">👥 Gestion des utilisateurs</h2>
        <div className="users-management__controls">
          <span className="users-management__count">
            Total: {users.length} utilisateur{users.length !== 1 ? 's' : ''}
          </span>
          <button 
            className="users-management__refresh-btn"
            onClick={loadUsers}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="users-management__empty">
          <p>Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        <div className="users-management__table-container">
          <table className="users-management__table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user._id} 
                  className="users-management__row"
                  onClick={() => openUserProfile(user)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="users-management__avatar-cell">
                    <div className="users-management__avatar-wrapper">
                      <img 
                        src={user.photo || '/assets/img/default-avatar.png'} 
                        alt={`${user.prenom || ''} ${user.nom || ''}`}
                        className="users-management__avatar"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop if default image also fails
                          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="%23999"/><path fill="%23999" d="M20 19v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6z"/></svg>';
                        }}
                      />
                    </div>
                  </td>
                  <td className="users-management__name-cell">
                    <div className="users-management__name">
                      {user.prenom || user.firstName || user.first_name || ''} {user.nom || user.lastName || user.last_name || ''}
                    </div>
                    <div className="users-management__id">
                      ID: {user._id?.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="users-management__email-cell">
                    {user.email || 'N/A'}
                  </td>
                  <td className="users-management__role-cell">
                    <span className={`users-management__role users-management__role--${(user.role || user.userRole || 'user')?.toLowerCase()}`}>
                      {user.role || user.userRole || 'user'}
                    </span>
                  </td>
                  <td className="users-management__status-cell">
                    <span className={`users-management__status users-management__status--${user.status || 'pending'}`}>
                      {user.status === 'active' ? 'Actif' : user.status === 'inactive' ? 'Inactif' : 'En attente'}
                    </span>
                  </td>
                  <td className="users-management__date-cell">
                    {formatDate(user.date_inscription || user.createdAt || user.created_at || user.registrationDate || '')}
                  </td>
                  <td className="users-management__actions-cell">
                    <button 
                      className={`users-management__toggle-btn users-management__toggle-btn--${user.status === 'active' ? 'deactivate' : 'activate'}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click from triggering
                        toggleUserStatus(user._id, user.status);
                      }}
                      title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                    >
                      {user.status === 'active' ? '⏸️' : '▶️'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Profile Popup */}
      {showProfilePopup && selectedUser && (
        <div className="users-management__popup-overlay" onClick={closeUserProfile}>
          <div className="users-management__popup" onClick={(e) => e.stopPropagation()}>
            <div className="users-management__popup-header">
              <h3 className="users-management__popup-title">Profil de l'utilisateur</h3>
              <button 
                className="users-management__popup-close"
                onClick={closeUserProfile}
              >
                ✕
              </button>
            </div>
            <div className="users-management__popup-content">
              <div className="users-management__profile-header">
                <div className="users-management__profile-avatar-container">
                  <img 
                    src={selectedUser.photo || '/assets/img/default-avatar.png'} 
                    alt={`${selectedUser.prenom || ''} ${selectedUser.nom || ''}`}
                    className="users-management__profile-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="%23999"/><path fill="%23999" d="M20 19v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6z"/></svg>';
                    }}
                  />
                </div>
                <div className="users-management__profile-info">
                  <h4 className="users-management__profile-name">
                    {selectedUser.prenom || selectedUser.firstName || selectedUser.first_name || ''} {selectedUser.nom || selectedUser.lastName || selectedUser.last_name || ''}
                  </h4>
                  <p className="users-management__profile-email">{selectedUser.email || 'N/A'}</p>
                  <div className="users-management__profile-status-role">
                    <span className={`users-management__role users-management__role--${(selectedUser.role || selectedUser.userRole || 'user')?.toLowerCase()}`}>
                      {selectedUser.role || selectedUser.userRole || 'user'}
                    </span>
                    <span className={`users-management__status users-management__status--${selectedUser.status || 'pending'}`}>
                      {selectedUser.status === 'active' ? 'Actif' : selectedUser.status === 'inactive' ? 'Inactif' : 'En attente'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="users-management__profile-details">
                <div className="users-management__detail-row">
                  <span className="users-management__detail-label">ID:</span>
                  <span className="users-management__detail-value">{selectedUser._id || 'N/A'}</span>
                </div>
                
                <div className="users-management__detail-row">
                  <span className="users-management__detail-label">Date d'inscription:</span>
                  <span className="users-management__detail-value">
                    {formatDate(selectedUser.date_inscription || selectedUser.createdAt || selectedUser.created_at || selectedUser.registrationDate || '')}
                  </span>
                </div>
                
                <div className="users-management__detail-row">
                  <span className="users-management__detail-label">Bio:</span>
                  <span className="users-management__detail-value">{selectedUser.bio || 'N/A'}</span>
                </div>
                
                <div className="users-management__detail-row">
                  <span className="users-management__detail-label">Nombre de publications:</span>
                  <span className="users-management__detail-value">{selectedUser.postCount || 0}</span>
                </div>
                
                <div className="users-management__detail-row">
                  <span className="users-management__detail-label">Nombre d'abonnés:</span>
                  <span className="users-management__detail-value">{selectedUser.followerCount || 0}</span>
                </div>
                
                <div className="users-management__detail-row">
                  <span className="users-management__detail-label">Nombre d'abonnements:</span>
                  <span className="users-management__detail-value">{selectedUser.followingCount || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="users-management__popup-actions">
              <button 
                className={`users-management__toggle-btn users-management__toggle-btn--${selectedUser.status === 'active' ? 'deactivate' : 'activate'}`}
                onClick={() => toggleUserStatus(selectedUser._id, selectedUser.status)}
              >
                {selectedUser.status === 'active' ? '⏸️ Désactiver' : '▶️ Activer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;