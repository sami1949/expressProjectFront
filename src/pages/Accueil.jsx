import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import PublicationForm from '../components/posts/PublicationForm';
import PublicationList from '../components/posts/PublicationList';
import { postService } from '../services/postService';
import { toast } from 'react-toastify';
import './Acceuil.css';

const Accueil = () => {
  const { postId } = useParams(); // Get postId from URL params
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [singlePost, setSinglePost] = useState(null); // For displaying a single post

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

  // Fetch a single post by ID
  const fetchSinglePost = async (id) => {
    try {
      setLoading(true);
      const response = await postService.getPostById(id);
      
      if (response.success) {
        setSinglePost(response.data);
        setPosts([response.data]); // Display only this post
      } else {
        toast.error('Publication non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la publication:', error);
      toast.error('Impossible de charger la publication');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      // If postId is present in URL, fetch only that post
      fetchSinglePost(postId);
    } else {
      // Otherwise, fetch all posts
      fetchPosts();
    }
  }, [postId]);

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
    if (singlePost && singlePost._id === updatedPost._id) {
      setSinglePost(updatedPost);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
    if (singlePost && singlePost._id === postId) {
      setSinglePost(null);
    }
    toast.success('Publication supprimée');
  };

  return (
    <div className="accueil-page">
      <Navbar />
      
      <div className="accueil-container">
        <Sidebar />
        
        <main className="main-content">
          {/* Only show publication form if not viewing a single post */}
          {!postId && <PublicationForm onPostCreated={handleNewPost} />}
          
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
                singlePostMode={!!postId} // Pass flag for single post mode
              />
              
              {/* Only show load more button if not viewing a single post */}
              {!postId && hasMore && (
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