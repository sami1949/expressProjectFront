import React, { useState } from 'react';
import { postService } from '../../services/postService';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import './PublicationForm.css';

const PublicationForm = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const currentUser = authService.getCurrentUser();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      // For now, send as JSON. Image upload will be handled later with proper file upload
      const postData = {
        contenu: content.trim(),
        image: preview || null // For now, just send the base64 if available
      };

      const result = await postService.createPost(postData);
      if (result.success) {
        onPostCreated(result.data);
        setContent('');
        setImage(null);
        setPreview(null);
      }
    } catch (error) {
      console.error('Erreur création post:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="publication-form">
      <div className="form-header">
        <img 
          src={currentUser?.photo || '/default-avatar.jpg'} 
          alt="Profil" 
          className="author-avatar"
        />
        <div className="form-info">
          <h4 className="author-name">
            {currentUser?.prenom} {currentUser?.nom}
          </h4>
          <select className="privacy-select">
            <option value="public">🌐 Public</option>
            <option value="friends">👥 Amis seulement</option>
            <option value="private">🔒 Privé</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          className="post-content"
          placeholder={`Quoi de neuf, ${currentUser?.prenom} ?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
        />

        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            <button 
              type="button" 
              className="remove-image"
              onClick={() => {
                setImage(null);
                setPreview(null);
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div className="form-actions">
          <div className="action-buttons">
            <label className="action-btn photo-btn">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
              📷 Photo/Video
            </label>
            
            <button type="button" className="action-btn feeling-btn">
              😊 Humeur
            </button>
          </div>

          <button 
            type="submit" 
            className="publish-btn"
            disabled={loading || !content.trim()}
          >
            {loading ? 'Publication...' : 'Publier'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublicationForm;