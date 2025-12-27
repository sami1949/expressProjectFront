import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import PublicationList from '../components/posts/PublicationList';
import { authService } from '../services/authService';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { followService } from '../services/followService';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import './Profil.css';

const Profil = () => {
  const { t } = useLanguage();
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
    photo: '',
    coverPhoto: '' // Added cover photo field
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewCover, setPreviewCover] = useState(null); // Added cover preview state
  const fileInputRef = useRef(null);
  const coverFileInputRef = useRef(null); // Added cover file input ref
  const navigate = useNavigate();
  const { userId } = useParams();
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
          toast.error(response.message || t('userNotFound'));
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
            photo: response.data.photo || '',
            coverPhoto: response.data.coverPhoto || '/default-cover.jpg' // Added cover photo
          });
          
          // Fetch user's posts
          const postsResponse = await postService.getUserPosts(response.data._id);
          if (postsResponse.success) {
            setPosts(postsResponse.data);
          }
        }
      }
    } catch (error) {
      console.error(t('errorLoadingProfile'), error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || t('errorLoadingProfile');
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

  const handleImageClick = () => {
    if (isOwnProfile && editing) {
      fileInputRef.current.click();
    }
  };

  const handleCoverClick = () => {
    if (isOwnProfile && editing) {
      coverFileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error(t('selectValidImage'));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('imageSizeLimit'));
        return;
      }
      
      // Create preview and compress image
      const reader = new FileReader();
      reader.onload = (e) => {
        // Compress image before sending
        const compressedImage = compressImage(e.target.result);
        setPreviewImage(compressedImage);
        setFormData(prev => ({
          ...prev,
          photo: compressedImage
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error(t('selectValidImage'));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('imageSizeLimit'));
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const coverImage = e.target.result;
        setPreviewCover(coverImage);
        setFormData(prev => ({
          ...prev,
          coverPhoto: coverImage
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to compress image
  const compressImage = (imageSrc) => {
    // For now, we'll just resize large images
    // In a real app, you might use a library like browser-image-compression
    return imageSrc; // Placeholder - actual compression would go here
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate photo size before sending
      if (formData.photo && formData.photo.length > 2 * 1024 * 1024 * 1.37) {
        toast.error(t('imageTooLarge'));
        return;
      }
      
      const response = await authService.updateProfile(formData);
      if (response.success) {
        setUser(response.data);
        setEditing(false);
        setPreviewImage(null);
        setPreviewCover(null); // Reset cover preview
        toast.success(t('profileUpdatedSuccessfully'));
        
        // Update local storage
        const currentUser = authService.getCurrentUser();
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...response.data
        }));
      }
    } catch (error) {
      console.error(t('errorUpdatingProfile'), error);
      const errorMessage = error.response?.data?.message || error.message || t('errorUpdatingProfile');
      toast.error(errorMessage);
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
          ? t('nowFollowingUser') 
          : t('unfollowedUser');
        toast.success(message);
      }
    } catch (error) {
      console.error(t('errorFollowingAction'), error);
      toast.error(t('errorFollowingAction'));
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
          <p>{t('loadingProfile')}</p>
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
              <img 
                src={previewCover || user?.coverPhoto || '/default-cover.jpg'} 
                alt="Cover" 
                className="cover-img"
                onClick={isOwnProfile && editing ? handleCoverClick : undefined}
                style={{ cursor: isOwnProfile && editing ? 'pointer' : 'default' }}
              />
              {isOwnProfile && editing && (
                <input
                  type="file"
                  ref={coverFileInputRef}
                  onChange={handleCoverChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              )}
            </div>
            
            <div className="profil-info">
              <div className="profil-picture">
                <img 
                  src={previewImage || user?.photo || '/default-avatar.jpg'} 
                  alt="Profil" 
                  className="profil-avatar"
                  onClick={handleImageClick}
                  style={{ cursor: isOwnProfile && editing ? 'pointer' : 'default' }}
                />
                {isOwnProfile && editing && (
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                )}
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
                  {editing ? t('cancel') : '✏️ ' + t('editProfile')}
                </button>
              ) : (
                <div className="profile-actions">
                  <button 
                    className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollow}
                  >
                    {isFollowing ? '✓ ' + t('following') : '+ ' + t('follow')}
                  </button>
                  <button 
                    className="message-btn"
                    onClick={handleSendMessage}
                  >
                    💬 {t('message')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {isOwnProfile && editing && (
            <div className="profil-edit-form">
              <h2>{t('editProfile')}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="prenom">{t('firstName')}</label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nom">{t('lastName')}</label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">{t('bio')}</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder={t('talkAboutYourself')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="photo">{t('profilePicture')}</label>
                  <div className="profile-photo-upload">
                    <img 
                      src={previewImage || formData.photo || '/default-avatar.jpg'} 
                      alt="Preview" 
                      className="profile-photo-preview"
                      onClick={handleImageClick}
                    />
                    <button 
                      type="button" 
                      className="change-photo-btn"
                      onClick={handleImageClick}
                    >
                      {t('changePhoto')}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="coverPhoto">{t('coverPhoto')}</label>
                  <div className="profile-photo-upload">
                    <img 
                      src={previewCover || formData.coverPhoto || '/default-cover.jpg'} 
                      alt="Cover Preview" 
                      className="profile-photo-preview"
                      style={{ width: '100%', height: '150px', borderRadius: '8px' }}
                      onClick={handleCoverClick}
                    />
                    <button 
                      type="button" 
                      className="change-photo-btn"
                      onClick={handleCoverClick}
                    >
                      {t('changeCoverPhoto')}
                    </button>
                  </div>
                </div>

                <button type="submit" className="save-btn">
                  {t('saveChanges')}
                </button>
              </form>
            </div>
          )}

          <div className="profil-posts">
            <h2>{t('posts')} ({posts.length})</h2>
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