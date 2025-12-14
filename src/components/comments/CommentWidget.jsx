import React, { useState, useEffect } from 'react';
import { commentService } from '../../services/commentService';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import './CommentWidget.css';

const CommentWidget = ({ postId, onClose, initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    // Store original styles to restore later
    const originalStyles = {
      overflow: document.body.style.overflow,
      cursor: document.body.style.cursor,
      transition: document.body.style.transition,
      animation: document.body.style.animation
    };
    
    // Disable all animations/transitions globally
    const style = document.createElement('style');
    style.id = 'comment-widget-styles';
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        transition: none !important;
        animation: none !important;
        transform: none !important;
        will-change: auto !important;
      }
    `;
    document.head.appendChild(style);
    
    // Apply our styles
    document.body.style.overflow = 'hidden';
    document.body.style.cursor = 'none';
    
    return () => {
      // Restore original styles
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.cursor = originalStyles.cursor;
      
      // Remove our style element
      const widgetStyle = document.getElementById('comment-widget-styles');
      if (widgetStyle) {
        widgetStyle.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (initialComments.length === 0) {
      loadComments();
    }
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getPostComments(postId);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const response = await commentService.createComment(postId, commentText.trim());
      if (response.success) {
        setComments([response.data, ...comments]);
        setCommentText('');
        toast.success('Commentaire ajouté');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div 
      className="comment-widget-overlay" 
      onClick={onClose}
      style={{ cursor: 'none' }}
    >
      <div 
        className="comment-widget" 
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: 'auto' }}
      >
        <div className="comment-widget-header">
          <h3>Commentaires</h3>
          <button 
            className="close-widget-btn" 
            onClick={onClose}
            style={{ cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <form 
          onSubmit={handleSubmitComment} 
          className="comment-form"
        >
          <img 
            src={currentUser?.photo || 'https://via.placeholder.com/40?text=User'} 
            alt="Vous" 
            className="comment-avatar"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/40?text=User';
            }}
            style={{ cursor: 'auto' }}
          />
          <input
            type="text"
            placeholder="Écrire un commentaire..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="comment-input"
            style={{ cursor: 'text' }}
          />
          <button 
            type="submit" 
            disabled={submitting || !commentText.trim()}
            className="comment-submit-btn"
            style={{ cursor: submitting || !commentText.trim() ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? '...' : 'Envoyer'}
          </button>
        </form>

        <div className="comments-list">
          {loading ? (
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
                  style={{ cursor: 'auto' }}
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
    </div>
  );
};

export default CommentWidget;