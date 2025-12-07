import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import PublicationForm from '../components/posts/PublicationForm';
import PublicationList from '../components/posts/PublicationList';
import { postService } from '../services/postService';
import { toast } from 'react-toastify';
import './Acceuil.css';

const Accueil = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts from backend
  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await postService.getAllPosts(pageNum, 10);
      
      if (response.success) {
        if (pageNum === 1) {
          setPosts(response.data);
        } else {
          setPosts(prev => [...prev, ...response.data]);
        }
        
        // Check if there are more pages
        setHasMore(response.pagination.page < response.pagination.pages);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
      toast.error('Impossible de charger les publications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
    toast.success('Publication créée avec succès !');
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
    toast.success('Publication supprimée');
  };

  return (
    <div className="accueil-page">
      <Navbar />
      
      <div className="accueil-container">
        <Sidebar />
        
        <main className="main-content">
          <PublicationForm onPostCreated={handleNewPost} />
          
          {loading && posts.length === 0 ? (
            <div className="loading-posts">
              <p>Chargement des publications...</p>
            </div>
          ) : (
            <>
              <PublicationList 
                posts={posts}
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
              />
              
              {hasMore && (
                <button 
                  className="load-more-btn" 
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : 'Voir plus de publications'}
                </button>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Accueil;