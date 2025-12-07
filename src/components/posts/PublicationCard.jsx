import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../../services/postService';
import { commentService } from '../../services/commentService';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import './PublicationCard.css';

const PublicationCard = ({ post, onPostUpdate, onPostDelete }) => {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();

  const handleLike = async () => {
    try {
      console.log('Toggling like for post:', post._id);
      console.log('Current state - liked:', liked, 'count:', likeCount);
      
      const response = await postService.toggleLike(post._id);
      console.log('Like response:', response);
      
      if (response.success) {
        setLiked(response.liked);
        setLikeCount(response.like_count);
        console.log('New state - liked:', response.liked, 'count:', response.like_count);
        toast.success(response.liked ? '❤️ Post aimé !' : 'Like retiré');
      }
    } catch (error) {
      console.error('Erreur like:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors du like');
    }
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    try {
      setLoadingComments(true);
      const response = await commentService.getPostComments(post._id);
      if (response.success) {
        setComments(response.data);
        setShowComments(true);
      }
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await commentService.createComment(post._id, commentText.trim());
      if (response.success) {
        setComments([response.data, ...comments]);
        setCommentText('');
        toast.success('Commentaire ajouté');
      }
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette publication ?')) {
      return;
    }

    try {
      const response = await postService.deletePost(post._id);
      if (response.success) {
        onPostDelete && onPostDelete(post._id);
      }
    } catch (error) {
      console.error('Erreur suppression post:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const isOwner = currentUser?.id === post.auteur?._id || currentUser?.id === post.id_user;

  const handleAuthorClick = () => {
    const authorId = post.auteur?._id || post.id_user;
    if (authorId && authorId !== currentUser?.id) {
      navigate(`/profil?id=${authorId}`);
    } else if (authorId === currentUser?.id) {
      navigate('/profil');
    }
  };

  return (
    <div className="publication-card">
      <div className="post-header">
        <div className="author-info">
          <img 
            src={post.auteur?.photo || '/default-avatar.jpg'} 
            alt="Auteur" 
            className="post-author-avatar"
            onClick={handleAuthorClick}
            style={{ cursor: 'pointer' }}
          />
          <div className="author-details">
            <h4 
              className="author-name"
              onClick={handleAuthorClick}
              style={{ cursor: 'pointer' }}
            >
              {post.auteur?.prenom} {post.auteur?.nom}
            </h4>
            <span className="post-time">
              {formatDate(post.date_creation)}
            </span>
          </div>
        </div>
        {isOwner && (
          <button className="delete-post-btn" onClick={handleDeletePost}>
            ✕
          </button>
        )}
      </div>

      <div className="post-content">
        <p>{post.contenu}</p>
        {post.image && (
          <img src={post.image} alt="Post" className="post-image" />
        )}
      </div>

      <div className="post-stats">
        <span className="like-count">{likeCount} J'aime</span>
        <span className="comment-count">{post.comment_count || comments.length} Commentaires</span>
      </div>

      <div className="post-actions">
        <button 
          className={`action-btn like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {liked ? '❤️ Aimé' : '🤍 J\'aime'}
        </button>
        
        <button 
          className="action-btn comment-btn"
          onClick={loadComments}
        >
          💬 Commenter
        </button>
        
        <button className="action-btn share-btn">
          🔗 Partager
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleSubmitComment} className="comment-form">
            <img 
              src={currentUser?.photo || 'https://via.placeholder.com/40?text=User'} 
              alt="Vous" 
              className="comment-avatar"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/40?text=User';
              }}
            />
            <input
              type="text"
              placeholder="Écrire un commentaire..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button 
              type="submit" 
              disabled={submittingComment || !commentText.trim()}
              className="comment-submit-btn"
            >
              {submittingComment ? '...' : 'Envoyer'}
            </button>
          </form>

          <div className="comments-list">
            {loadingComments ? (
              <p className="loading-text">Chargement des commentaires...</p>
            ) : comments.length === 0 ? (
              <p className="no-comments">Aucun commentaire pour le moment</p>
            ) : (
              comments.map(comment => (
                <div key={comment._id} className="comment-item">
                  <img 
                    src={comment.auteur?.photo || 'https://via.placeholder.com/32?text=User'} 
                    alt="Auteur" 
                    className="comment-avatar"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/32?text=User';
                    }}
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.auteur?.prenom} {comment.auteur?.nom}
                      </span>
                      <span className="comment-time">
                        {formatDate(comment.date_creation)}
                      </span>
                    </div>
                    <p className="comment-text">{comment.contenu}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationCard;