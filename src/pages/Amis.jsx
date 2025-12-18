import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { userService } from '../services/userService';
import { followService } from '../services/followService';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import './Amis.css';

const Amis = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions', 'followers', 'following'
  const [users, setUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [allFollowers, setAllFollowers] = useState([]); // Store all followers for search reset
  const [allFollowing, setAllFollowing] = useState([]); // Store all following for search reset
  const [allSuggestions, setAllSuggestions] = useState([]); // Store all suggestions for search reset
  const [followerSearchQuery, setFollowerSearchQuery] = useState(''); // Search query for followers
  const [followingSearchQuery, setFollowingSearchQuery] = useState(''); // Search query for following
  const [suggestionSearchQuery, setSuggestionSearchQuery] = useState(''); // Search query for suggestions
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState(new Set());
  const currentUser = authService.getCurrentUser();

  // Debug: Log when component mounts
  console.log('Amis component mounted');
  console.log('Current user:', currentUser);

  // If no current user, redirect to login
  if (!currentUser) {
    console.log('No current user, redirecting to login');
    window.location.href = '/connexion';
    return null;
  }

  // Load data when component mounts
  useEffect(() => {
    console.log('useEffect triggered');
    if (currentUser) {
      console.log('Loading data for user:', currentUser);
      // Load all data in parallel
      Promise.all([
        loadFollowers(),
        loadFollowing(),
        loadSuggestions()
      ]).catch(error => {
        console.error('Error loading initial data:', error);
        toast.error(t('errorLoadingData'));
      });
    } else {
      console.log('No current user found');
    }
  }, []);

  // Add a check for when data is loaded
  useEffect(() => {
    console.log('Data updated:', { users, followers, following });
  }, [users, followers, following]);

  const loadFollowers = async () => {
    console.log('Loading followers...');
    try {
      setLoading(true);
      const response = await followService.getFollowers(currentUser.id);
      console.log('Followers response:', response);
      if (response.success) {
        setFollowers(response.data);
        setAllFollowers(response.data); // Store all followers for search reset
        
        // Check which followers the current user is following
        // Extract follower IDs
        const followerIds = response.data.map(f => f.suiveur?._id).filter(id => id);
        console.log('Follower IDs to check follow status:', followerIds);
        
        // Check follow status for each follower
        checkFollowStatusForUsers(followerIds);
      } else {
        console.error('Failed to load followers:', response.message);
        toast.error(response.message || t('errorLoadingFollowers'));
      }
    } catch (error) {
      console.error('Erreur chargement followers:', error);
      toast.error(t('errorLoadingFollowers') + ': ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    console.log('Loading following...');
    try {
      setLoading(true);
      const response = await followService.getFollowing(currentUser.id);
      console.log('Following response:', response);
      if (response.success) {
        setFollowing(response.data);
        setAllFollowing(response.data); // Store all following for search reset
        // Create a set of following user IDs for quick lookup
        // For following data, the user ID is in the 'suivi._id' field
        const ids = new Set(response.data.map(f => f.suivi?._id));
        setFollowingIds(ids);
      } else {
        console.error('Failed to load following:', response.message);
        toast.error(response.message || t('errorLoadingFollowing'));
      }
    } catch (error) {
      console.error('Erreur chargement following:', error);
      toast.error(t('errorLoadingFollowing') + ': ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    console.log('Loading suggestions...');
    try {
      setLoading(true);
      // Get user suggestions from the new endpoint
      const response = await userService.getUserSuggestions(1, 10);
      console.log('Suggestions response:', response);
      if (response.success) {
        setUsers(response.data); // Already filtered by backend
        setAllSuggestions(response.data); // Store all suggestions for search reset
      } else {
        console.error('Failed to load suggestions:', response.message);
        toast.error(response.message || t('errorLoadingSuggestions'));
      }
    } catch (error) {
      console.error('Erreur chargement suggestions:', error);
      toast.error(t('errorLoadingSuggestions') + ': ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // New function to check follow status for multiple users
  const checkFollowStatusForUsers = async (userIds) => {
    try {
      // Create a set of user IDs that the current user is following
      const followingSet = new Set();
      
      // For each user ID, check if current user is following them
      for (const userId of userIds) {
        try {
          const statusResponse = await followService.checkFollowStatus(userId);
          if (statusResponse.success && statusResponse.following) {
            followingSet.add(userId);
          }
        } catch (error) {
          console.error(`Error checking follow status for user ${userId}:`, error);
        }
      }
      
      setFollowingIds(followingSet);
    } catch (error) {
      console.error('Error checking follow status for users:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Get the appropriate search query based on active tab
    let query = '';
    if (activeTab === 'followers') {
      query = followerSearchQuery;
    } else if (activeTab === 'following') {
      query = followingSearchQuery;
    } else {
      query = suggestionSearchQuery;
    }
    
    if (!query.trim()) return;

    try {
      setLoading(true);
      
      if (activeTab === 'following') {
        // Search following users locally (client-side search)
        const filteredFollowing = allFollowing.filter(follow => {
          const user = follow.suivi; // Following data is in suivi field
          if (!user) return false;
          const fullName = `${user.prenom || ''} ${user.nom || ''}`.toLowerCase();
          return fullName.includes(query.toLowerCase());
        });
        setFollowing(filteredFollowing);
      } else if (activeTab === 'followers') {
        // Search followers - filter existing followers locally
        const filteredFollowers = allFollowers.filter(follow => {
          const user = follow.suiveur; // Follower data is in suiveur field
          if (!user) return false;
          const fullName = `${user.prenom || ''} ${user.nom || ''}`.toLowerCase();
          return fullName.includes(query.toLowerCase());
        });
        setFollowers(filteredFollowers);
      } else {
        // Search suggestions
        const filteredSuggestions = allSuggestions.filter(user => {
          const fullName = `${user.prenom || ''} ${user.nom || ''}`.toLowerCase();
          return fullName.includes(query.toLowerCase());
        });
        setUsers(filteredSuggestions);
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
      toast.error(t('errorSearching'));
    } finally {
      setLoading(false);
    }
  };

  // Real-time search function
  const handleRealTimeSearch = async (query, tabType) => {
    if (!query.trim()) {
      // If query is empty, reset to full list
      if (tabType === 'followers') {
        setFollowers(allFollowers);
      } else if (tabType === 'following') {
        setFollowing(allFollowing);
      } else {
        setUsers(allSuggestions);
      }
      return;
    }

    try {
      if (tabType === 'following') {
        // Search following users locally (client-side search)
        const filteredFollowing = allFollowing.filter(follow => {
          const user = follow.suivi; // Following data is in suivi field
          if (!user) return false;
          const fullName = `${user.prenom || ''} ${user.nom || ''}`.toLowerCase();
          return fullName.includes(query.toLowerCase());
        });
        setFollowing(filteredFollowing);
      } else if (tabType === 'followers') {
        // Search followers - filter existing followers locally
        const filteredFollowers = allFollowers.filter(follow => {
          const user = follow.suiveur; // Follower data is in suiveur field
          if (!user) return false;
          const fullName = `${user.prenom || ''} ${user.nom || ''}`.toLowerCase();
          return fullName.includes(query.toLowerCase());
        });
        setFollowers(filteredFollowers);
      } else {
        // Search suggestions
        const filteredSuggestions = allSuggestions.filter(user => {
          const fullName = `${user.prenom || ''} ${user.nom || ''}`.toLowerCase();
          return fullName.includes(query.toLowerCase());
        });
        setUsers(filteredSuggestions);
      }
    } catch (error) {
      console.error('Erreur recherche en temps réel:', error);
    }
  };

  // Test API connectivity
  const testApiConnectivity = async () => {
    try {
      console.log('Testing API connectivity...');
      // Test user suggestions endpoint
      const testResponse = await userService.getUserSuggestions(1, 5);
      console.log('API test response:', testResponse);
      if (testResponse.success) {
        toast.success(t('apiConnectionSuccess'));
      } else {
        toast.error(t('apiConnectionFailed') + ': ' + testResponse.message);
      }
    } catch (error) {
      console.error('API test failed:', error);
      toast.error(t('apiConnectionError') + ': ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFollow = async (userId, userName) => {
    try {
      const response = await followService.toggleFollow(userId);
      if (response.success) {
        if (response.status === 'following' || response.status === 'accepted') {
          setFollowingIds(prev => new Set([...prev, userId]));
          toast.success(t('nowFollowing').replace('{userName}', userName));
          // Refresh suggestions to remove followed user
          if (activeTab === 'suggestions') {
            loadSuggestions();
          }
        } else {
          setFollowingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          toast.success(t('unfollowed').replace('{userName}', userName));
        }
        // Reload lists
        loadFollowers();
        loadFollowing();
      }
    } catch (error) {
      console.error('Erreur follow:', error);
      toast.error(t('errorFollowingAction'));
    }
  };

  const renderUserCard = (user, showFollowBtn = true) => {
    // Handle different user object structures
    // For followers: user.suiveur contains the follower data
    // For following: user.suivi contains the followed user data
    // For suggestions: user contains the user data directly
    let userData = user;
    
    // Check if this is a follow relationship object
    if (user && user.suiveur) {
      // This is a follower relationship, get follower data
      userData = user.suiveur;
    } else if (user && user.suivi) {
      // This is a following relationship, get followed user data
      userData = user.suivi;
    } else if (user && user.utilisateur) {
      // This is for backward compatibility
      userData = user.utilisateur;
    } else if (user && user.utilisateur_suivi) {
      // This is for backward compatibility
      userData = user.utilisateur_suivi;
    }
    
    // Ensure we have valid user data
    if (!userData) {
      console.warn('Invalid user data:', user);
      return null;
    }
    
    const isFollowing = followingIds.has(userData._id);
    
    return (
      <div key={userData._id} className="user-card">
        <div className="user-card-header">
          <div className="user-avatar-container">
            <img 
              src={userData.photo || 'https://via.placeholder.com/80?text=User'} 
              alt={`${userData.prenom || ''} ${userData.nom || ''}`}
              className="user-avatar"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/80?text=User';
              }}
            />
            <div className="user-status-indicator"></div>
          </div>
          <div className="user-info">
            <h3 className="user-name">
              {userData.prenom || ''} {userData.nom || ''}
            </h3>
            {userData.bio ? (
              <p className="user-bio">{userData.bio}</p>
            ) : (
              <p className="user-no-bio">{t('noBioAvailable')}</p>
            )}
            <div className="user-meta">
              <span className="user-followers-count">
                <i className="fas fa-users"></i> 
                {userData.followerCount || 0} {t('followers')}
              </span>
              <span className="user-posts-count">
                <i className="fas fa-file-alt"></i> 
                {userData.postCount || 0} {t('posts')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="user-card-footer">
          {showFollowBtn && (
            <button 
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={() => handleFollow(userData._id, `${userData.prenom || ''} ${userData.nom || ''}`)}
            >
              {isFollowing ? (
                <>
                  <i className="fas fa-check"></i> {t('following')}
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i> {t('follow')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Debug: Log state values
  console.log('State values:', { users, followers, following, loading });

  // Check if we have any data or if we're still loading
  const hasData = users.length > 0 || followers.length > 0 || following.length > 0;
  const isLoadingComplete = !loading && (users.length > 0 || followers.length > 0 || following.length > 0 || 
                               (users.length === 0 && followers.length === 0 && following.length === 0));

  console.log('Data status:', { hasData, isLoadingComplete });

  // If we've finished loading and have no data, show a message
  if (!loading && !hasData && isLoadingComplete) {
    console.log('No data available for any section');
  }

  return (
    <div className="amis-page">
      <Navbar />
      
      <div className="amis-container">
        <Sidebar />
        
        <main className="amis-content">
          <h1 className="page-title">{t('friendsAndSubscriptions')}</h1>
          
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('suggestions');
                setSuggestionSearchQuery(''); // Clear search query
                setUsers(allSuggestions); // Restore full suggestions list
                loadSuggestions();
              }}
            >
              💡 {t('suggestions')}
            </button>
            <button 
              className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('followers');
                setFollowerSearchQuery(''); // Clear search query
                setFollowers(allFollowers); // Restore full followers list
                loadFollowers(); // Reload followers data when switching to this tab
              }}
            >
              👥 {t('followers')} ({followers.length})
            </button>
            <button 
              className={`tab ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('following');
                setFollowingSearchQuery(''); // Clear search query
                setFollowing(allFollowing); // Restore full following list
                loadFollowing(); // Reload following data when switching to this tab
              }}
            >
              ❤️ {t('subscriptions')} ({following.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'suggestions' && (
              <div className="suggestions-section">
                <div className="section-header">
                  <h2>{t('suggestedPeople')}</h2>
                  <p>{t('discoverNewPeople')}</p>
                </div>
                
                <div className="search-bar">
                  <form onSubmit={handleSearch} className="search-form">
                    <input
                      type="text"
                      placeholder={t('searchSuggestions')}
                      value={suggestionSearchQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSuggestionSearchQuery(value);
                        handleRealTimeSearch(value, 'suggestions');
                      }}
                      className="search-input"
                    />
                    <button type="submit" className="search-btn" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="loading-spinner"></span> {t('searching')}
                        </>
                      ) : (
                        '🔍 {t("search")}'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="reset-btn"
                      onClick={() => {
                        setSuggestionSearchQuery('');
                        setUsers(allSuggestions);
                      }}
                      disabled={!suggestionSearchQuery}
                    >
                      🔄 {t('reset')}
                    </button>
                  </form>
                </div>
                
                <div className="users-list">
                  {loading ? (
                    <div className="loading-container">
                      <span className="loading-spinner"></span>
                      <span>{t('loadingSuggestions')}</span>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="empty-state">
                      <h3>{t('noSuggestionsAvailable')}</h3>
                      <p>{t('noSuggestionsMessage')}</p>
                      {!isLoadingComplete && (
                        <button onClick={loadSuggestions} className="retry-btn">
                          {t('retry')}
                        </button>
                      )}
                    </div>
                  ) : (
                    users.map(user => renderUserCard(user)).filter(card => card !== null) // Filter out null cards
                  )}
                </div>
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="followers-section">
                <div className="section-header">
                  <h2>{t('yourFollowers')}</h2>
                  <p>{t('peopleFollowingYou')}</p>
                </div>
                
                <div className="search-bar">
                  <form onSubmit={handleSearch} className="search-form">
                    <input
                      type="text"
                      placeholder={t('searchFollowers')}
                      value={followerSearchQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFollowerSearchQuery(value);
                        handleRealTimeSearch(value, 'followers');
                      }}
                      className="search-input"
                    />
                    <button type="submit" className="search-btn" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="loading-spinner"></span> {t('searching')}
                        </>
                      ) : (
                        '🔍 {t("search")}'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="reset-btn"
                      onClick={() => {
                        setFollowerSearchQuery('');
                        setFollowers(allFollowers);
                      }}
                      disabled={!followerSearchQuery}
                    >
                      🔄 {t('reset')}
                    </button>
                  </form>
                </div>
                
                <div className="users-list">
                  {loading ? (
                    <div className="loading-container">
                      <span className="loading-spinner"></span>
                      <span>{t('loadingFollowers')}</span>
                    </div>
                  ) : followers.length === 0 ? (
                    <div className="empty-state">
                      <h3>{t('noFollowers')}</h3>
                      <p>{t('noFollowersMessage')}</p>
                      {!isLoadingComplete && (
                        <button onClick={loadFollowers} className="retry-btn">
                          {t('retry')}
                        </button>
                      )}
                    </div>
                  ) : (
                    followers.map(follow => 
                      renderUserCard(follow, true)
                    ).filter(card => card !== null) // Filter out null cards
                  )}
                </div>
              </div>
            )}

            {activeTab === 'following' && (
              <div className="following-section">
                <div className="section-header">
                  <h2>{t('subscriptions')}</h2>
                  <p>{t('peopleYouFollow')}</p>
                </div>
                
                <div className="search-bar">
                  <form onSubmit={handleSearch} className="search-form">
                    <input
                      type="text"
                      placeholder={t('searchSubscriptions')}
                      value={followingSearchQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFollowingSearchQuery(value);
                        handleRealTimeSearch(value, 'following');
                      }}
                      className="search-input"
                    />
                    <button type="submit" className="search-btn" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="loading-spinner"></span> {t('searching')}
                        </>
                      ) : (
                        '🔍 {t("search")}'
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="reset-btn"
                      onClick={() => {
                        setFollowingSearchQuery('');
                        setFollowing(allFollowing);
                      }}
                      disabled={!followingSearchQuery}
                    >
                      🔄 {t('reset')}
                    </button>
                  </form>
                </div>
                
                <div className="users-list">
                  {loading ? (
                    <div className="loading-container">
                      <span className="loading-spinner"></span>
                      <span>{t('loadingSubscriptions')}</span>
                    </div>
                  ) : following.length === 0 ? (
                    <div className="empty-state">
                      <h3>{t('noSubscriptions')}</h3>
                      <p>{t('noSubscriptionsMessage')}</p>
                      {!isLoadingComplete && (
                        <button onClick={loadFollowing} className="retry-btn">
                          {t('retry')}
                        </button>
                      )}
                    </div>
                  ) : (
                    following.map(follow => 
                      renderUserCard(follow, true)
                    ).filter(card => card !== null) // Filter out null cards
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