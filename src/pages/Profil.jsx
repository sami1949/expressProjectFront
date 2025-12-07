import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import PublicationList from '../components/posts/PublicationList';
import { authService } from '../services/authService';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { followService } from '../services/followService';
import { toast } from 'react-toastify';
import './Profil.css';

const Profil = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    bio: '',
    photo: ''
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchProfile();
  }, [userId]); // Re-fetch when userId changes

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      console.log('Current user:', currentUser);
      console.log('URL userId:', userId);
      
      // If userId in URL, fetch that user's profile, otherwise fetch current user
      if (userId && currentUser && userId !== currentUser._id && userId !== currentUser.id) {
        // Viewing another user's profile
        setIsOwnProfile(false);
        console.log('Fetching profile for user:', userId);
        
        const response = await userService.getUserById(userId);
        console.log('User profile response:', response);
        
        if (response.success) {
          setUser(response.data);
          
          // Check if following this user
          try {
            const followStatus = await followService.checkFollowStatus(userId);
            console.log('Follow status:', followStatus);
            setIsFollowing(followStatus.data?.following || followStatus.following || false);
          } catch (err) {
            console.error('Error checking follow status:', err);
          }
          
          // Fetch user's posts
          const postsResponse = await postService.getUserPosts(userId);
          if (postsResponse.success) {
            setPosts(postsResponse.data);
          }
        } else {
          toast.error(response.message || 'Utilisateur introuvable');
        }
      } else {
        // Viewing own profile
        setIsOwnProfile(true);
        console.log('Fetching own profile');
        
        const response = await authService.getProfile();
        
        if (response.success) {
          setUser(response.data);
          setFormData({
            nom: response.data.nom || '',
            prenom: response.data.prenom || '',
            bio: response.data.bio || '',
            photo: response.data.photo || ''
          });
          
          // Fetch user's posts
          const postsResponse = await postService.getUserPosts(response.data._id);
          if (postsResponse.success) {
            setPosts(postsResponse.data);
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Erreur lors du chargement du profil';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await authService.updateProfile(formData);
      if (response.success) {
        setUser(response.data);
        setEditing(false);
        toast.success('Profil mis à jour avec succès');
        
        // Update local storage
        const currentUser = authService.getCurrentUser();
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const handleFollow = async () => {
    try {
      const response = await followService.toggleFollow(userId);
      if (response.success) {
        setIsFollowing(!isFollowing);
        const message = response.status === 'following' || response.status === 'accepted' 
          ? 'Vous suivez maintenant cet utilisateur' 
          : 'Vous ne suivez plus cet utilisateur';
        toast.success(message);
      }
    } catch (error) {
      console.error('Erreur follow:', error);
      toast.error('Erreur lors de l\'action');
    }
  };

  const handleSendMessage = () => {
    navigate(`/messages?userId=${userId}`);
  };

  if (loading) {
    return (
      <div className="profil-page">
        <Navbar />
        <div className="loading-container">
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-page">
      <Navbar />
      
      <div className="profil-container">
        <Sidebar />
        
        <main className="profil-content">
          <div className="profil-header">
            <div className="cover-photo">
              <img src="/default-cover.jpg" alt="Cover" className="cover-img" />
            </div>
            
            <div className="profil-info">
              <div className="profil-picture">
                <img 
                  src={user?.photo || '/default-avatar.jpg'} 
                  alt="Profil" 
                  className="profil-avatar"
                />
              </div>
              
              <div className="profil-details">
                <h1 className="profil-name">
                  {user?.prenom} {user?.nom}
                </h1>
                <p className="profil-email">{user?.email}</p>
                {user?.bio && <p className="profil-bio">{user.bio}</p>}
              </div>
              
              {isOwnProfile ? (
                <button 
                  className="edit-profil-btn"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? 'Annuler' : '✏️ Modifier le profil'}
                </button>
              ) : (
                <div className="profile-actions">
                  <button 
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? '✓ Abonné' : '+ Suivre'}
                  </button>
                  <button 
                    className="message-btn"
                    onClick={handleSendMessage}
                  >
                    💬 Message
                  </button>
                </div>
              )}
            </div>
          </div>

          {isOwnProfile && editing && (
            <div className="profil-edit-form">
              <h2>Modifier le profil</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="prenom">Prénom</label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nom">Nom</label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Parlez de vous..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="photo">URL de la photo</label>
                  <input
                    type="text"
                    id="photo"
                    name="photo"
                    value={formData.photo}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>

                <button type="submit" className="save-btn">
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          )}

          <div className="profil-posts">
            <h2>Publications ({posts.length})</h2>
            <PublicationList 
              posts={posts}
              onPostDelete={handlePostDelete}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profil;