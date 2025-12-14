import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../../services/postService';
import { commentService } from '../../services/commentService';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import CommentWidget from '../comments/CommentWidget';
import './PublicationCard.css';

const PublicationCard = ({ post, onPostUpdate, onPostDelete }) => {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();

  const handleLike = async () => {
    try {
      const response = await postService.toggleLike(post._id);
      
      if (response.success) {
        setLiked(response.liked);
        setLikeCount(response.like_count);
        toast.success(response.liked ? '❤️ Post aimé !' : 'Like retiré');
      }
    } catch (error) {
      console.error('Erreur like:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du like');
    }
  };

  const handleCommentCountClick = () => {
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
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
        <span className="comment-count" onClick={handleCommentCountClick} style={{ cursor: 'pointer' }}>
          {post.comment_count || comments.length} Commentaires
        </span>
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
          onClick={handleCommentCountClick}
        >
          💬 Commenter
        </button>
        
        <button className="action-btn share-btn">
          🔗 Partager
        </button>
      </div>

      {showComments && (
        <CommentWidget 
          postId={post._id}
          onClose={handleCloseComments}
          initialComments={comments}
        />
      )}
    </div>
  );
};

export default PublicationCard;