import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { userService } from '../services/userService';
import { followService } from '../services/followService';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import './Amis.css';

const Amis = () => {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'followers', 'following'
  const [users, setUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState(new Set());
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadFollowers();
      loadFollowing();
    }
  }, []);

  const loadFollowers = async () => {
    try {
      const response = await followService.getFollowers(currentUser.id);
      if (response.success) {
        setFollowers(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement followers:', error);
    }
  };

  const loadFollowing = async () => {
    try {
      const response = await followService.getFollowing(currentUser.id);
      if (response.success) {
        setFollowing(response.data);
        // Create a set of following user IDs for quick lookup
        const ids = new Set(response.data.map(f => f.utilisateur_suivi?._id));
        setFollowingIds(ids);
      }
    } catch (error) {
      console.error('Erreur chargement following:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await userService.searchUsers(searchQuery);
      if (response.success) {
        // Filter out current user
        const filteredUsers = response.data.filter(u => u._id !== currentUser.id);
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const response = await followService.toggleFollow(userId);
      if (response.success) {
        if (response.following) {
          setFollowingIds(prev => new Set([...prev, userId]));
          toast.success('Vous suivez maintenant cet utilisateur');
        } else {
          setFollowingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          toast.success('Vous ne suivez plus cet utilisateur');
        }
        // Reload following list
        loadFollowing();
      }
    } catch (error) {
      console.error('Erreur follow:', error);
      toast.error('Erreur lors de l\'action');
    }
  };

  const renderUserCard = (user, showFollowBtn = true) => (
    <div key={user._id} className="user-card">
      <img 
        src={user.photo || '/default-avatar.jpg'} 
        alt={user.fullName || `${user.prenom} ${user.nom}`}
        className="user-avatar"
      />
      <div className="user-info">
        <h3 className="user-name">
          {user.prenom} {user.nom}
        </h3>
        {user.bio && <p className="user-bio">{user.bio}</p>}
        <p className="user-email">{user.email}</p>
      </div>
      {showFollowBtn && (
        <button 
          className={`follow-btn ${followingIds.has(user._id) ? 'following' : ''}`}
          onClick={() => handleFollow(user._id)}
        >
          {followingIds.has(user._id) ? 'Ne plus suivre' : 'Suivre'}
        </button>
      )}
    </div>
  );

  return (
    <div className="amis-page">
      <Navbar />
      
      <div className="amis-container">
        <Sidebar />
        
        <main className="amis-content">
          <h1 className="page-title">Amis & Abonnements</h1>
          
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              🔍 Rechercher
            </button>
            <button 
              className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              👥 Abonnés ({followers.length})
            </button>
            <button 
              className={`tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              ❤️ Abonnements ({following.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'search' && (
              <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    type="text"
                    placeholder="Rechercher des utilisateurs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="search-btn" disabled={loading}>
                    {loading ? 'Recherche...' : 'Rechercher'}
                  </button>
                </form>

                <div className="users-list">
                  {users.length === 0 ? (
                    <p className="no-results">Recherchez des utilisateurs pour les suivre</p>
                  ) : (
                    users.map(user => renderUserCard(user))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="followers-section">
                <div className="users-list">
                  {followers.length === 0 ? (
                    <p className="no-results">Vous n'avez pas encore d'abonnés</p>
                  ) : (
                    followers.map(follow => 
                      renderUserCard(follow.utilisateur, true)
                    )
                  )}
                </div>
              </div>
            )}

            {activeTab === 'following' && (
              <div className="following-section">
                <div className="users-list">
                  {following.length === 0 ? (
                    <p className="no-results">Vous ne suivez personne pour le moment</p>
                  ) : (
                    following.map(follow => 
                      renderUserCard(follow.utilisateur_suivi, true)
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Amis;